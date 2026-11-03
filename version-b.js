
const $ = s => document.querySelector(s);

const escapeHTML = s => String(s ?? '').replace(
  /[&<>"']/g,
  c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c])
);

const media = s => {
  if (!s) return '';
  return /^https?:\/\//i.test(s)
    ? s
    : String(s).replace(/^\//, '');
};

let projects = [];
let filter = 'all';

const menu = $('#menu');
if (menu) {
  menu.onclick = () => $('#links').classList.toggle('show');
}

document.querySelectorAll('#links a').forEach(a => {
  a.onclick = () => $('#links').classList.remove('show');
});

async function load() {
  try {
    const r = await fetch('content/site.json');

    if (r.ok) {
      const s = await r.json();

      if (s.hero_description) {
        $('#heroDescription').textContent = s.hero_description;
      }

      if (s.portrait) {
        const portrait = $('#heroPortrait');
        portrait.replaceChildren();

        const img = document.createElement('img');
        img.src = media(s.portrait);
        img.alt = 'Junjun portrait';
        portrait.append(img);
      }

      if (s.email) {
        $('#emailButton').href = 'mailto:' + s.email;
      }

      if (s.instagram) {
        $('#instagramLink').href = s.instagram;
      }
    }
  } catch (e) {
    console.error('Website settings:', e);
  }

  try {
    const r = await fetch('content/projects.json');

    if (!r.ok) throw Error('Missing project manifest');

    const ids = await r.json();

    projects = (await Promise.all(ids.map(async id => {
      try {
        const q = await fetch(
          'content/projects/' + encodeURIComponent(id) + '.json'
        );

        return q.ok ? { id, ...await q.json() } : null;
      } catch (e) {
        return null;
      }
    }))).filter(p => p && p.published !== false);

    render();
  } catch (e) {
    $('#projects').textContent = 'Unable to load projects.';
    console.error(e);
  }
}

function render() {
  const emojis = {
    beauty: '✿',
    cosplay: '✦',
    fashion: '♡',
    lifestyle: '✧'
  };

  const labels = {
    beauty: 'Beauty & Skincare',
    cosplay: 'Cosplay & Creative',
    fashion: 'Fashion & Styling',
    lifestyle: 'Travel, Lifestyle & Food'
  };

  
const list = filter === 'all'
  ? projects.filter(p => p.featured === true)
  : projects.filter(p => p.category === filter);

  $('#projects').innerHTML = list.length
    ? list.map(p => {
        const video = p.video || p.video_url || '';
        const directMP4 = /\.mp4(?:[?#]|$)/i.test(video);
        const cover = p.cover || p.image || '';

        let visual = '';

        if (directMP4) {
          visual = `
            <video
              class="portfolio-video"
              controls
              playsinline
              preload="metadata"
              ${cover ? `poster="${escapeHTML(media(cover))}"` : ''}
            >
              <source
                src="${escapeHTML(media(video))}"
                type="video/mp4"
              >
              Your browser does not support video playback.
            </video>
          `;
        } else if (cover) {
          visual = `
            <img
              src="${escapeHTML(media(cover))}"
              alt="${escapeHTML(p.title)}"
              loading="lazy"
            >
          `;
        } else {
          visual = `
            <span class="placeholder">
              ${emojis[p.category] || '✿'}
            </span>
          `;
        }

        const externalVideo = video && !directMP4
          ? `<a class="textlink" href="${escapeHTML(media(video))}"
                target="_blank" rel="noopener noreferrer">
                WATCH VIDEO ↗
             </a>`
          : '';

        return `
          <article class="project">
            <div class="project-image">
              <span class="tag">
                ${escapeHTML(p.status || 'Portfolio sample')}
              </span>
              ${visual}
            </div>

            <div class="project-body">
              <small>${labels[p.category] || 'Creative UGC'}</small>
              <h3>${escapeHTML(p.title)}</h3>
              <p>${escapeHTML(p.description || '')}</p>
              ${externalVideo}
            </div>
          </article>
        `;
      
      }).join('')
    : '<p>No projects in this category yet.</p>';

  // Detect orientation and generate a 5-second preview
  document.querySelectorAll('.portfolio-video').forEach(video => {
    let previewReady = false;
    let restarting = false;

    const detectOrientation = () => {
      if (!video.videoWidth || !video.videoHeight) return;

      video.dataset.orientation =
        video.videoWidth > video.videoHeight
          ? 'horizontal'
          : 'vertical';
    };

    video.addEventListener('loadedmetadata', () => {
      detectOrientation();

      if (Number.isFinite(video.duration) && video.duration > 5) {
        video.currentTime = 5;
      }
    });

    video.addEventListener('loadeddata', detectOrientation);
    video.addEventListener('resize', detectOrientation);

    video.addEventListener('seeked', () => {
      if (!restarting && video.currentTime >= 4.9) {
        previewReady = true;
      }
    });

    video.addEventListener('play', async () => {
      if (!previewReady || restarting) return;

      previewReady = false;
      restarting = true;
      video.pause();

      try {
        video.currentTime = 0;

        if (video.seeking) {
          await new Promise(resolve => {
            video.addEventListener('seeked', resolve, { once: true });
          });
        }

        await video.play();
      } catch (error) {
        console.error('Playback error:', error);
      } finally {
        restarting = false;
      }
    });

    if (video.readyState >= 1) {
      detectOrientation();
    }
  });
