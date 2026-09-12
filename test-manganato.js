const cheerio = require('cheerio');
fetch('https://manganato.com/search/story/naruto', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(res => res.text())
  .then(html => {
    console.log(html.substring(0, 300));
  })
  .catch(console.error);
