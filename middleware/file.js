import { Storage } from '@google-cloud/storage';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';


// const dir = "./uploads";

// if (!fs.existsSync(dir)) {
//   fs.mkdirSync(dir);
// }
const expirationDate = new Date();
expirationDate.setFullYear(expirationDate.getFullYear() + 10); // Set expiration to 10 years from now

class MulterError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

// let projectId = "eduzone-391614"; // Get this from Google Cloud
// let keyFilename = path.join(path.join(__dirname, '..', 'eduzone-391614-19b720aa0fa5.json')); // Get this from Google Cloud -> Credentials -> Service Accounts
// const storage = new Storage({
//   projectId,
//   keyFilename,
// });

const serviceAccountKey = {
  type: "service_account",
  project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
  private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com",
};

const storage = new Storage({
  credentials: serviceAccountKey,
});
const bucket = storage.bucket("eduzone");

// Function to get the public URL of a file in Google Cloud Storage
async function getPublicUrl(filePath) {
  const file = bucket.file(filePath);

  try {
    const signedUrls = await file.getSignedUrl({
      action: "read",
      // expires: Date.now() + 60 * 60 * 1000, // 1 hour from now
      expires: expirationDate,
    });

    const url = signedUrls[0];
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL for the file.");
  }
}

export async function convertUrlToImage(req, res, next) {
  const { imageGoogle } = req.body;

  if (imageGoogle) {
    if (imageGoogle.includes("googleusercontent.com")) {
      try {
        const response = await axios.get(imageGoogle, {
          responseType: "arraybuffer",
        });
        const fileName = path.basename(imageGoogle);

        const fileBuffer = Buffer.from(response.data);
        const file = {
          fieldname: "image",
          buffer: fileBuffer,
          originalname: fileName,
          mimetype: response.headers["content-type"],
        };

        req.file = file;
        next();
      } catch (error) {
        // Handle error if the axios request fails
        console.error("Failed to fetch image:", error);
        res.status(500).send("Failed to fetch image");
      }
      return; // Return here to prevent calling next() again
    }
  }
  next();
}

// Middleware for handling file uploads and storing them in Google Cloud Storage
function uploadToGCS(req, res, next) {
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      // Check the file type and reject if it's not an image
      if (!file.mimetype.startsWith("image/")) {
        const error = new MulterError(
          "Only image files are allowed!",
          "INVALID_FILE_TYPE"
        );
        return cb(error);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
    },
  }).array("images", 10); // Limit to 10 files

  upload(req, res, async (err) => {
    if (err instanceof MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.log(err)
      return res.status(500).json({ error: "Internal server error." });
    }

    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const gcsFileName = "image-" + Date.now() + "-" + file.originalname;
      const gcsFilePath = "images/";

      const gcsFile = bucket.file(gcsFilePath + gcsFileName);

      const stream = gcsFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          acl: "public-read",
        },
        resumable: false,
      });

      stream.on("error", (err) => {
        console.error("Error uploading to Google Cloud Storage:", err);
        return res.status(500).json({
          error: "Failed to upload file to Google Cloud Storage.",
        });
      });

      stream.on("finish", async () => {
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFilePath}${gcsFileName}`;
        console.log("File uploaded to Google Cloud Storage:", imageUrl);
        uploadedImages.push(imageUrl);

        if (uploadedImages.length === req.files.length) {
          req.uploadedImages = uploadedImages;
          next();
        }
      });

      stream.end(file.buffer);
    }
  });
}

export const extractFile = uploadToGCS;
