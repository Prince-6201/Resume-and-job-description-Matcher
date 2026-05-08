require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const authRouter    = require('./routes/auth');
const resumeRouter  = require('./routes/resume');
const jdRouter      = require('./routes/jd');
const matcherRouter = require('./routes/matcher');
const hrRouter      = require('./routes/hr');

const app  = express();
const PORT = process.env.PORT || 5000;

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors({ origin: ['http://localhost:5173','http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', service: 'ResuMatch API', timestamp: new Date().toISOString() })
);

app.use('/api/auth',   authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/jd',     jdRouter);
app.use('/api/match',  matcherRouter);
app.use('/api/hr',     hrRouter);

app.use((_req, res) => res.status(404).json({ success:false, message:'Route not found' }));
app.use((err,_req,res,_next) => {
  console.error(err);
  res.status(err.status||500).json({ success:false, message:err.message||'Server error' });
});

app.listen(PORT, () => console.log(`🚀 ResuMatch API → http://localhost:${PORT}`));