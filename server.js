const express = require('express');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
const scrapeEvents = require('./scraper');
const logEmail = require('./emailLogger');
const cron = require('node-cron');
require('dotenv').config();


const app = express();
const PORT = 3000;

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup for OTP
app.use(session({
  secret: 'otp-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 } // 10 minutes
}));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


let cachedEvents = [];

// Initial scrape
const fetchAndCacheEvents = async () => {
  cachedEvents = await scrapeEvents();
};
fetchAndCacheEvents();

// Schedule hourly event refresh
cron.schedule('0 * * * *', fetchAndCacheEvents);

// Home route
app.get('/', (req, res) => {
  res.render('index', { events: cachedEvents });
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).send('Invalid email');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.otp = otp;
  req.session.email = email;

  try {
    await transporter.sendMail({
      from: `"Event Listing" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Event Listing',
      text: `Your OTP is ${otp}`,
    });
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ OTP Email failed:', error);
    res.status(500).send('Failed to send OTP');
  }
});

app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (req.session.otp && otp === req.session.otp) {
    logEmail(req.session.email);
    req.session.verified = true;
    res.sendStatus(200);
  } else {
    res.status(400).send('Invalid OTP');
  }
});


// Legacy direct email logging (optional to keep)
app.post('/log-email', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).send('Invalid email');
  }
  logEmail(email);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});









// const express = require('express');
// const path = require('path');
// const scrapeEvents = require('./scraper');
// const logEmail = require('./emailLogger');
// const cron = require('node-cron');
// const session = require('express-session');
// const nodemailer = require('nodemailer');


// const app = express();
// const PORT = 3000;

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// let cachedEvents = [];

// // Scrape events initially
// const fetchAndCacheEvents = async () => {
//   cachedEvents = await scrapeEvents();
// };
// fetchAndCacheEvents();

// // Schedule to refresh events every hour
// cron.schedule('0 * * * *', fetchAndCacheEvents);

// // Home route
// app.get('/', (req, res) => {
//   res.render('index', { events: cachedEvents });
// });

// // Email logging route
// app.post('/log-email', (req, res) => {
//   const { email } = req.body;
//   if (!email || !email.includes('@')) {
//     return res.status(400).send('Invalid email');
//   }
//   logEmail(email);
//   res.sendStatus(200);
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server is running on http://localhost:${PORT}`);
// });
