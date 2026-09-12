const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('test.html');
const $ = cheerio.load(html);
const results = [];
$('table tbody tr').each((i, el) => {
  if (i === 0) return; // headers
  const tds = $(el).find('td');
  if (tds.length < 8) return;
  results.push({
    author: $(tds[0]).text().trim(),
    title: $(tds[1]).text().trim(),
    publisher: $(tds[2]).text().trim(),
    year: $(tds[3]).text().trim(),
    pages: $(tds[4]).text().trim(),
    lang: $(tds[5]).text().trim(),
    size: $(tds[6]).text().trim(),
    extension: $(tds[7]).text().trim(),
    md5: $(tds[8])?.find('a')?.attr('href')?.split('md5=')[1] || ''
  });
});
console.log(results.slice(0, 2));
