import Settings from '../models/Settings.js';

// Get settings (create if doesn't exist)
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      // Create default settings
      settings = await Settings.create({ singleton: true });
    }

    // Don't send sensitive data to client
    const settingsData = settings.toObject();
    
    // Mask sensitive keys (show only last 4 characters)
    if (settingsData.razorpayKeySecret) {
      const secret = settingsData.razorpayKeySecret;
      settingsData.razorpayKeySecret = secret.length > 4 
        ? '*'.repeat(secret.length - 4) + secret.slice(-4)
        : '****';
    }
    
    if (settingsData.razorpayWebhookSecret) {
      const webhook = settingsData.razorpayWebhookSecret;
      settingsData.razorpayWebhookSecret = webhook.length > 4 
        ? '*'.repeat(webhook.length - 4) + webhook.slice(-4)
        : '****';
    }

    if (settingsData.stripeSecretKey) {
      const stripe = settingsData.stripeSecretKey;
      settingsData.stripeSecretKey = stripe.length > 4 
        ? '*'.repeat(stripe.length - 4) + stripe.slice(-4)
        : '****';
    }

    if (settingsData.smtpPassword) {
      settingsData.smtpPassword = '********';
    }

    if (settingsData.smsApiKey) {
      const sms = settingsData.smsApiKey;
      settingsData.smsApiKey = sms.length > 4 
        ? '*'.repeat(sms.length - 4) + sms.slice(-4)
        : '****';
    }

    res.status(200).json({
      success: true,
      data: settingsData
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }

    // Update only provided fields
    const allowedFields = [
      'businessName',
      'businessEmail',
      'businessPhone',
      'razorpayKeyId',
      'razorpayKeySecret',
      'razorpayWebhookSecret',
      'razorpayEnabled',
      'stripePublishableKey',
      'stripeSecretKey',
      'stripeEnabled',
      'operatingHours',
      'minOrderValue',
      'maxDeliveryRadius',
      'smtpHost',
      'smtpPort',
      'smtpUser',
      'smtpPassword',
      'emailEnabled',
      'smsApiKey',
      'smsEnabled'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Don't update if masked value is sent
        if (field.includes('Secret') || field.includes('Password') || field.includes('Key')) {
          if (!req.body[field].includes('*')) {
            settings[field] = req.body[field];
          }
        } else {
          settings[field] = req.body[field];
        }
      }
    });

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// Get payment gateway settings (for internal use by payment controller)
export const getPaymentSettings = async () => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }

    return {
      razorpayKeyId: settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '',
      razorpayKeySecret: settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || '',
      razorpayWebhookSecret: settings.razorpayWebhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '',
      razorpayEnabled: settings.razorpayEnabled || false
    };
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
      razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      razorpayEnabled: false
    };
  }
};

// Test payment gateway connection
export const testPaymentGateway = async (req, res) => {
  try {
    const { gateway } = req.body; // 'razorpay' or 'stripe'

    if (gateway === 'razorpay') {
      const settings = await getPaymentSettings();
      
      if (!settings.razorpayKeyId || !settings.razorpayKeySecret) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay credentials not configured'
        });
      }

      // Simple validation - check if keys are not empty
      // In production, you might want to make a test API call to Razorpay
      res.status(200).json({
        success: true,
        message: 'Razorpay credentials are configured',
        data: {
          keyId: settings.razorpayKeyId,
          enabled: settings.razorpayEnabled
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid gateway specified'
      });
    }
  } catch (error) {
    console.error('Error testing payment gateway:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test payment gateway',
      error: error.message
    });
  }
};

