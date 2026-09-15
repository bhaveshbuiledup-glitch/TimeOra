const express = require('express');
const router = express.Router();
const { logInfo } = require('../utils/logger');
const { TaxConfig, ShippingConfig, Setting } = require('../models/Setting');

router.get('/tax', async (req, res) => {
  try {
    const config = await TaxConfig.findOne().sort({ createdAt: -1 }).exec();
    res.json({ success: true, taxRate: config?.taxRate || 0.18, taxName: config?.taxName || 'GST' });
  } catch (error) {
    logInfo('Tax config error', { error: error.message });
    res.json({ success: true, taxRate: 0.18, taxName: 'GST' });
  }
});

router.put('/tax', async (req, res) => {
  try {
    const { taxRate, taxName } = req.body;
    let config = await TaxConfig.findOne();
    if (config) {
      config.taxRate = taxRate;
      config.taxName = taxName || 'GST';
      await config.save();
    } else {
      config = await TaxConfig.create({ taxRate, taxName });
    }
    res.json({ success: true, config });
  } catch (error) {
    logInfo('Tax update error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/shipping', async (req, res) => {
  try {
    const config = await ShippingConfig.findOne().sort({ createdAt: -1 }).exec();
    res.json({
      success: true,
      freeShippingThreshold: config?.freeShippingThreshold || 5000,
      standardRate: config?.standardRate || 200,
      expressRate: config?.expressRate || 500,
    });
  } catch (error) {
    res.json({ success: true, freeShippingThreshold: 5000, standardRate: 200, expressRate: 500 });
  }
});

router.put('/shipping', async (req, res) => {
  try {
    const updates = req.body;
    let config = await ShippingConfig.findOne();
    if (config) {
      Object.assign(config, updates);
      await config.save();
    } else {
      config = await ShippingConfig.create(updates);
    }
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
