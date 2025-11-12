const admin = require('firebase-admin');
// const geminiService = require('../services/geminiService'); // No longer needed
const fs = require('fs');
require('dotenv').config();

// --- NEW: Import and configure Cloudinary ---
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// --- END NEW ---

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function uploadToGemini(req, res) {
  const { tags, user, location, lat, lng } = req.body;
  // const prompt = JSON.stringify(tags); // No longer needed
    
  const imagePath = req.file.path;

  try {
    
    // --- Upload photo to Cloudinary ---
    const cloudinaryUploadResult = await cloudinary.uploader.upload(imagePath, {
      folder: "civichub_issues" 
    });
    const newPhotoUrl = cloudinaryUploadResult.secure_url;
    // --- END Upload ---

    // --- GEMINI AI IS NOW DISABLED ---
    // const uploadedFile = await geminiService.uploadToGemini(imagePath, req.file.mimetype);
    // const chatSession = geminiService.model.startChat({ ... });
    // const chatSession_severity = geminiService.model_severity.startChat({ ... });
    // const result = await chatSession.sendMessage(prompt);
    // const department = result.response.text().replace(/\s+$/, '').trim();
    // const result_severity = await chatSession_severity.sendMessage(prompt);
    // const severity = result_severity.response.text().replace(/\s+$/, '').trim().toLowerCase();

    // --- NEW: Add hard-coded values ---
    const department = "General";
    const severity = "low";
    // --- END NEW ---

    console.log(severity);
    console.log(department);

    const date = new Date();
    
    await db.collection('IssueDetails').add({
      user,
      date,
      department,
      location,
      lat,
      lng,
      tags,
      severity,
      photoUrl: newPhotoUrl, // Use the Cloudinary URL
      progress: 1
    });

    // Delete the temporary local file
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });

    res.status(200).json({ response: department });
  } catch (error) {
    console.error('Error in API call:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  uploadToGemini,
};