const storageService = require('../services/storageService');
const Store = require('../models/Store');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Handles ground evidence image uploads from the mobile app.
 */
const uploadEvidence = async (req, res) => {
  try {
    const { farmId, description, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json(new ApiResponse(400, 'No image file provided'));
    }

    if (!farmId) {
      return res.status(400).json(new ApiResponse(400, 'farmId is required for evidence upload'));
    }

    // 1. Upload to storage service (simulated Cloudinary)
    const uploadResult = await storageService.uploadImage(file, 'evidence');

    // 2. Save metadata to database via Store
    const imageData = {
      imageId: `IMG-${Date.now().toString().slice(-6)}`,
      farmId,
      imageUrl: uploadResult.secure_url,
      uploadedAt: uploadResult.created_at,
      source: 'mobile',
      type: type || 'ground-evidence',
      description: description || 'No description provided'
    };

    const savedImage = await Store.saveFarmImage(imageData);

    return res.status(201).json(new ApiResponse(201, 'Evidence uploaded successfully', savedImage));
  } catch (error) {
    console.error('[Upload Error]:', error);
    return res.status(500).json(new ApiResponse(500, `Upload failed: ${error.message}`));
  }
};

/**
 * Retrieves all images for a specific farm.
 */
const getFarmImages = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await Store.getImagesByFarmId(id);
    return res.status(200).json(new ApiResponse(200, 'Farm images retrieved', images));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error.message));
  }
};

module.exports = {
  uploadEvidence,
  getFarmImages
};
