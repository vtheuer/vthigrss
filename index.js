const {writeFileSync} = require('fs');
const fetch = require('node-fetch');
const RSS = require('rss');

async function makeFeed(profile) {
  const url = `http://instagram.com/${profile}/`;
  const html = await (await fetch(url)).text();
  const json = JSON.parse(/sharedData = (.+);/.exec(html.split('\n').find(l => l.includes('_sharedData = ')))[1]);
  const {user} = json.entry_data.ProfilePage[0].graphql;
  const feed = new RSS({
    title: profile,
    description: profile,
    feed_url: `https://raw.githack.com/vtheuer/vthigrss/master/${profile}.xml`,
    site_url: url,
    image_url: user.profile_pic_url,
    ttl: '1440'
  });
  
  user.edge_owner_to_timeline_media.edges.forEach(({node: {
    shortcode, 
    is_video,
    display_url,
    edge_media_to_caption, 
    taken_at_timestamp
  }}) => feed.item({
    title: (is_video ? 'Video: ' : '') + 
      (edge_media_to_caption.edges.length ? edge_media_to_caption.edges[0].node.text : '[No title]'),      
    description: `<img src="${display_url}"/>`,
    url: `https://instagram.com/p/${shortcode}/`,
    date: taken_at_timestamp * 1000
  }));

  writeFileSync(profile + '.xml', feed.xml().replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, ''), 'utf8');
}

process.argv.slice(2).map(makeFeed);
