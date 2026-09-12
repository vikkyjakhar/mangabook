const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('moe.html', 'utf8');
const $ = cheerio.load(html);
const sites = [];
$('#sec-manga .section-item').each((i, el) => {
  if (i >= 12) return;
  const a = $(el).find('a');
  if (a.length > 0) {
    sites.push({
      name: a.text().trim(),
      url: a.attr('data-link'),
      icon: a.find('img').attr('src')
    });
  }
});
console.log(JSON.stringify(sites, null, 2));
