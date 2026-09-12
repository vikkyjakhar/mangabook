fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query ($search: String) {
        Page (page: 1, perPage: 3) {
          media (search: $search, type: MANGA) {
            id
            title { romaji }
            coverImage { large }
          }
        }
      }
    `,
    variables: { search: 'naruto' }
  })
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
.catch(console.error);
