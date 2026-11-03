
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


const videoThumbnail = url => {
  if (!url) return '';

  // Generate a thumbnail at 5 seconds for Cloudinary videos
  if (
    url.includes('res.cloudinary.com/') &&
    url.includes('/video/upload/')
  ) {
    return url
      .replace('/video/upload/', '/video/upload/so_2/')
      .replace(/\.mp4(?:\?.*)?$/i, '.jpg');
  }

  return '';
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
       
$('#emailButton').href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(s.email) + '&su=UGC%20Collaboration%20Inquiry';

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
  
  // Show projects in the order set in Pages CMS
  const list = (filter === 'all'
    ? projects.filter(p => p.featured === true)
    : projects.filter(p => p.category === filter)
  ).sort((a, b) => {
    const orderA = Number(a.display_order ?? 99);
    const orderB = Number(b.display_order ?? 99);
    return orderA - orderB;
  });

  $('#projects').innerHTML = list.length
    ? list.map(p => {
        const video = p.video || p.video_url || '';
        const directMP4 = /\.mp4(?:[?#]|$)/i.test(video);
        const cover = p.cover || p.image || '';
        const thumbnail = videoThumbnail(video) || cover;


        let visual = '';

        if (directMP4) {
          visual = `
            <video
              class="portfolio-video"
              controls
              playsinline
              preload="metadata"
              
              ${thumbnail ? `poster="${escapeHTML(media(thumbnail))}"` : ''}

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
          ? `<a class="textlink"
                href="${escapeHTML(media(video))}"
                target="_blank"
                rel="noopener noreferrer">
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

  // Automatically detect video orientation
  document.querySelectorAll('.portfolio-video').forEach(video => {

    const detectOrientation = () => {
      if (!video.videoWidth || !video.videoHeight) return;

      video.dataset.orientation =
        video.videoWidth > video.videoHeight
          ? 'horizontal'
          : 'vertical';
    };

    video.addEventListener('loadedmetadata', detectOrientation);

    if (video.readyState >= 1) {
      detectOrientation();
    }
  });
}

document.querySelectorAll('.filter').forEach(button => {
  button.onclick = () => {
    filter = button.dataset.filter;

    document.querySelectorAll('.filter').forEach(b => {
      b.classList.toggle('active', b === button);
    });

    render();
  };
});

load();


/* Junjuns UGC Quote Calculator */

const quoteForm = document.querySelector('#ugcQuoteForm');

if (quoteForm) {
  const q = id => document.getElementById(id);
  const money = n => '€' + n.toLocaleString('en-IE');

  const number = (id, max) => {
    const value = Math.floor(Number(q(id).value) || 0);
    return Math.min(max, Math.max(0, value));
  };

  function calculateQuote() {
    const videos = number('quoteVideos', 20);
    const photos = number('quotePhotos', 30);
    const hooks = number('quoteHooks', 20);
    const revisions = number('quoteRevisions', 20);

    // Video bundle pricing
  
    const videoCost =
      Math.floor(videos / 5) * 550 +
      (videos % 5 >= 3
        ? 350 + (videos % 5 - 3) * 120
        : (videos % 5) * 120);


    // Photo bundle pricing
    const photoRemainder = photos % 10;
    const photoCost =
      Math.floor(photos / 10) * 160 +
      (photoRemainder >= 5
        ? 90 + (photoRemainder - 5) * 20
        : photoRemainder * 20);

    const extended = q('quoteLength').value === 'extended';
    const production = videoCost + photoCost +
      (extended ? videos * 40 : 0);

    const usage = Number(q('quoteUsage').value);
    const license = Math.round(production * usage);

    const extras =
      hooks * 25 +
      revisions * 20 +
      (q('quoteRaw').checked ? 50 : 0) +
      (q('quoteSubtitles').checked ? videos * 15 : 0);

    const rush = q('quoteRush').checked
      ? Math.round((production + license + extras) * 0.3)
      : 0;

    const total = production + license + extras + rush;

    q('qProduction').textContent = money(production);
    q('qLicense').textContent = money(license);
    q('qExtras').textContent = money(extras);
    q('qRush').textContent = money(rush);
    q('qTotal').textContent = money(total);

    const usageText =
      q('quoteUsage').selectedOptions[0].textContent;

    const details = [
      `Videos: ${videos}`,
      `Photos: ${photos}`,
      `Video length: ${q('quoteLength').selectedOptions[0].textContent}`,
      `Usage: ${usageText}`,
      `Additional hooks: ${hooks}`,
      `Extra revisions: ${revisions}`,
      `Raw footage: ${q('quoteRaw').checked ? 'Yes' : 'No'}`,
      `Subtitles: ${q('quoteSubtitles').checked ? 'Yes' : 'No'}`,
      `Rush delivery: ${q('quoteRush').checked ? 'Yes' : 'No'}`,
      `Exclusivity: ${q('quoteExclusive').checked ? 'Custom quote requested' : 'No'}`,
      `Creator ads: ${q('quoteCreatorAds').checked ? 'Custom quote requested' : 'No'}`
    ].join('\n');

    q('quoteDetails').value = details;
    q('quoteAmount').value = money(total) +
      (q('quoteExclusive').checked || q('quoteCreatorAds').checked
        ? ' + custom quoted fees'
        : '');

    return { videos, photos };
  }

 
  quoteForm.addEventListener('input', calculateQuote);
  quoteForm.addEventListener('change', calculateQuote);

  quoteForm.addEventListener('submit', async event => {
    event.preventDefault();

    const { videos, photos } = calculateQuote();

    if (videos === 0 && photos === 0) {
      alert('Please select at least one video or photo.');
      return;
    }

    const button = quoteForm.querySelector(
      'button[type="submit"]'
    );

    button.disabled = true;
    button.textContent = 'Sending your request...';

    try {
      const formData = new FormData(quoteForm);
      formData.set('form-name', 'ugc-quote');

      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formData).toString()
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      alert('Thank you! ♡ Your quote request has been sent!');

      quoteForm.reset();
      calculateQuote();

    } catch (error) {
      console.error(error);
      alert('Sorry, something went wrong. Please try again.');

    } finally {
      button.disabled = false;
      button.textContent = 'Request a Custom Quote ♡';
    }
  });

  calculateQuote();
}


async function copyContactEmail(button) {
  const email = 'junjunsworldofficial@gmail.com';

  try {
    await navigator.clipboard.writeText(email);

    button.textContent = '✓ Copied!';

    setTimeout(() => {
      button.textContent = '⧉';
    }, 2000);

  } catch (error) {
    window.prompt('Copy this email address:', email);
  }
}
