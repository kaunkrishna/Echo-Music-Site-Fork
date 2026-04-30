
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    setupScreenshotCycling();
    setupMobileScreenshotCycling();
    setupDownloadButtonStats();
    setupDownloadButtons();
    setupDownloadModal();
    setupScrollEffects();
    setupPhoneAnimations();
    setupFeaturesAnimation();
    setupFAQ();
    setupLinuxOptions();
}

function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {

        const feedback = element.querySelector('.copy-feedback');
        feedback.classList.add('show');

        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const feedback = element.querySelector('.copy-feedback');
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    });
}

function setupScreenshotCycling() {
    const screenshots = document.querySelectorAll('.screenshot');
    let currentIndex = 0;

    function showNextScreenshot() {
        screenshots[currentIndex].classList.remove('active');

        currentIndex = (currentIndex + 1) % screenshots.length;

        screenshots[currentIndex].classList.add('active');
    }

    setInterval(showNextScreenshot, 4000);

    const phoneScreen = document.querySelector('.phone-screen');
    phoneScreen.addEventListener('click', function () {
        showNextScreenshot();
    });
}

function setupMobileScreenshotCycling() {
    const mobileScreenshots = document.querySelectorAll('.mobile-screenshot');
    let currentMobileIndex = 0;

    function showNextMobileScreenshot() {
        mobileScreenshots[currentMobileIndex].classList.remove('active');

        currentMobileIndex = (currentMobileIndex + 1) % mobileScreenshots.length;

        mobileScreenshots[currentMobileIndex].classList.add('active');
    }

    setInterval(showNextMobileScreenshot, 3000);

    const mobilePhoneScreen = document.querySelector('.mobile-phone-screen');
    if (mobilePhoneScreen) {
        mobilePhoneScreen.addEventListener('click', function () {
            showNextMobileScreenshot();
        });
    }
}

function setupDownloadModal() {
    const modal = document.getElementById('download-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-modal');

    function closeModal() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');

        const platformOptions = document.querySelector('.platform-options');
        const linuxOptions = document.querySelector('.linux-options');

        if (platformOptions && linuxOptions) {

            linuxOptions.style.display = 'none';
            linuxOptions.style.opacity = '0';
            linuxOptions.style.transform = 'translateY(10px)';

            platformOptions.style.display = 'grid';
            platformOptions.style.opacity = '1';
            platformOptions.style.transform = 'translateY(0)';
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

function setupDownloadButtons() {
    const downloadBtns = document.querySelectorAll('.download-btn');

    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            btn.style.transform = 'translateY(-2px) scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'translateY(-2px) scale(1)';
            }, 150);
        });

        btn.addEventListener('mouseenter', function () {
            btn.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.3)';
        });

        btn.addEventListener('mouseleave', function () {
            btn.style.boxShadow = 'none';
        });
    });
}

