const multer = require('multer');
const path = require('path');
console.log(">>> UPLOAD MIDDLEWARE LOADED <<<");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsRoot = path.resolve(__dirname, '..', 'uploads');
        if (file.fieldname === 'miniatura') {
            cb(null, path.join(uploadsRoot, 'covers'));
        } else if (file.fieldname === 'audio_preview') {
            cb(null, path.join(uploadsRoot, 'previews'));
        } else {
            cb(null, uploadsRoot);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'miniatura': ['image/jpeg', 'image/png', 'image/webp'],
        'audio_preview': ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg']
    };
    const fieldTypes = allowedTypes[file.fieldname];
    if (fieldTypes && !fieldTypes.includes(file.mimetype)) {
        return cb(new Error(`Tipo de archivo no permitido para ${file.fieldname}.`), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = upload;
