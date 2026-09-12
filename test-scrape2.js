const cheerio = require('cheerio');
fetch('https://libgen.li/index.php?req=sci-fi&page=2', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    const pagination = $('.pagination').html();
    console.log('Row count:', $('table tbody tr').length);
    console.log('Pagination HTML:', pagination);
  })
  .catch(console.error);
