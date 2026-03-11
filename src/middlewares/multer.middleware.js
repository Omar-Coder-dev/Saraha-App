import multer, { diskStorage } from "multer";
import fs from "fs/promises";
import { resolve } from "path";
export const fileTypes = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/apng",
    "image/avif",
    "image/bmp",
    "image/tiff",
    "image/vnd.microsoft.icon",
  ],
  video: [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/mpeg",
  "video/x-msvideo", // for .avi files
  "video/3gpp",      // for .3gp files
  "video/3gpp2",     // for .3g2 files
  "video/mp2t",      // for .ts (MPEG transport stream)
  "video/x-flv",     // for .flv
  "video/x-matroska" // for .mkv (often used with codecs specified, e.g., video/webm;codecs=vp9)
]
};
export const upload = ({ dest = "general" , validation = fileTypes.image } = {}) => {
  const storage = diskStorage({
    destination: async (req, file, cb) => {
      const finalPath = `./uploads/${dest}`;
      const folderPath = resolve(finalPath);
      try {
        const isFolderExist = await fs.access(folderPath, fs.constants.F_OK);
      } catch (error) {
        await fs.mkdir(folderPath, { recursive: true });
        console.log({ error });
      }
      file.finalPath = finalPath;
      cb(null, finalPath);
    },
    filename: (req, file, cb) => {
      console.log({ file });
      const fileName = `${Date.now()}-${file.originalname}`;
      file.finalPath += `/${fileName}`;

      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
     if (validation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format type"), false);
    }
  }


  return multer({ storage, fileFilter , limits:{
    fileSize: 10 * 1024 * 1024 // 10MB
  } });
};
