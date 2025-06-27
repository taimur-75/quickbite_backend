const express = require('express');
const axios = require('axios'); // npm install axios
const router = express.Router(); // Use express.Router()

// The image proxy route
// When mounted with app.use('/api/image_proxy', imageProxyRouter),
// this route will be accessible at /api/image_proxy/:fileId
router.get('/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    const cleanFileId = fileId.trim(); // Always good to clean inputs
    const googleDriveDirectLink = `https://drive.google.com/uc?export=view&id=${cleanFileId}`;

    try {
        const response = await axios.get(googleDriveDirectLink, {
            responseType: 'arraybuffer' // Get the image as a binary buffer
        });

        const contentType = response.headers['content-type'] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', response.headers['content-length']);
        // IMPORTANT: The Access-Control-Allow-Origin header is explicitly set here
        // for the *image response*. This is what solves the CORB issue.
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL); // Your frontend's URL
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Optional: Cache images for a year

        res.send(response.data); // Send the image buffer back
    } catch (error) {
        console.error(`Error fetching image from Google Drive for ID ${cleanFileId}:`, error.message);
        // It's good to log the actual Google Drive URL that failed for debugging
        console.error(`Attempted Google Drive URL: ${googleDriveDirectLink}`);
        res.status(404).send('Image not found or accessible via proxy');
    }
});

module.exports = router; // Export the router