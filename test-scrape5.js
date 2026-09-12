const cheerio = require('cheerio');
fetch('https://libgen.li/edition.php?id=208927473', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    $('img').each((i, el) => console.log($(el).attr('src')));
  })
  .catch(console.error);