function setupDownloadButtonStats() {
    const downloadBtns = document.querySelectorAll('.download-btn');
    const countEls = document.querySelectorAll('.btn-download-count');

    if (!downloadBtns.length || !countEls.length) {
        return;
    }

    const owner = 'EchoMusicApp';
    const repo = 'Echo-Music';
    const releasesApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`;

    function formatDownloadCount(count) {
        return new Intl.NumberFormat('en', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(count);
    }

    fetch(releasesApiUrl)
        .then(response => {
            if (!response.ok) throw new Error('GitHub releases API error');
            return response.json();
        })
        .then(releases => {
            const releaseList = Array.isArray(releases) ? releases : [];

            const totalDownloads = releaseList.reduce((sum, release) => {
                const assets = Array.isArray(release.assets) ? release.assets : [];
                return sum + assets.reduce((assetSum, asset) => assetSum + (Number(asset.download_count) || 0), 0);
            }, 0);

            const countText = `${formatDownloadCount(totalDownloads)} total downloads`;
            countEls.forEach(countEl => {
                countEl.textContent = countText;
            });

            const latestReleaseWithApk = releaseList.find(release => {
                const assets = Array.isArray(release.assets) ? release.assets : [];
                return assets.some(asset => /\.apk$/i.test(asset.name || ''));
            });

            const apkAsset = latestReleaseWithApk
                ? latestReleaseWithApk.assets.find(asset => /\.apk$/i.test(asset.name || ''))
                : null;

            if (apkAsset && apkAsset.browser_download_url) {
                downloadBtns.forEach(btn => {
                    btn.href = apkAsset.browser_download_url;
                    btn.target = '_blank';
                    btn.rel = 'noopener noreferrer';
                    btn.setAttribute('aria-label', `Download Echo Music APK. ${countText}.`);
                });
            }
        })
        .catch(err => {
            console.warn('Failed to fetch release download count:', err);
            countEls.forEach(countEl => {
                countEl.textContent = 'GitHub releases';
            });
        });
}


function setupScrollEffects() {
    let ticking = false;

    function updateScrollEffects() {
        const scrolled = window.pageYOffset;

        const mainContent = document.querySelector('.main-content');
        const opacity = Math.max(0, 1 - scrolled / 500);
        mainContent.style.opacity = opacity;

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);
}

function setupPhoneAnimations() {
}

function setupFeaturesAnimation() {
    const featuresSection = document.querySelector('.features-section');
    const featureCards = document.querySelectorAll('.feature-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                featuresSection.classList.add('visible');

                featureCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
    });

    observer.observe(featuresSection);
}


function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function () {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            item.classList.toggle('active');
        });
    });
}

function fetchLatestReleaseAndAutoDownload() {
    const owner = 'iad1tya';
    const repo = 'Echo-Music';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('GitHub API error');
            return response.json();
        })
        .then(release => {
            let asset = null;
            if (Array.isArray(release.assets)) {
                asset = release.assets.find(a => /\.apk$/i.test(a.name)) || release.assets[0] || null;
            }

            if (!asset) {
                return;
            }

            const overlay = document.getElementById('auto-download-overlay');
            const titleEl = document.getElementById('ad-release-title');
            const bodyEl = document.getElementById('ad-release-body');
            const assetNameEl = document.getElementById('ad-asset-name');
            const countdownEl = document.getElementById('ad-countdown');

            titleEl.textContent = `${release.name || release.tag_name}`;
            bodyEl.textContent = (release.body || '').replace(/\r?\n/g, ' ');
            assetNameEl.textContent = asset.name;


            overlay.setAttribute('aria-hidden', 'false');

            const manualLink = document.getElementById('manual-download-link');
            if (manualLink) {
                manualLink.href = asset.browser_download_url;
                manualLink.target = '_blank';
                manualLink.rel = 'noopener noreferrer';
            }

            let seconds = 5;
            countdownEl.textContent = String(seconds);

            if (window.__echoAutoDownloadInterval) {
                clearInterval(window.__echoAutoDownloadInterval);
                window.__echoAutoDownloadInterval = null;
            }

            const interval = setInterval(() => {
                seconds -= 1;
                if (seconds <= 0) {
                    clearInterval(interval);
                    window.__echoAutoDownloadInterval = null;
                    countdownEl.textContent = '0';

                    try {
                        const a = document.createElement('a');
                        a.href = asset.browser_download_url;
                        a.rel = 'noopener noreferrer';
                        a.setAttribute('download', '');
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    } catch (e) {
                        window.location.href = asset.browser_download_url;
                    }

                    setTimeout(() => {
                        overlay.setAttribute('aria-hidden', 'true');
                    }, 1200);
                } else {
                    countdownEl.textContent = String(seconds);
                }
            }, 1000);

            window.__echoAutoDownloadInterval = interval;
        })
        .catch(err => {
            console.warn('Failed to fetch latest release:', err);
        });
}

setTimeout(() => {
    if (document.getElementById && document.getElementById('auto-download-overlay')) {
        fetchLatestReleaseAndAutoDownload();

        const cancelBtn = document.getElementById('cancel-download');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (window.__echoAutoDownloadInterval) {
                    clearInterval(window.__echoAutoDownloadInterval);
                    window.__echoAutoDownloadInterval = null;
                }
                const overlay = document.getElementById('auto-download-overlay');
                if (overlay) overlay.setAttribute('aria-hidden', 'true');
            });
        }

        const manualLink = document.getElementById('manual-download-link');
        if (manualLink) {
            manualLink.addEventListener('click', (e) => {
                if (window.__echoAutoDownloadInterval) {
                    clearInterval(window.__echoAutoDownloadInterval);
                    window.__echoAutoDownloadInterval = null;
                }
            });
        }
    }
}, 600);


function setupLinuxOptions() {
    const linuxBtn = document.getElementById('linux-btn');
    const platformOptions = document.querySelector('.platform-options');
    const linuxOptions = document.querySelector('.linux-options');

    if (linuxBtn && platformOptions && linuxOptions) {
        linuxBtn.addEventListener('click', function (e) {
            e.preventDefault();

            platformOptions.style.opacity = '0';
            platformOptions.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                platformOptions.style.display = 'none';
                linuxOptions.style.display = 'flex';
                linuxOptions.style.flexDirection = 'column';

                setTimeout(() => {
                    linuxOptions.style.opacity = '1';
                    linuxOptions.style.transform = 'translateY(0)';
                }, 50);
            }, 200);
        });
    }
}
