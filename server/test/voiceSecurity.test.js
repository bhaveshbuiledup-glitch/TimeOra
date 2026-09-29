const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateTwilioRequest, router } = require('../routes/voiceRoutes');
const { isAffirmative } = require('../services/voiceBridge');
const { isConfiguredBusinessNumber } = require('../providers/twilioVoice');

test('Twilio webhook validation accepts a valid provider signature only', () => {
  const previous = {
    token: process.env.TWILIO_AUTH_TOKEN,
    baseUrl: process.env.TWILIO_PUBLIC_BASE_URL,
  };
  process.env.TWILIO_AUTH_TOKEN = 'test-twilio-auth-token';
  process.env.TWILIO_PUBLIC_BASE_URL = 'https://voice.example.test';
  const body = { CallSid: 'CA12345678901234567890', CallStatus: 'completed' };
  const url = 'https://voice.example.test/api/voice/status';
  const signature = twilio.getExpectedTwilioSignature(process.env.TWILIO_AUTH_TOKEN, url, body);
  const req = {
    originalUrl: '/api/voice/status',
    body,
    get: (name) => name.toLowerCase() === 'x-twilio-signature' ? signature : undefined,
  };

  try {
    assert.equal(validateTwilioRequest(req), true);
    req.get = () => 'invalid-signature';
    assert.equal(validateTwilioRequest(req), false);
  } finally {
    if (previous.token === undefined) delete process.env.TWILIO_AUTH_TOKEN;
    else process.env.TWILIO_AUTH_TOKEN = previous.token;
    if (previous.baseUrl === undefined) delete process.env.TWILIO_PUBLIC_BASE_URL;
    else process.env.TWILIO_PUBLIC_BASE_URL = previous.baseUrl;
  }
});

test('voice admin endpoints reject requests without authentication', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/voice', router);
  const server = app.listen(0);
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/voice/admin/calls`);
    assert.equal(response.status, 401);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('voice admin endpoints reject an authenticated regular customer', async () => {
  const originalFindById = User.findById;
  User.findById = () => ({ select: async () => ({ _id: '507f1f77bcf86cd799439011', role: 'user' }) });
  const app = express();
  app.use(express.json());
  app.use('/api/voice', router);
  const server = app.listen(0);
  try {
    const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET || 'timeora_super_secret_jwt_horology_key_2024');
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/voice/admin/calls`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 403);
  } finally {
    User.findById = originalFindById;
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('spoken confirmation accepts explicit English, Hindi, and Gujarati affirmations only', () => {
  assert.equal(isAffirmative('Yes.'), true);
  assert.equal(isAffirmative('हाँ'), true);
  assert.equal(isAffirmative('હા'), true);
  assert.equal(isAffirmative('yes, but not yet'), false);
  assert.equal(isAffirmative('no'), false);
});

test('phone readiness matches the configured business number', () => {
  const previous = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    keySid: process.env.TWILIO_API_KEY_SID,
    keySecret: process.env.TWILIO_API_KEY_SECRET,
    voiceAppSid: process.env.TWILIO_VOICE_APP_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    publicUrl: process.env.TWILIO_PUBLIC_BASE_URL,
    phone: process.env.TWILIO_PHONE_NUMBER,
    openAi: process.env.OPENAI_API_KEY,
  };
  Object.assign(process.env, {
    TWILIO_ACCOUNT_SID: 'AC123', TWILIO_API_KEY_SID: 'SK123', TWILIO_API_KEY_SECRET: 'secret',
    TWILIO_VOICE_APP_SID: 'AP123', TWILIO_AUTH_TOKEN: 'auth',
    TWILIO_PUBLIC_BASE_URL: 'https://voice.example.test', TWILIO_PHONE_NUMBER: '+14155552671',
    OPENAI_API_KEY: 'test-key',
  });
  try {
    assert.equal(isConfiguredBusinessNumber('+1 (415) 555-2671'), true);
    assert.equal(isConfiguredBusinessNumber('+14155552672'), false);
    process.env.TWILIO_PHONE_NUMBER = 'not-a-phone-number';
    assert.equal(isConfiguredBusinessNumber('+14155552671'), false);
  } finally {
    const restore = (key, value) => value === undefined ? delete process.env[key] : (process.env[key] = value);
    restore('TWILIO_ACCOUNT_SID', previous.accountSid);
    restore('TWILIO_API_KEY_SID', previous.keySid);
    restore('TWILIO_API_KEY_SECRET', previous.keySecret);
    restore('TWILIO_VOICE_APP_SID', previous.voiceAppSid);
    restore('TWILIO_AUTH_TOKEN', previous.authToken);
    restore('TWILIO_PUBLIC_BASE_URL', previous.publicUrl);
    restore('TWILIO_PHONE_NUMBER', previous.phone);
    restore('OPENAI_API_KEY', previous.openAi);
  }
});