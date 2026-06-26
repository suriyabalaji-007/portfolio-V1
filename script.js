document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Nav Highlighting
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const navLink = document.querySelector(`.sidenav a[href="#${id}"]`);
        if (navLink) {
          document.querySelectorAll('.sidenav a').forEach(a => a.classList.remove('active'));
          navLink.classList.add('active');
        }
      }
    });
  }, { threshold: 0.4, rootMargin: "-10% 0px -40% 0px" });
  document.querySelectorAll('section, .card').forEach(sect => observer.observe(sect));

  // Modal Elements
  const modal = document.getElementById('mediaModal');
  const modalImg = document.getElementById('modalImg');
  const closeBtn = document.getElementById('modalClose');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentProject = null;
  let currentImgIdx = 0;
  let slideInterval = null;

  function updateImg() {
    if (currentProject && currentProject.images.length > 0) {
      modalImg.style.opacity = '0';
      setTimeout(() => {
        modalImg.src = currentProject.images[currentImgIdx];
        modalImg.style.opacity = '1';
        if (currentProject.isCert && currentProject.certCaptions)
          document.getElementById('certCap').textContent = currentProject.certCaptions[currentImgIdx];
      }, 200);
    }
  }

  window.openProject = function (data) {
    currentProject = data;
    currentImgIdx = data.startIndex || 0;
    clearInterval(slideInterval);

    const shell = document.querySelector('.modal-shell');
    const certCap = document.getElementById('certCap');
    shell.classList.toggle('cert-mode', !!data.isCert);
    if (data.isCert) certCap.textContent = data.desc;

    document.getElementById('pTitle').textContent = data.title;
    document.getElementById('pDesc').textContent = data.desc;

    const pPeriod = document.getElementById('pPeriod');
    const pPeriodText = document.getElementById('pPeriodText');
    if (data.period && !data.isCert) {
      pPeriodText.textContent = data.period;
      pPeriod.style.display = 'block';
    } else {
      pPeriod.style.display = 'none';
      pPeriodText.textContent = '';
    }

    const liveLink = document.getElementById('liveLink');
    liveLink.href = data.live;
    liveLink.textContent = data.liveLabel || 'Live Demo';

    const liveDarkLink = document.getElementById('liveDarkLink');
    if (data.liveDark) {
      liveDarkLink.href = data.liveDark;
      liveDarkLink.textContent = data.liveDarkLabel || 'Dark Demo';
      liveDarkLink.style.display = 'inline-flex';
    } else {
      liveDarkLink.style.display = 'none';
    }

    document.getElementById('gitLink').href = data.github;

    const techContainer = document.getElementById('pTech');
    techContainer.innerHTML = '';
    (data.tech || []).forEach(t => {
      const span = document.createElement('span');
      span.textContent = t;
      techContainer.appendChild(span);
    });

    updateImg();

    const controls = document.querySelector('.modal-controls');
    controls.style.display = data.images.length > 1 ? 'flex' : 'none';
    if (data.images.length > 1 && !data.isCert) {
      slideInterval = setInterval(() => {
        currentImgIdx = (currentImgIdx + 1) % currentProject.images.length;
        updateImg();
      }, 5000);
    }
    modal.classList.add('show');
  };

  window.openModal = function (src, cap) {
    const certItems = Array.from(document.querySelectorAll('.cert-item'));
    const allCerts = certItems.map(item => ({
      src: item.querySelector('img').getAttribute('src'),
      caption: `${item.querySelector('h4').textContent} — ${item.querySelector('p').textContent}`
    }));
    const startIdx = allCerts.findIndex(c => c.src === src);
    openProject({
      title: 'Certificate', desc: cap,
      images: allCerts.map(c => c.src),
      certCaptions: allCerts.map(c => c.caption),
      live: src, liveLabel: 'View Certificate',
      github: '#', isCert: true,
      startIndex: startIdx >= 0 ? startIdx : 0
    });
  };

  prevBtn.onclick = (e) => {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx - 1 + currentProject.images.length) % currentProject.images.length;
    updateImg();
  };

  nextBtn.onclick = (e) => {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx + 1) % currentProject.images.length;
    updateImg();
  };

  const closeModal = () => { clearInterval(slideInterval); modal.classList.remove('show'); };
  closeBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('show')) return;
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'Escape') closeModal();
  });

  // Thumbnail Slideshow
  document.querySelectorAll('.proj-item').forEach(item => {
    const attr = item.getAttribute('onclick');
    if (!attr || !attr.includes('images:')) return;
    try {
      const match = attr.match(/images:\s*\[([^\]]+)\]/);
      if (!match) return;
      const imgs = match[1].replace(/'/g, '').split(',').map(s => s.trim());
      if (imgs.length < 2) return;
      let idx = 0;
      const imgEl = item.querySelector('img');
      setInterval(() => {
        idx = (idx + 1) % imgs.length;
        imgEl.style.opacity = '0.4';
        setTimeout(() => { imgEl.src = imgs[idx]; imgEl.style.opacity = '0.85'; }, 400);
      }, 4000 + Math.random() * 2000);
    } catch (e) { console.error('Slideshow init failed', e); }
  });
});
