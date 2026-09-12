const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function executeCleanup() {
  await mongoose.connect('mongodb+srv://shubhangimahajan2311:GxdOp8q2rOtiyyna@cluster0.zh5nxfb.mongodb.net/project-crm');
  
  const User = require('./src/models/User');

  // The 3 users to explicitly preserve
  const preservedEmails = [
    'riya2311@gmail.com',
    'mahajan2311@gmail.com',
    'test2@example.com'
  ];

  // 1. Find all users that are NOT in the preserved list
  const usersToDelete = await User.find({ email: { $nin: preservedEmails } }).lean();
  
  if (usersToDelete.length !== 9) {
    console.error(`ERROR: Expected exactly 9 users to delete, but found ${usersToDelete.length}. Aborting to be safe.`);
    process.exit(1);
  }

  // 2. Backup these users to a JSON file
  const backupPath = path.join(__dirname, 'users_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(usersToDelete, null, 2));
  console.log(`Successfully backed up ${usersToDelete.length} users to ${backupPath}`);

  // 3. Delete the users
  const deleteResult = await User.deleteMany({ email: { $nin: preservedEmails } });
  console.log(`Successfully deleted ${deleteResult.deletedCount} users from MongoDB.`);

  // 4. Verify remaining user count
  const remainingCount = await User.countDocuments();
  console.log(`Remaining users in DB: ${remainingCount}`);
  if (remainingCount !== 3) {
    console.error(`WARNING: Expected 3 users remaining, found ${remainingCount}.`);
  } else {
    console.log('Success: Exactly 3 referenced users remain.');
  }

  process.exit(0);
}

executeCleanup().catch(console.error);
