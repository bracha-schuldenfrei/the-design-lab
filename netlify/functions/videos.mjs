// Reads the YouTube Portfolio playlist and returns it in the same shape as content/videos.json.
// Set in Netlify → Site configuration → Environment variables:
//   YOUTUBE_API_KEY      your YouTube Data API key
//   YOUTUBE_PLAYLIST_ID  the playlist ID (starts with PL, 34 characters)
// Category comes from #corporate / #nonprofit in the video description.
// If neither tag is there, it falls back to the category in content/videos.json, then NON PROFIT.

export default async () => {
  const key = process.env.YOUTUBE_API_KEY;
  const list = process.env.YOUTUBE_PLAYLIST_ID;
  if (!key || !list) return json({ items: [], error: 'missing env vars' }, 0);

  try {
    const site = process.env.URL || '';
    const existing = {};
    try {
      const r = await fetch(site + '/content/videos.json');
      if (r.ok) for (const it of (await r.json()).items || []) {
        const id = ytId(it.video_url);
        if (id) existing[id] = it;
      }
    } catch (e) {}

    const items = [];
    let page = '';
    do {
      const u = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&maxResults=50&playlistId=${encodeURIComponent(list)}&key=${encodeURIComponent(key)}${page ? '&pageToken=' + page : ''}`;
      const r = await fetch(u);
      if (!r.ok) return json({ items: [], error: 'youtube ' + r.status }, 60);
      const d = await r.json();
      for (const v of d.items || []) {
        const s = v.snippet || {};
        const id = s.resourceId && s.resourceId.videoId;
        const priv = v.status && v.status.privacyStatus === 'private';
        if (!id || priv || s.title === 'Deleted video' || s.title === 'Private video') continue;
        const desc = (s.description || '').toLowerCase();
        const old = existing[id] || {};
        const category = /#corporate\b/.test(desc) ? 'CORPORATE'
          : /#non-?profit\b/.test(desc) ? 'NON PROFIT'
          : (old.category || 'NON PROFIT');
        items.push({
          title: s.title || old.title,
          category,
          video_url: 'https://youtu.be/' + id,
          poster: old.poster || '',
        });
      }
      page = d.nextPageToken || '';
    } while (page);

    // Mark vertical videos (taller than wide) so the site can crop their thumbnails.
    try {
      const ids = items.map((it) => ytId(it.video_url));
      const vert = {}, ver = {};
      for (let i = 0; i < ids.length; i += 50) {
        const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=player&maxWidth=640&id=${ids.slice(i, i + 50).join(',')}&key=${encodeURIComponent(key)}`);
        if (!r.ok) continue;
        for (const v of (await r.json()).items || []) {
          const p = v.player || {};
          if (Number(p.embedHeight) > Number(p.embedWidth)) vert[v.id] = true;
          ver[v.id] = String(v.etag || '').replace(/\W/g, '').slice(-10);
        }
      }
      for (const it of items) { const id = ytId(it.video_url); it.vertical = !!vert[id]; it.thumb_v = ver[id] || ''; }
    } catch (e) {}

    return json({ items }, 120);
  } catch (e) {
    return json({ items: [], error: String(e) }, 60);
  }
};

function ytId(u) {
  const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : '';
}

function json(body, seconds) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-cache',
      'netlify-cdn-cache-control': `public, s-maxage=${seconds}, stale-while-revalidate=86400`,
    },
  });
}
