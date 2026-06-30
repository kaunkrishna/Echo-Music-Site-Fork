(function () {
  'use strict';

  const CONFIG = {
    SCROLL_NAV_THRESHOLD: 150,
    SCROLL_FAB_THRESHOLD: 50,
    RIPPLE_DURATION: 600,
    TYPEWRITER_SPEED: 40,
    TYPEWRITER_START_DELAY: 300,
    CURSOR_FADE_DELAY: 2000,
    FAQ_EXTRA_PADDING: 36,
    ENDPOINTS: {
      LASTFM: 'https://lastfm-last-played.biancarosa.com.br/iad1tya/latest-song',
      GITHUB_REPO: 'https://api.github.com/repos/EchoMusicApp/Echo-Music',
      GITHUB_RELEASES: 'https://api.github.com/repos/EchoMusicApp/Echo-Music/releases?per_page=100'
    }
  };

  const MESSAGE_STRING = "Hi! If you love Echo Music, consider supporting my work! ☕";

  const DOM = {
    navbar: document.getElementById('navbar'),
    footer: document.querySelector('footer'),
    
    supportFab: document.getElementById('support-fab'),
    supportBtn: document.querySelector('.support-btn'),
    fabBubble: document.querySelector('.support-msg-bubble'),
    lastfmBubble: document.getElementById('lastfm-bubble'),
    
    typewriterText: document.getElementById('typewriter-text'),
    cursor: document.querySelector('.cursor'),
    
    lastfmTrack: document.getElementById('lastfm-track'),
    lastfmArtist: document.getElementById('lastfm-artist'),
    lastfmArt: document.getElementById('lastfm-art'),
    lastfmStatus: document.getElementById('lastfm-status'),
    
    statStars: document.getElementById('stat-stars'),
    statDownloads: document.getElementById('stat-downloads'),
    downloadButtons: document.querySelectorAll('.btn-download'),
    
    rippleButtons: document.querySelectorAll('.btn.ripple'),
    faqItems: document.querySelectorAll('.faq-item'),
    featureCards: document.querySelectorAll('.feature-card')
  };

  let state = {
    isScrollTicking: false,
    hasTypewriterTyped: false,
    typewriterIndex: 0
  };

  function evaluateScrollState() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > CONFIG.SCROLL_NAV_THRESHOLD) {
      DOM.navbar?.classList.add('visible');
    } else {
      DOM.navbar?.classList.remove('visible');
    }

    const scrollPosition = currentScrollY + window.innerHeight;
    const bodyHeight = document.body.offsetHeight;
    const footerHeight = DOM.footer ? DOM.footer.offsetHeight : 0;
    const isNearBottom = scrollPosition > (bodyHeight - footerHeight + 20);

    if (DOM.supportFab) {
      DOM.supportFab.style.opacity = isNearBottom ? '0' : '1';
      if (DOM.supportBtn) {
        DOM.supportBtn.style.pointerEvents = isNearBottom ? 'none' : 'auto';
      }
    }

    if (currentScrollY > CONFIG.SCROLL_FAB_THRESHOLD && !isNearBottom) {
      DOM.fabBubble?.classList.add('show');
      DOM.lastfmBubble?.classList.add('show');
      triggerTypewriter();
    } else {
      DOM.fabBubble?.classList.remove('show');
      DOM.lastfmBubble?.classList.remove('show');
    }

    state.isScrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!state.isScrollTicking) {
      window.requestAnimationFrame(evaluateScrollState);
      state.isScrollTicking = true;
    }
  }, { passive: true });

  function typeCharacter() {
    if (state.typewriterIndex < MESSAGE_STRING.length) {
      DOM.typewriterText.textContent += MESSAGE_STRING.charAt(state.typewriterIndex);
      state.typewriterIndex++;
      setTimeout(typeCharacter, CONFIG.TYPEWRITER_SPEED);
    } else {
      setTimeout(() => {
        if (DOM.cursor) DOM.cursor.style.display = 'none';
      }, CONFIG.CURSOR_FADE_DELAY);
    }
  }

  function triggerTypewriter() {
    if (!state.hasTypewriterTyped && DOM.typewriterText) {
      state.hasTypewriterTyped = true;
      setTimeout(typeCharacter, CONFIG.TYPEWRITER_START_DELAY);
    }
  }

  function getTimeAgo(uts) {
    const seconds = Math.floor(Date.now() / 1000) - uts;
    if (seconds < 60) return "Just now";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + (minutes === 1 ? " min ago" : " mins ago");
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + (hours === 1 ? " hr ago" : " hrs ago");
    
    const days = Math.floor(hours / 24);
    return days + (days === 1 ? " day ago" : " days ago");
  }

  async function fetchLastFm() {
    try {
      const res = await fetch(CONFIG.ENDPOINTS.LASTFM);
      if (!res.ok) return;
      
      const data = await res.json();
      const track = data?.track;
      if (!track) return;

      if (DOM.lastfmTrack) DOM.lastfmTrack.textContent = track.name;
      if (DOM.lastfmArtist) DOM.lastfmArtist.textContent = track.artist?.['#text'];
      if (DOM.lastfmBubble) DOM.lastfmBubble.href = track.url;
      
      if (DOM.lastfmArt) {
        let artUrl = "";
        if (track.image?.length > 0) {
          const imgObj = track.image.find(i => i.size === 'extralarge') || track.image.find(i => i.size === 'large') || track.image[track.image.length - 1];
          artUrl = imgObj?.['#text'] || "";
        }
        
        DOM.lastfmArt.src = artUrl;
        DOM.lastfmArt.style.display = artUrl ? 'block' : 'none';
      }

      if (DOM.lastfmStatus) {
        if (track['@attr']?.nowplaying) {
          DOM.lastfmStatus.textContent = 'Listening now';
          DOM.lastfmStatus.style.color = '#10b981';
        } else {
          DOM.lastfmStatus.style.color = 'var(--muted)';
          DOM.lastfmStatus.textContent = track.date?.uts ? getTimeAgo(parseInt(track.date.uts)) : 'Recently Played';
        }
      }
    } catch (error) {
      console.warn("Telemetry fault: Last.fm fetch failed.", error);
    }
  }

  async function fetchGitHubStats() {
    try {
      const repoRes = await fetch(CONFIG.ENDPOINTS.GITHUB_REPO);
      if (repoRes.ok) {
        const repoData = await repoRes.json();
        if (DOM.statStars && repoData.stargazers_count) {
          DOM.statStars.innerHTML = `⭐ ${repoData.stargazers_count.toLocaleString()} GitHub Stars`;
        }
      }

      const relsRes = await fetch(CONFIG.ENDPOINTS.GITHUB_RELEASES);
      if (relsRes.ok) {
        const relsData = await relsRes.json();
        let totalDownloads = 0;
        let apkUrl = "";

        relsData.forEach(rel => {
          rel.assets?.forEach(asset => totalDownloads += asset.download_count);
        });

        const latestStable = relsData.find(r => !r.prerelease) || relsData[0];
        if (latestStable) {
          apkUrl = latestStable.html_url;
          latestStable.assets?.forEach(asset => {
            if (asset.name.endsWith('.apk')) apkUrl = asset.browser_download_url;
          });
        }

        if (totalDownloads > 0 && DOM.statDownloads) {
          DOM.statDownloads.innerHTML = `📦 ${totalDownloads.toLocaleString()}+ Downloads`;
        }
        
        if (apkUrl) {
          DOM.downloadButtons.forEach(btn => btn.href = apkUrl);
        }
      }
    } catch (error) {
      console.warn("Telemetry fault: GitHub stats fetch failed.", error);
    }
  }

  fetchLastFm();
  fetchGitHubStats();

  function applyRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const rect = button.getBoundingClientRect();
    
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
    const y = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x - radius}px`;
    circle.style.top = `${y - radius}px`;
    circle.classList.add("ripple-span");

    button.querySelector('.ripple-span')?.remove();
    button.appendChild(circle);
    
    setTimeout(() => circle.remove(), CONFIG.RIPPLE_DURATION);
  }

  DOM.rippleButtons.forEach(btn => {
    btn.addEventListener('mousedown', applyRipple);
    btn.addEventListener('touchstart', applyRipple, { passive: true });
  });

  DOM.faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isExpanded = item.classList.contains('open');
      
      DOM.faqItems.forEach(sibling => {
        if (sibling !== item) {
          sibling.classList.remove('open');
          if (sibling.querySelector('.faq-icon')) sibling.querySelector('.faq-icon').textContent = '+';
          if (sibling.querySelector('.faq-answer')) sibling.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (isExpanded) {
        item.classList.remove('open');
        icon.textContent = '+';
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        icon.textContent = '−';
        answer.style.maxHeight = `${answer.scrollHeight + CONFIG.FAQ_EXTRA_PADDING}px`; 
      }
    });
  });

  const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  DOM.featureCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 80}ms`;
    scrollRevealObserver.observe(card);
  });

  DOM.faqItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 60}ms`;
    scrollRevealObserver.observe(item);
  });

})();