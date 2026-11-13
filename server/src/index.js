require('dotenv').config();
const http=require('node:http'); const express=require('express'); const cors=require('cors'); const helmet=require('helmet');
const {Server}=require('socket.io'); const {createAdapter}=require('@socket.io/redis-adapter'); const {createClient}=require('redis'); const {z}=require('zod');
const {pool,migrate}=require('./db'); const {register,login,requireAuth,verifyToken}=require('./auth'); const {createWorld,listWorlds,joinWorld,joinByCode}=require('./worlds');
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must contain at least 32 characters.');
const app=express(),server=http.createServer(app),origins=(process.env.CLIENT_ORIGINS||'*').split(',').map(s=>s.trim());
const io=new Server(server,{cors:{origin:origins.includes('*')?true:origins,methods:['GET','POST']},transports:['websocket','polling'],maxHttpBufferSize:1e6,pingInterval:25000,pingTimeout:20000});
app.disable('x-powered-by'); app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}})); app.use(cors({origin:origins.includes('*')?true:origins})); app.use(express.json({limit:'1mb'}));
app.get('/health',async(_req,res)=>{try{await pool.query('SELECT 1');res.json({ok:true,service:'world-dominion',realtime:'socket.io'});}catch{res.status(503).json({ok:false});}});
app.post('/api/auth/register',register); app.post('/api/auth/login',login); app.get('/api/worlds',requireAuth,listWorlds); app.post('/api/worlds',requireAuth,createWorld); app.post('/api/worlds/:id/join',requireAuth,joinWorld); app.post('/api/worlds/join-by-code',requireAuth,joinByCode); app.post('/api/worlds/join-by-code',requireAuth,joinByCode);
const commandSchema=z.object({type:z.enum(['country:claim','economy:invest','economy:set-tax','diplomacy:offer','diplomacy:accept','diplomacy:reject','trade:offer','trade:accept','alliance:invite','alliance:accept','military:declare-war','military:move','chat:message']),payload:z.record(z.any()).default({})}).strict();
io.use((socket,next)=>{try{const token=socket.handshake.auth?.token;if(!token)throw Error('missing token');const u=verifyToken(token);socket.data.user={id:u.sub,username:u.username};next();}catch{next(new Error('UNAUTHORIZED'));}});
io.on('connection',socket=>{
 socket.on('world:join',async({worldId}={},ack=()=>{})=>{try{
  if(typeof worldId!=='string'||worldId.length>64)return ack({ok:false,error:'شناسه جهان نامعتبر است.'});
  const m=await pool.query('SELECT w.id,w.name,w.status,wm.role FROM worlds w JOIN world_members wm ON wm.world_id=w.id WHERE w.id=$1 AND wm.user_id=$2',[worldId,socket.data.user.id]);
  if(!m.rowCount||m.rows[0].status!=='open')return ack({ok:false,error:'عضویت در این جهان تأیید نشد.'});
  socket.join('world:'+worldId); await pool.query('UPDATE world_members SET last_seen=now() WHERE world_id=$1 AND user_id=$2',[worldId,socket.data.user.id]);
  const s=await pool.query('SELECT revision,state FROM world_state WHERE world_id=$1',[worldId]); ack({ok:true,world:m.rows[0],revision:s.rows[0]?.revision||0,state:s.rows[0]?.state||null});
  socket.to('world:'+worldId).emit('presence:joined',{user:socket.data.user.username});
 }catch(e){console.error('[socket/world:join]',e);ack({ok:false,error:'اتصال به جهان ناموفق بود.'});}});
 socket.on('world:state:save',(_payload,ack=()=>{})=>ack({ok:false,code:'SERVER_AUTHORITY_REQUIRED',error:'ذخیره مستقیم وضعیت جهان از مرورگر غیرفعال است؛ شبیه‌سازی باید سمت سرور اجرا شود.'}));
 socket.on('world:command',async(input,ack=()=>{})=>{const p=commandSchema.safeParse(input);if(!p.success)return ack({ok:false,error:'فرمان نامعتبر است.'});const {type,payload}=p.data;
  if(type!=='chat:message')return ack({ok:false,code:'SIMULATION_NOT_SERVER_AUTHORITY',error:'فرمان بازی هنوز اجرا نمی‌شود؛ ابتدا هسته شبیه‌سازی باید به سرور منتقل شود.'});
  const worldId=String(payload.worldId||''),message=String(payload.message||'').trim().slice(0,500);if(!message)return ack({ok:false,error:'پیام خالی است.'});
  const m=await pool.query('SELECT 1 FROM world_members WHERE world_id=$1 AND user_id=$2',[worldId,socket.data.user.id]);if(!m.rowCount)return ack({ok:false,error:'عضویت تأیید نشد.'});
  const event={type,user:socket.data.user.username,message,at:new Date().toISOString()};io.to('world:'+worldId).emit('world:event',event);ack({ok:true});
 });
});
async function main(){await migrate();if(process.env.REDIS_URL){const pub=createClient({url:process.env.REDIS_URL}),sub=pub.duplicate();await Promise.all([pub.connect(),sub.connect()]);io.adapter(createAdapter(pub,sub));console.log('[realtime] Redis adapter enabled');}else console.warn('[realtime] single instance; configure REDIS_URL for horizontal scaling');const port=Number(process.env.PORT||3000);server.listen(port,'0.0.0.0',()=>console.log('[server] listening on '+port));}
main().catch(e=>{console.error('[startup]',e);process.exit(1);});
process.on('SIGTERM',async()=>{server.close();await pool.end();process.exit(0);});
