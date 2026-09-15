const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { logError } = require('../utils/logger');

const logger = {
  error: (message, meta = {}) => {
    const log = { timestamp: new Date().toISOString(), level: 'error', message, ...meta };
    console.error(JSON.stringify(log));
  },
  warn: (message, meta = {}) => {
    const log = { timestamp: new Date().toISOString(), level: 'warn', message, ...meta };
    console.warn(JSON.stringify(log));
  },
  info: (message, meta = {}) => {
    const log = { timestamp: new Date().toISOString(), level: 'info', message, ...meta };
    console.log(JSON.stringify(log));
  },
};

module.exports = {
  logError: (error, meta = {}) => logger.error(error?.message || String(error), { stack: error?.stack, ...meta }),
  logWarn: (message, meta = {}) => logger.warn(message, meta),
  logInfo: (message, meta = {}) => logger.info(message, meta),
};
