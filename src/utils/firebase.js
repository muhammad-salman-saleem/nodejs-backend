import admin from 'firebase-admin';
import { FIREBASE_PRIVATE_KEY } from '../contants.js';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

const getFolderPath = (mimetype) => {
  const documentTypes = [
    'application/pdf',
    'application/json',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/rtf', // .rtf
    'text/plain', // .txt
    'application/epub+zip', // .epub
    'application/x-mobipocket-ebook', // .mobi
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  ];
  if (mimetype.startsWith('image/')) {
    return 'images/';
  } else if (documentTypes.includes(mimetype)) {
    return 'documents/';
  } else if (mimetype.startsWith('video/')) {
    return 'videos/';
  } else {
    return 'others/';
  }
};

const uploadOnFirebase = (file) => {
  return new Promise((resolve, reject) => {
    const folderPath = getFolderPath(file.mimetype);
    const blob = bucket.file(`${folderPath}${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      blob.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      }).then((urls) => {
        resolve(urls[0]);
      }).catch((err) => {
        reject(err);
      });
    });

    blobStream.end(file.buffer);
  });
};

export { uploadOnFirebase };
