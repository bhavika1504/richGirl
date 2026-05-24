import axios from 'axios';

/**
 * Sends a WhatsApp notification to a customer using the WhatsApp Business Cloud API.
 * Safely falls back to terminal simulation logging if API tokens are not configured in .env.
 * 
 * @param {string} to - The customer's 10-digit mobile phone number
 * @param {string} messageText - The body text to transmit
 */
export async function sendWhatsAppMessage(to, messageText) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Standardize phone number format for India (+91)
  let formattedPhone = to.trim().replace(/[^0-9]/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }

  console.log(`\n--- 📱 [WHATSAPP OUTGOING NOTIFICATION] ---`);
  console.log(`To: +${formattedPhone}`);
  console.log(`Message: "${messageText}"`);

  if (!token || !phoneNumberId || token.includes('your_') || phoneNumberId.includes('your_')) {
    console.log(`Status: [SIMULATION MODE] (Please configure WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in server/.env to go live)`);
    console.log(`-----------------------------------------\n`);
    return { success: true, simulated: true };
  }

  try {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { body: messageText }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Status: [SENT VIA META API] Response ID: ${response.data?.messages?.[0]?.id}`);
    console.log(`-----------------------------------------\n`);
    return { success: true, messageId: response.data?.messages?.[0]?.id };
  } catch (error) {
    console.error(`Status: [FAILED] Meta Graph API error:`, error.response?.data || error.message);
    console.log(`-----------------------------------------\n`);
    return { success: false, error: error.message };
  }
}
