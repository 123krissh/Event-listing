const express = require('express');
const path = require('path');
const scrapeEvents = require('./scraper');
const logEmail = require('./emailLogger');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let cachedEvents = [];

// Scrape events initially
const fetchAndCacheEvents = async () => {
  cachedEvents = await scrapeEvents();
};
fetchAndCacheEvents();

// Schedule to refresh events every hour
cron.schedule('0 * * * *', fetchAndCacheEvents);

// Home route
app.get('/', (req, res) => {
  res.render('index', { events: cachedEvents });
});

// Email logging route
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
