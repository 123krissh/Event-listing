const fs = require('fs');
const path = require('path');

const emailFilePath = path.join(__dirname, 'email.txt');

function logEmail(email) {
  const entry = `${email}, ${new Date().toISOString()}\n`;
  fs.appendFile(emailFilePath, entry, (err) => {
    if (err) {
      console.error('❌ Failed to log email:', err);
    } else {
      console.log('📩 Email saved to email.txt');
    }
  });
}

module.exports = logEmail;
