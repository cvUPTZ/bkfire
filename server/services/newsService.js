import Parser from 'rss-parser';
import axios from 'axios';
import cheerio from 'cheerio';
import NodeCache from 'node-cache';
import { z } from 'zod';
import crypto from 'crypto';

// Initialize RSS parser and cache
const parser = new Parser();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// Schema for validating news articles
const newsSchema = z.object({
  id: z.string(),
  titre: z.string(),
  source: z.string(),
  date: z.string(),
  contenu: z.string(),
  imageUrl: z.string().url(),
  localisation: z.string(),
  categorie: z.enum(['incendie', 'autre']),
  url: z.string().url()
});

// News sources with RSS and scraping options
const SOURCES_ACTUALITÉS = [
  {
    nom: 'Algérie Presse Service',
    url: 'https://www.echoroukonline.com/feed',
    type: 'rss'
  },
  {
    nom: 'El Watan',
    url: 'https://www.elwatan.com',
    type: 'scraping',
    selector: '.article-item'
  }
];

// Function to generate unique IDs
function genererId() {
  return crypto.randomBytes(16).toString('hex');
}

// Extract image URL from content
function extraireImageDepuisContenu(contenu) {
  if (!contenu) return 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf';
  const match = contenu.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf';
}

// Extract image URL for scraped articles
function extraireImageUrl($element) {
  const imgSrc = $element.find('img').attr('src');
  return imgSrc || 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf';
}

// Extract city or default location from text
function extraireLocalisation(texte) {
  const villesAlgeriennes = [
    'Alger', 'Oran', 'Constantine', 'Batna', 'Djelfa', 'Sétif', 'Annaba', 'Sidi Bel Abbès',
    'Biskra', 'Tébessa', 'Tizi Ouzou', 'Béjaïa', 'Médéa'
  ];

  for (const ville of villesAlgeriennes) {
    if (texte.includes(ville)) return ville;
  }

  return 'Algérie';
}

// Categorize news (focus on fire-related content)
function categoriserActualités(titre, contenu) {
  const texte = `${titre} ${contenu}`.toLowerCase();
  if (texte.includes('incendie') || texte.includes('feu') || texte.includes('brûlure') || texte.includes('forêt')) {
    return 'incendie';
  }
  return 'autre';
}

// Parse RSS feeds
async function parseFluxRSS(source) {
  try {
    const flux = await parser.parseURL(source.url);
    return flux.items.map(item => ({
      id: genererId(),
      titre: item.title,
      source: source.nom,
      date: new Date(item.pubDate).toISOString(),
      contenu: item.contentSnippet || item.content,
      imageUrl: extraireImageDepuisContenu(item.content),
      localisation: extraireLocalisation(item.title + ' ' + (item.contentSnippet || item.content)),
      categorie: categoriserActualités(item.title, item.contentSnippet || item.content),
      url: item.link
    }));
  } catch (error) {
    console.error(`Erreur lors du traitement du flux RSS de ${source.nom} :`, error);
    return [];
  }
}

// Scrape web pages
async function scraperPage(source) {
  try {
    const { data } = await axios.get(source.url);
    const $ = cheerio.load(data);
    const articles = [];

    $(source.selector).each((_, element) => {
      const $element = $(element);
      articles.push({
        id: genererId(),
        titre: $element.find('h2').text().trim(),
        source: source.nom,
        date: new Date().toISOString(),
        contenu: $element.find('p').text().trim(),
        imageUrl: extraireImageUrl($element),
        localisation: extraireLocalisation($element.text()),
        categorie: categoriserActualités($element.find('h2').text(), $element.find('p').text()),
        url: new URL($element.find('a').attr('href'), source.url).toString()
      });
    });

    return articles;
  } catch (error) {
    console.error(`Erreur lors du scraping de ${source.nom} :`, error);
    return [];
  }
}

// Fetch and update fire-related news
export function initialiserFluxActualités(io) {
  async function recupererEtMettreAJourActualités() {
    try {
      const toutesActualités = [];

      for (const source of SOURCES_ACTUALITÉS) {
        const actualités = source.type === 'rss'
          ? await parseFluxRSS(source)
          : await scraperPage(source);

        toutesActualités.push(...actualités);
      }

      // Validate and filter fire-related news
      const actualitésValides = toutesActualités
        .map(news => {
          try {
            return newsSchema.parse(news);
          } catch (error) {
            console.error('Article invalide :', error);
            return null;
          }
        })
        .filter(Boolean);

      const actualitésIncendie = actualitésValides.filter(item => item.categorie === 'incendie');

      // Update cache
      cache.set('actualités', actualitésIncendie);

      // Emit new fire alerts
      const actualitésCourantes = cache.get('actualités') || [];
      const nouvellesAlertes = actualitésIncendie.filter(
        news => !actualitésCourantes.some(existant => existant.id === news.id)
      );

      nouvellesAlertes.forEach(alerte => {
        io.emit('alerteIncendie', alerte);
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour des flux d’actualités :', error);
    }
  }

  // Initial fetch
  recupererEtMettreAJourActualités();

  // Update every 5 minutes
  setInterval(recupererEtMettreAJourActualités, 5 * 60 * 1000);
}

// Get fire-related news
export function obtenirActualités(recherche, categorie = 'incendie') {
  let actualités = cache.get('actualités') || [];

  if (recherche) {
    const rechercheMinuscule = recherche.toLowerCase();
    actualités = actualités.filter(item =>
      item.titre.toLowerCase().includes(rechercheMinuscule) ||
      item.contenu.toLowerCase().includes(rechercheMinuscule) ||
      item.localisation.toLowerCase().includes(rechercheMinuscule)
    );
  }

  if (categorie && categorie !== 'tout') {
    actualités = actualités.filter(item => item.categorie === categorie);
  }

  return actualités;
}
