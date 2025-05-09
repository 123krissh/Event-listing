const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeEvents() {
  try {
    const url = 'https://www.eventbrite.com.au/d/australia--sydney/events/';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const $ = cheerio.load(data);
    const events = [];

    // Updated selectors based on the new structure
    $('div.eds-g-cell').each((i, el) => {
      const card = $(el);
      const title = card.find('.Typography_root__487rx.event-card__clamp-line--two').text().trim();
      const link = card.find('a.event-card-link').attr('href');
      const date = card.find('.Typography_root__487rx.Typography_body-md-bold__487rx').text().trim();
      const location = card.find('.Typography_root__487rx.Typography_body-md__487rx.event-card__clamp-line--one').text().trim();
      const image = card.find('img.event-card-image').attr('src');

      if (title && link) {
        events.push({ title, link, date, location, image });
      }
    });

    return events.slice(0, 50); // Top 50 events
  } catch (err) {
    console.error('Scraping failed:', err.message);
    return [];
  }
}

module.exports = scrapeEvents;
