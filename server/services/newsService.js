import Parser from 'rss-parser';
import axios from 'axios';
import cheerio from 'cheerio';
import NodeCache from 'node-cache';
import { z } from 'zod';
import crypto from 'crypto';

const parser = new Parser();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

const newsSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  date: z.string(),
  content: z.string(),
  imageUrl: z.string().url(),
  location: z.string(),
  category: z.enum(['active', 'contained', 'prevention']),
  url: z.string().url()
});

const NEWS_SOURCES = [
  {
    name: 'Algeria Press Service',
    url: 'https://www.echoroukonline.com/feed',
    type: 'rss'
  },
  {
    name: 'El Watan',
    url: 'https://www.elwatan.com',
    type: 'scrape',
    selector: '.article-item'
  }
];

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function extractImageFromContent(content) {
  if (!content) return 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf';
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf';
}

function extractImageUrl($element) {
  const imgSrc = $element.find('img').attr('src');
  return imgSrc || 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf';
}

function extractLocation(text) {
  const algerianCities = [
    'Algiers', 'Oran', 'Constantine', 'Batna', 'Djelfa', 'Sétif', 'Annaba', 'Sidi Bel Abbès',
    'Biskra', 'Tébessa', 'Tizi Ouzou', 'Béjaïa', 'Médéa'
  ];
  
  for (const city of algerianCities) {
    if (text.includes(city)) return city;
  }
  
  return 'Algeria';
}

async function parseRSSFeed(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return feed.items.map(item => ({
      id: generateId(),
      title: item.title,
      source: source.name,
      date: new Date(item.pubDate).toISOString(),
      content: item.contentSnippet || item.content,
      imageUrl: extractImageFromContent(item.content),
      location: extractLocation(item.title + ' ' + (item.contentSnippet || item.content)),
      category: categorizeNews(item.title, item.contentSnippet || item.content),
      url: item.link
    }));
  } catch (error) {
    console.error(`Error parsing RSS feed from ${source.name}:`, error);
    return [];
  }
}

async function scrapePage(source) {
  try {
    const { data } = await axios.get(source.url);
    const $ = cheerio.load(data);
    const articles = [];

    $(source.selector).each((_, element) => {
      const $element = $(element);
      articles.push({
        id: generateId(),
        title: $element.find('h2').text().trim(),
        source: source.name,
        date: new Date().toISOString(),
        content: $element.find('p').text().trim(),
        imageUrl: extractImageUrl($element),
        location: extractLocation($element.text()),
        category: categorizeNews($element.find('h2').text(), $element.find('p').text()),
        url: new URL($element.find('a').attr('href'), source.url).toString()
      });
    });

    return articles;
  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error);
    return [];
  }
}

function categorizeNews(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes('contained') || text.includes('controlled')) return 'contained';
  if (text.includes('prevention') || text.includes('awareness')) return 'prevention';
  return 'active';
}

export function setupNewsFeeds(io) {
  async function fetchAndUpdateNews() {
    try {
      const allNews = [];

      for (const source of NEWS_SOURCES) {
        const news = source.type === 'rss' 
          ? await parseRSSFeed(source)
          : await scrapePage(source);
        
        allNews.push(...news);
      }

      // Validate and filter news
      const validNews = allNews
        .map(news => {
          try {
            return newsSchema.parse(news);
          } catch (error) {
            console.error('Invalid news item:', error);
            return null;
          }
        })
        .filter(Boolean);

      // Update cache
      cache.set('news', validNews);

      // Emit new alerts
      const currentNews = cache.get('news') || [];
      const newAlerts = validNews.filter(
        news => !currentNews.some(existing => existing.id === news.id)
      );

      newAlerts.forEach(alert => {
        io.emit('newAlert', alert);
      });

    } catch (error) {
      console.error('Error updating news feeds:', error);
    }
  }

  // Initial fetch
  fetchAndUpdateNews();

  // Update every 5 minutes
  setInterval(fetchAndUpdateNews, 5 * 60 * 1000);
}

export function getNews(search, category) {
  let news = cache.get('news') || [];

  if (search) {
    const searchLower = search.toLowerCase();
    news = news.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower)
    );
  }

  if (category && category !== 'all') {
    news = news.filter(item => item.category === category);
  }

  return news;
}
























// // services/newsService.ts
// import Parser from 'rss-parser';
// import axios from 'axios';
// import cheerio from 'cheerio';

// const NEWS_SOURCES = [
//   {
//     name: 'Algeria Press Service',
//     url: 'http://www.aps.dz/en/feed',
//     type: 'rss'
//   },
//   {
//     name: 'Echorouk Online',
//     url: 'https://www.echoroukonline.com',
//     type: 'scrape',
//     selector: '.article'
//   },
//   {
//     name: 'El Watan',
//     url: 'https://www.elwatan.com',
//     type: 'scrape',
//     selector: '.article-item'
//   },
//   // Add more sources as needed
// ];

// // Add error handling and logging
// const parser = new Parser({
//   timeout: 5000,
//   maxRedirects: 3,
// });

// export async function fetchNewsFromSources() {
//   const allNews = [];

//   for (const source of NEWS_SOURCES) {
//     try {
//       const news = source.type === 'rss' 
//         ? await fetchRSSNews(source)
//         : await scrapeNews(source);
//       allNews.push(...news);
//     } catch (error) {
//       console.error(`Error fetching news from ${source.name}:`, error);
//     }
//   }

//   return allNews;
// }