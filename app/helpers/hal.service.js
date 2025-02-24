import axios from "axios";

// Hal Auth
const halAuthUrl = process.env.HAL_AUTH_URL;
const AuthBody = {
  username: "kaiymuan_integrate@devclient.hal-logistics.la",
  password: process.env.HAL_PASSWORD,
  client_id: 8,
  client_secret: process.env.HAL_CLIENT_SECRET,
  grant_type: "password",
  scope: "*"
};

// Hal SMS
const sendSmsUrl = process.env.HAL_SMS_URL;
const defaultSmsMessage = 'ລະຫັດ OTP ສຳລັບລົງທະບຽນງານ Vari Virtual Run 2025 ຂອງທ່ານແມ່ນ: ';
const phoneServiceProvider = 'UNITELServiceProvider';

/**
 * Send Otp.
 *
 * @param {*} phone
 *
 * @returns boolean
 */
const sendOtp = async (phone, code, token) => {
    const response = await axios.post(sendSmsUrl, {
      phone_number: phone,
      message: defaultSmsMessage + ' ' + code,
      phone_payment_service_provider: phoneServiceProvider
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  
    if(response.status == '200'){
      return true;
    }

    return false;
};

/**
 * Get Hal Auth Token.
 *
 * @returns string
 */
const getHalAuthToken = async () => {
    const response = await axios.post(halAuthUrl, AuthBody);

    return response?.data?.access_token || "";
}

/**
 * Login and send Otp.
 */
const loginAndSendOtp = async (phone, code) => {
    const token = await getHalAuthToken();
    if(token){
      return await sendOtp(phone, code, token);
    }

    return false;
}

module.exports = {
  sendOtp,
  getHalAuthToken,
  loginAndSendOtp
}
