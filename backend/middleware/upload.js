const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
require('dotenv').config();

const UPLOAD_DIR  = process.env.UPLOAD_DIR || 'uploads';
const MAX_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 10;
const ALLOWED_EXT = ['.pdf','.docx','.txt'];

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive:true });

const storage = multer.diskStorage({
  destination: (_req,_file,cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g,'_')}`),
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  ALLOWED_EXT.includes(ext) ? cb(null,true) : cb(new Error(`Unsupported type: ${ext}`));
};

const limits = { fileSize: MAX_SIZE_MB * 1024 * 1024 };
const wrap   = up => (req,res,next) => up(req,res,err => err ? res.status(400).json({success:false,message:err.message}) : next());

module.exports = {
  uploadSingle:   wrap(multer({storage,fileFilter,limits}).single('resume')),
  uploadMultiple: wrap(multer({storage,fileFilter,limits}).array('resumes',100)),
};
