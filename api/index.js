// Vercel Serverless Entry Point — wraps Express app for serverless execution
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

module.exports = require('../server/server.js');
