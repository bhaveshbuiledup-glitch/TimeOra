const twilio = require('twilio');
const crypto = require('crypto');

const isConfigured = () => Boolean(
  process.env.TWILIO_ACCOUNT_SID
  && process.env.TWILIO_API_KEY_SID
  && process.env.TWILIO_API_KEY_SECRET
  && process.env.TWILIO_VOICE_APP_SID
  && process.env.TWILIO_AUTH_TOKEN
  && process.env.TWILIO_PUBLIC_BASE_URL
  && process.env.OPENAI_API_KEY,
);

const isPhoneConfigured = () => isConfigured() && /^\+[1-9]\d{7,14}$/.test(process.env.TWILIO_PHONE_NUMBER || '');

const isConfiguredBusinessNumber = (candidate) => {
  const digits = (value) => String(value || '').replace(/\D/g, '');
  return isPhoneConfigured() && digits(candidate) === digits(process.env.TWILIO_PHONE_NUMBER);
};

const validateRequest = (req) => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const baseUrl = process.env.TWILIO_PUBLIC_BASE_URL;
  const signature = req.get('x-twilio-signature');
  if (!authToken || !baseUrl || !signature) return false;
  const requestUrl = new URL(req.originalUrl, baseUrl);
  requestUrl.host = new URL(baseUrl).host;
  requestUrl.protocol = new URL(baseUrl).protocol;
  return twilio.validateRequest(authToken, signature, requestUrl.toString(), req.body);
};

const createBrowserToken = () => {
  const accessToken = new twilio.jwt.AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { identity: `timeora-${crypto.randomUUID()}`, ttl: 600 },
  );
  accessToken.addGrant(new twilio.jwt.AccessToken.VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_VOICE_APP_SID,
  }));
  return accessToken.toJwt();
};

const createVoiceResponse = () => new twilio.twiml.VoiceResponse();

const createMediaStreamUrl = (callSid) => {
  const base = process.env.TWILIO_PUBLIC_BASE_URL.replace(/\/$/, '');
  const websocketBase = base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
  return `${websocketBase}/api/voice/stream?callSid=${encodeURIComponent(callSid)}`;
};

module.exports = {
  isConfigured,
  isPhoneConfigured,
  isConfiguredBusinessNumber,
  validateRequest,
  createBrowserToken,
  createVoiceResponse,
  createMediaStreamUrl,
};