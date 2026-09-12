export const fetchAnilistTopManga = async (page = 1, perPage = 10) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page (page: $page, perPage: $perPage) {
        media (type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
          id
          title { romaji english }
          coverImage { large }
        }
      }
    }
  `;
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { page, perPage } })
    });
    const data = await res.json();
    return data.data.Page.media;
  } catch (e) {
    return [];
  }
};

export const fetchAnilistMangaById = async (id: number | string) => {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: MANGA) {
        id
        title { romaji english }
        description(asHtml: false)
        coverImage { large }
        genres
      }
    }
  `;
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id: Number(id) } })
    });
    const data = await res.json();
    return data.data.Media;
  } catch (e) {
    return null;
  }
};

