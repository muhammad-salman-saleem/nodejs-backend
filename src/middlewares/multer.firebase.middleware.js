import multer from 'multer';

const multerMemoryStorage = multer.memoryStorage();

const upload = multer({ storage: multerMemoryStorage });

export { upload };
