<script>
/* ------------ Simple auto-fetching carousel from /images ------------- */
(async function initCarousel() {
  const OWNER  = 'thegamer200';          // <- change if needed
  const REPO   = 'mental-health-bot-';   // <- change if needed
  const BRANCH = 'main';
  const FOLDER = 'images';

  const imgEl   = document.getElementById('carousel-img');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');

  if (!imgEl) return;

  // 1) List files in /images via GitHub API
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FOLDER}?ref=${BRANCH}`;
  let files;
  try {
    const res = await fetch(url);
    files = await res.json();
  } catch (e) {
    console.error('Could not load images', e);
    return;
  }

  // 2) Filter to image files and collect download URLs
  const images = (Array.isArray(files) ? files : [])
    .filter(f => f.type === 'file' && /\.(png|jpe?g|gif|webp|avif)$/i.test(f.name))
    .map(f => f.download_url);

  if (!images.length) return;

  let idx = 0;
  const autoplayMs = 5000;
  let timer;

  // Create dots
  const dots = images.map((_, i) => {
    const b = document.createElement('button');
    b.className = 'w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600';
    b.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(b);
    return b;
  });

  function markDot() {
    dots.forEach((d, i) => {
      d.className = 'w-2.5 h-2.5 rounded-full transition-all ' + (i === idx
        ? 'bg-blue-600 dark:bg-blue-400 w-5'
        : 'bg-gray-300 dark:bg-gray-600');
    });
  }

  async function show() {
    imgEl.style.opacity = 0;
    const nextSrc = images[idx];
    // Preload
    const pre = new Image();
    pre.src = nextSrc;
    await pre.decode().catch(() => {});
    imgEl.src = nextSrc;
    requestAnimationFrame(() => imgEl.style.opacity = 1);
    markDot();
  }

  function next() {
    idx = (idx + 1) % images.length;
    show();
  }

  function prev() {
    idx = (idx - 1 + images.length) % images.length;
    show();
  }

  function goTo(i) {
    idx = i % images.length;
    show();
    restartAutoplay();
  }

  function restartAutoplay() {
    clearInterval(timer);
    timer = setInterval(next, autoplayMs);
  }

  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });

  await show();
  timer = setInterval(next, autoplayMs);
})();
</script>
