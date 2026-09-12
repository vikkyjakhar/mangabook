const cheerio = require('cheerio');
fetch('https://libgen.li/index.php?req=naruto', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    const results = [];
    $('table tbody tr').each((i, el) => {
      if (i === 0) return;
      const tds = $(el).find('td');
      if (tds.length < 8) return;
      
      const rawTitle = $(tds[0]).text().trim();
      const internalIdMatch = $(tds[0]).find('.badge-secondary').text().trim().match(/(?:c|f|s)\s+(\d+)/);
      const internalId = internalIdMatch ? parseInt(internalIdMatch[1], 10) : 0;
      
      const mirrorHref = $(tds[8]).find('a').attr('href');
      let md5 = '';
      if (mirrorHref && mirrorHref.includes('md5=')) {
        md5 = mirrorHref.split('md5=')[1].split('&')[0];
      }
      
      let coverUrl = '';
      if (internalId && md5) {
        const bucket = Math.floor(internalId / 1000) * 1000;
        const typeBadge = $(tds[0]).find('.badge-secondary').text().trim().charAt(0);
        if (typeBadge === 'c') {
           coverUrl = `https://libgen.li/comicscovers/${bucket}/${md5}_small.jpg`;
        } else if (typeBadge === 'f') {
           coverUrl = `https://libgen.li/fictioncovers/${bucket}/${md5}_small.jpg`;
        } else {
           coverUrl = `https://libgen.li/covers/${bucket}/${md5}_small.jpg`; // standard covers?
        }
      }
      
      results.push({
        title: rawTitle,
        id: internalId,
        md5,
        coverUrl
      });
    });
    console.log(results.slice(0, 3));
  })
  .catch(console.error);
