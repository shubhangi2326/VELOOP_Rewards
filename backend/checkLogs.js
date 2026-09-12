require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./src/models/AuditLog');

async function checkLogs() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
  console.log(`Found ${logs.length} audit logs:`);
  logs.forEach(log => {
    console.log(`[${log.action}] User: ${log.userId}, IP: ${log.ipAddress}`);
    console.log('Details:', log.details);
    console.log('---');
  });
  
  process.exit(0);
}

checkLogs().catch(console.error);
