import { Job } from 'bull';

/**
 * SMS Notification Job Processor
 * Handles all SMS sending operations asynchronously
 */

export interface SMSJobData {
  type: string;
  phone: string;
  message: string;
  data?: any;
}

/**
 * Process SMS job
 */
export const processSMSJob = async (job: Job<SMSJobData>) => {
  const { type, phone, message } = job.data;
  
  console.log(`📱 Processing SMS job: ${type} to ${phone}`);

  try {
    switch (type) {
      case 'otp':
        await sendOTPSMS(phone, message);
        break;
      
      case 'order-confirmation':
        await sendOrderConfirmationSMS(phone, message);
        break;
      
      case 'order-status-update':
        await sendOrderStatusSMS(phone, message);
        break;
      
      case 'subscription-reminder':
        await sendSubscriptionReminderSMS(phone, message);
        break;
      
      case 'delivery-notification':
        await sendDeliveryNotificationSMS(phone, message);
        break;
      
      default:
        await sendGenericSMS(phone, message);
    }

    console.log(`✅ SMS sent: ${type} to ${phone}`);
  } catch (error: any) {
    console.error(`❌ SMS failed: ${type} to ${phone}`, error);
    throw error;
  }
};

/**
 * Send OTP SMS
 */
const sendOTPSMS = async (phone: string, message: string) => {
  // TODO: Integrate with SMS provider (Twilio, AWS SNS, MSG91, etc.)
  console.log(`
    📱 OTP SMS
    To: ${phone}
    Message: ${message}
  `);
  
  // Simulated SMS send
  // await smsProvider.send({
  //   to: phone,
  //   message,
  //   type: 'otp'
  // });
};

/**
 * Send order confirmation SMS
 */
const sendOrderConfirmationSMS = async (phone: string, message: string) => {
  console.log(`
    📱 ORDER CONFIRMATION SMS
    To: ${phone}
    Message: ${message}
  `);
};

/**
 * Send order status SMS
 */
const sendOrderStatusSMS = async (phone: string, message: string) => {
  console.log(`
    📱 ORDER STATUS SMS
    To: ${phone}
    Message: ${message}
  `);
};

/**
 * Send subscription reminder SMS
 */
const sendSubscriptionReminderSMS = async (phone: string, message: string) => {
  console.log(`
    📱 SUBSCRIPTION REMINDER SMS
    To: ${phone}
    Message: ${message}
  `);
};

/**
 * Send delivery notification SMS
 */
const sendDeliveryNotificationSMS = async (phone: string, message: string) => {
  console.log(`
    📱 DELIVERY NOTIFICATION SMS
    To: ${phone}
    Message: ${message}
  `);
};

/**
 * Send generic SMS
 */
const sendGenericSMS = async (phone: string, message: string) => {
  console.log(`
    📱 GENERIC SMS
    To: ${phone}
    Message: ${message}
  `);
};

/**
 * Format phone number for SMS provider
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (India +91)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  return `+${cleaned}`;
};

export default processSMSJob;


