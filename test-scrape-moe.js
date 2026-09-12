const cheerio = require('cheerio');
fetch('https://everythingmoe.com/', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(res => res.text())
  .then(html => {
    const fs = require('fs');
    fs.writeFileSync('moe.html', html);
    console.log('Saved to moe.html');
  })
  .catch(console.error);
