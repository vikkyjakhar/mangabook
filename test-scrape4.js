const cheerio = require('cheerio');
fetch('https://libgen.li/index.php?req=naruto', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    const firstRow = $('table tbody tr').eq(1);
    console.log(firstRow.html());
  })
  .catch(console.error);
