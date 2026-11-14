const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { pool } = require('./db');
const registerSchema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[\p{L}\p{N}_-]+$/u),
  email: z.string().trim().email().max(254), password: z.string().min(10).max(72)
});
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(72) });
function issueToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TTL || '7d', issuer: 'world-dominion', audience: 'world-dominion-client'
  });
}
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { issuer: 'world-dominion', audience: 'world-dominion-client' });
}
async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'اطلاعات ثبت‌نام معتبر نیست.' });
  const { username, email, password } = parsed.data;
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query('INSERT INTO users(username,email,password_hash) VALUES($1,lower($2),$3) RETURNING id,username,email,created_at', [username,email,hash]);
    const user = result.rows[0]; return res.status(201).json({ user, token: issueToken(user) });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'نام کاربری یا ایمیل قبلاً ثبت شده است.' });
    console.error('[auth/register]', err); return res.status(500).json({ error: 'خطای داخلی سرور' });
  }
}
async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'ایمیل یا رمز عبور معتبر نیست.' });
  const { email,password } = parsed.data;
  const result = await pool.query('SELECT id,username,email,password_hash FROM users WHERE email=lower($1)', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password,user.password_hash))) return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است.' });
  delete user.password_hash; return res.json({ user, token: issueToken(user) });
}
function requireAuth(req,res,next) {
  try { const h=req.headers.authorization||''; const token=h.startsWith('Bearer ')?h.slice(7):''; if(!token)return res.status(401).json({error:'ابتدا وارد حساب شوید.'}); req.user=verifyToken(token); next(); }
  catch { return res.status(401).json({error:'نشست نامعتبر یا منقضی شده است.'}); }
}
module.exports = { register,login,requireAuth,verifyToken };
