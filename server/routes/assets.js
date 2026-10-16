const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Item = require('../models/Item');

// List assets with tracked items count
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      assets.map(async (asset) => {
        const items = await Item.find({ assetName: asset.name, isArchived: false });
        const now = new Date();
        let expired = 0;
        let urgent = 0;
        let good = 0;

        items.forEach((item) => {
          if (item.isResolved) {
            good++;
            return;
          }
          const diff = Math.ceil((new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diff < 0) expired++;
          else if (diff <= 30) urgent++;
          else good++;
        });

        return {
          ...asset.toObject(),
          totalItems: items.length,
          expiredCount: expired,
          urgentCount: urgent,
          goodCount: good,
          items,
        };
      })
    );

    res.json({ success: true, assets: enriched });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create asset
router.post('/', async (req, res) => {
  try {
    const { name, type, identifier, personName, metadata } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Asset name is required' });
    }

    const newAsset = new Asset({
      name,
      type: type || 'Other',
      identifier: identifier || '',
      personName: personName || 'Aswin',
      metadata: metadata || {},
    });

    await newAsset.save();
    res.status(201).json({ success: true, asset: newAsset });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
