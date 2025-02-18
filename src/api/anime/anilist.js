const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

async function populer() {
    try {
        const url = 'https://anilist.co';
        const response = await axios.get(url);
        const html = response.data;

        const $ = cheerio.load(html);

        const trending = $('.landing-section.trending .results .media-card')
            .map((index, element) => {
                const title = $(element).find('.title').text().trim();
                const link = url + $(element).find('a.cover').attr('href');
                const image = $(element).find('img.image').attr('src');

                return { title, link, image };
            })
            .get();

        const populer = $('.landing-section.season .results .media-card')
            .map((index, element) => {
                const title = $(element).find('.title').text().trim();
                const link = url + $(element).find('a.cover').attr('href');
                const image = $(element).find('img.image').attr('src');

                return { title, link, image };
            })
            .get();

        const upcoming = $('.landing-section.nextSeason .results .media-card')
            .map((index, element) => {
                const title = $(element).find('.title').text().trim();
                const link = url + $(element).find('a.cover').attr('href');
                const image = $(element).find('img.image').attr('src');

                return { title, link, image };
            })
            .get();

        const top = $('.landing-section.top .results .media-card')
            .map((index, element) => {
                const rank = $(element).find('.rank').text().trim();
                const title = $(element).find('.title').text().trim();
                const link = url + $(element).find('a.cover').attr('href');
                const image = $(element).find('img.image').attr('src');

                return { rank, title, link, image };
            })
            .get();

        return {
            trending,
            populer,
            upcoming,
            top,
        };
    } catch (error) {
        console.error('Error scraping AniList:', error);
        return null;
    }
}

async function search(q) {
    try {
        const { data } = await axios.get(`https://anilist.co/search/anime?query=${encodeURIComponent(q)}`);
        const $ = cheerio.load(data);

        const results = [];

        $('.media-card').each((index, element) => {
            const title = $(element).find('.title').text().trim();
            const imageUrl = $(element).find('.image').attr('src');
            const link = $(element).find('.cover').attr('href');

            if (title && imageUrl && link) {
                results.push({
                    title,
                    imageUrl,
                    link: `https://anilist.co${link}` // Adding domain to the link
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function translate(text, lang = 'id') {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        const hasil = data[0][0][0];
        return { status: true, result: { tr: hasil } };
    } catch {
        return { status: false, result: { tr: text } };
    }
}

async function detail(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const cleanText = (text) => text.replace(/\n\s+/g, ' ').trim();

        const safeTranslate = async (text) => {
            const translation = await translate(text);
            return translation.result.tr;
        };

        const descriptionText = cleanText($('.description.content-wrap').text());
        const descriptionParagraphs = descriptionText.split('\n').filter(p => p.trim() !== '');
        const translatedParagraphs = await Promise.all(
            descriptionParagraphs.map(paragraph => safeTranslate(paragraph))
        );

        const results = {
            title: {
                romaji: cleanText($('.content h1').first().text()),
                english: cleanText($('div.data-set:contains("English") .value').text()),
                native: cleanText($('div.data-set:contains("Native") .value').text()),
                translated: {
                    romaji: await safeTranslate(cleanText($('.content h1').first().text())),
                    english: await safeTranslate(cleanText($('div.data-set:contains("English") .value').text())),
                    native: await safeTranslate(cleanText($('div.data-set:contains("Native") .value').text()))
                }
            },
            description: {
                original: descriptionText,
                translated: translatedParagraphs.join('\n\n'),
                paragraphs: {
                    original: descriptionParagraphs,
                    translated: translatedParagraphs
                }
            },
            cover: $('.cover-wrap-inner .cover').attr('src'),
            banner: $('.banner').css('background-image')
                ? $('.banner').css('background-image').replace(/^url\s*['"]?|['"]?\s*$/g, '') : null,
            details: {
                format: cleanText($('div.data-set:contains("Format") .value').text()),
                episodes: cleanText($('div.data-set:contains("Episodes") .value').text()),
                status: cleanText($('div.data-set:contains("Status") .value').text()),
                season: cleanText($('div.data-set:contains("Season") .value').text()),
                averageScore: cleanText($('div.data-set:contains("Average Score") .value').text()),
                popularity: cleanText($('div.data-set:contains("Popularity") .value').text())
            },
            genres: {
                original: $('div.data-set:contains("Genres") .value a').map((i, el) => cleanText($(el).text())).get().join(', '),
                translated: await Promise.all(
                    $('div.data-set:contains("Genres") .value a').map((i, el) => safeTranslate(cleanText($(el).text()))).get()
                )
            },
            studios: {
                original: $('div.data-set:contains("Studios") .value a').map((i, el) => cleanText($(el).text())).get(),
                translated: await Promise.all(
                    $('div.data-set:contains("Studios") .value a').map((i, el) => safeTranslate(cleanText($(el).text()))).get()
                )
            }
        };

        return results;
    } catch (error) {
        return { error: error.message };
    }
}

// API Route Definitions
module.exports = (app) => {
    // Endpoint for popular, trending, upcoming, and top anime
    app.get('/anime/anilist-populer', async (req, res) => {
        const result = await populer();
        if (result) {
            res.json(result);
        } else {
            res.status(500).json({ error: 'Error fetching popular anime data.' });
        }
    });

    // Endpoint for search functionality (changed query to q)
    app.get('/anime/anilist-search', async (req, res) => {
        const q = req.query.q;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter q is required.' });
        }
        const results = await search(q);
        res.json(results);
    });

    // Endpoint for anime details
    app.get('/anime/anilist-detail', async (req, res) => {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required.' });
        }
        const result = await detail(url);
        if (result.error) {
            res.status(500).json({ error: result.error });
        } else {
            res.json(result);
        }
    });
};
