import mongoose from 'mongoose';
import Charge from '../models/Charge.js';

const seedCharges = async () => {
  try {
    // Check if charges already exist
    const existingCharges = await Charge.find();
    if (existingCharges.length > 0) {
      console.log('✅ Charges already exist in database');
      return;
    }

    // Add default platform fee
    const platformFee = new Charge({
      name: 'Platform Fee',
      amount: 2,
      type: 'percentage',
      chargeType: 'platform',
      applicableFor: 'both',
      description: 'Platform service fee - 2% of order value',
      isActive: true
    });

    await platformFee.save();
    console.log('✅ Platform Fee added successfully');

  } catch (error) {
    console.error('❌ Error seeding charges:', error);
  }
};

export default seedCharges;


