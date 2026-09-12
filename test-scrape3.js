const cheerio = require('cheerio');
async function fetchPage(page) {
  const res = await fetch(`https://libgen.li/index.php?req=sci-fi&page=${page}`, {headers: {'User-Agent': 'Mozilla/5.0'}});
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $('table tbody tr').eq(1).find('td').eq(0).text().trim();
  console.log(`Page ${page} first item:`, title.substring(0, 50));
}
fetchPage(1).then(() => fetchPage(2));
