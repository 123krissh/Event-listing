// const fs = require('fs');
// const path = require('path');

// const emailFilePath = path.join(__dirname, 'email.csv');

// function logEmail(email) {
//   const entry = `${email}, ${new Date().toISOString()}\n`;
//   fs.appendFile(emailFilePath, entry, (err) => {
//     if (err) {
//       console.error('❌ Failed to log email:', err);
//     } else {
//       console.log('📩 Email saved to email.txt');
//     }
//   });
// }

const fs = require('fs');
const path = require('path');

function logEmail(email) {
  const logFilePath = path.join(__dirname, 'email.csv');
  const logLine = `${new Date().toISOString()},${email}\n`;

  let retries = 3;
  while (retries > 0) {
    try {
      fs.appendFileSync(logFilePath, logLine);
      break; // Success
    } catch (err) {
      if (err.code === 'EBUSY') {
        console.warn('File is busy, retrying...');
        retries--;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100); // wait 100ms
      } else {
        console.error('❌ Failed to log email:', err);
        break;
      }
    }
  }
}


module.exports = logEmail;
