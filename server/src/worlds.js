const { z } = require('zod');
const { pool } = require('./db');
const crypto = require('node:crypto');
const createSchema = z.object({ name:z.string().trim().min(3).max(48), mode:z.enum(['persistent','private']), maxPlayers:z.number().int().min(2).max(500).default(150), settings:z.record(z.any()).default({}) });
async function createWorld(req,res) {
  const p=createSchema.safeParse(req.body); if(!p.success)return res.status(400).json({error:'تنظیمات جهان معتبر نیست.'});
  const {name,mode,maxPlayers,settings}=p.data; const inviteCode=mode==='private'?crypto.randomBytes(5).toString('hex').toUpperCase():null; const c=await pool.connect();
  try {
    await c.query('BEGIN');
    const r=await c.query('INSERT INTO worlds(name,mode,max_players,settings,host_user_id,invite_code) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,mode,max_players,status,created_at,invite_code',[name,mode,maxPlayers,JSON.stringify(settings),req.user.sub,inviteCode]);
    const w=r.rows[0]; await c.query("INSERT INTO world_members(world_id,user_id,role) VALUES($1,$2,'owner')",[w.id,req.user.sub]); await c.query('COMMIT');
    res.status(201).json({world:w});
  } catch(e) { await c.query('ROLLBACK'); console.error('[world/create]',e); res.status(500).json({error:'ساخت جهان انجام نشد.'}); }
  finally { c.release(); }
}
async function listWorlds(req,res) {
  const r=await pool.query(`SELECT w.id,w.name,w.mode,w.max_players,w.status,w.created_at,(SELECT count(*)::int FROM world_members m WHERE m.world_id=w.id) AS players FROM worlds w WHERE w.status='open' AND (w.mode='persistent' OR w.host_user_id=$1) ORDER BY w.created_at DESC LIMIT 100`,[req.user.sub]);
  res.json({worlds:r.rows});
}
async function joinWorld(req,res) {
  const id=req.params.id,c=await pool.connect();
  try {
    await c.query('BEGIN'); const wr=await c.query('SELECT * FROM worlds WHERE id=$1 AND status=$2 FOR UPDATE',[id,'open']);
    if(!wr.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'جهان پیدا نشد یا بسته است.'});}
    const w=wr.rows[0]; const existing=await c.query('SELECT 1 FROM world_members WHERE world_id=$1 AND user_id=$2',[id,req.user.sub]);
    const inviteCode=String(req.body?.inviteCode||'').trim().toUpperCase();
    if(w.mode==='private'&&w.host_user_id!==req.user.sub&&!existing.rowCount&&inviteCode!==w.invite_code){await c.query('ROLLBACK');return res.status(403).json({error:'این جهان خصوصی است.'});}
    const count=await c.query('SELECT count(*)::int AS n FROM world_members WHERE world_id=$1',[id]);
    if(!existing.rowCount&&count.rows[0].n>=w.max_players){await c.query('ROLLBACK');return res.status(409).json({error:'ظرفیت این جهان تکمیل است.'});}
    await c.query("INSERT INTO world_members(world_id,user_id,role) VALUES($1,$2,'player') ON CONFLICT(world_id,user_id) DO UPDATE SET last_seen=now()",[id,req.user.sub]);
    const s=await c.query('SELECT revision,state FROM world_state WHERE world_id=$1',[id]); await c.query('COMMIT');
    res.json({world:{id:w.id,name:w.name,mode:w.mode,maxPlayers:w.max_players},state:s.rows[0]?.state||null,revision:s.rows[0]?.revision||0});
  } catch(e) { await c.query('ROLLBACK'); console.error('[world/join]',e); res.status(500).json({error:'ورود به جهان انجام نشد.'}); }
  finally { c.release(); }
}
async function joinByCode(req,res) {
 const code=String(req.body?.inviteCode||'').trim().toUpperCase();
 if(!/^[A-F0-9]{10}$/.test(code))return res.status(400).json({error:'کد دعوت معتبر نیست.'});
 const r=await pool.query("SELECT id FROM worlds WHERE mode='private' AND status='open' AND invite_code=$1",[code]);
 if(!r.rowCount)return res.status(404).json({error:'جهانی با این کد دعوت پیدا نشد.'});
 req.params.id=r.rows[0].id;req.body.inviteCode=code;return joinWorld(req,res);
}
module.exports={createWorld,listWorlds,joinWorld,joinByCode};
