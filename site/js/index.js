(function () {
  "use strict";

  /* ==========================================================================
        1. CONSTANTS & SYSTEM CONFIGURATION SYSTEM
        ========================================================================== */
  const CONFIG = {
    SCROLL_THRESHOLD: 150,
    FAB_THRESHOLD: 50,
    RIPPLE_DURATION: 600,
    TYPEWRITER_SPEED: 40,
    TYPEWRITER_START_DELAY: 300,
    CURSOR_FADE_DELAY: 2000,
    FAQ_EXTRA_PADDING: 36,
    API_REPO: "https://api.github.com/repos/EchoMusicApp/Echo-Music",
    API_RELEASES: "https://api.github.com/repos/EchoMusicApp/Echo-Music/releases?per_page=100",
  };

  const MESSAGE_STRING = "Hi! If you love Echo Music, consider supporting my work! ☕";

  /* ==========================================================================
         2. CENTRAL DOM CACHE LAYER REGISTRY
         ========================================================================== */
  const DOM = {
    navbar: document.getElementById("navbar"),
    fab: document.getElementById("support-fab"),
    fabBubble: document.querySelector(".support-msg-bubble"),
    typewriterText: document.getElementById("typewriter-text"),
    cursor: document.querySelector(".cursor"),
    statStars: document.getElementById("stat-stars"),
    statDownloads: document.getElementById("stat-downloads"),
    downloadButtons: document.querySelectorAll(".btn-download"),
    rippleButtons: document.querySelectorAll(".btn.ripple"),
    faqItems: document.querySelectorAll(".faq-item"),
    featureCards: document.querySelectorAll(".feature-card"),
  };

  /* ==========================================================================
         3. MOTION INTERPOLATION STATE CONTROLLERS
         ========================================================================== */
  let state = {
    isScrollTicking: false,
    hasTypewriterTyped: false,
    typewriterIndex: 0,
  };

  /**
   * High Performance Coordinate Context Windows Multi-Scroll Loop Engine
   */
  function evaluateScrollExecutionState() {
    const currentScrollY = window.scrollY;

    // Navbar Performance View Translation
    if (currentScrollY > CONFIG.SCROLL_THRESHOLD) {
      DOM.navbar.classList.add("visible");
    } else {
      DOM.navbar.classList.remove("visible");
    }

    // Floating Action Button Interaction Dynamic Tracking
    if (currentScrollY > CONFIG.FAB_THRESHOLD) {
      if (DOM.fabBubble) DOM.fabBubble.classList.add("show");
      triggerTypewriterProcessingSequence();
    } else {
      if (DOM.fabBubble) DOM.fabBubble.classList.remove("show");
    }

    state.isScrollTicking = false;
  }

  function onWindowScrollEvent() {
    if (!state.isScrollTicking) {
      window.requestAnimationFrame(evaluateScrollExecutionState);
      state.isScrollTicking = true;
    }
  }
  window.addEventListener("scroll", onWindowScrollEvent, { passive: true });

  /* ==========================================================================
         4. TYPEWRITER EMULATION MACHINE LOGIC
         ========================================================================== */
  function typeCharacterStep() {
    if (state.typewriterIndex < MESSAGE_STRING.length) {
      DOM.typewriterText.textContent += MESSAGE_STRING.charAt(state.typewriterIndex);
      state.typewriterIndex++;
      setTimeout(typeCharacterStep, CONFIG.TYPEWRITER_SPEED);
      return;
    }

    setTimeout(() => {
      if (DOM.cursor) DOM.cursor.style.display = "none";
    }, CONFIG.CURSOR_FADE_DELAY);
  }

  function triggerTypewriterProcessingSequence() {
    if (state.hasTypewriterTyped) return;
    state.hasTypewriterTyped = true;
    setTimeout(typeCharacterStep, CONFIG.TYPEWRITER_START_DELAY);
  }

  /* ==========================================================================
         5. ASYNCHRONOUS GITHUB ENDPOINT ANALYTICS LOADER
         ========================================================================== */
  async function invokeGitHubLiveStatisticsFetch() {
    try {
      // Asynchronous Repository Meta Data Interrogation Sequence
      const repositoryMetricsResponse = await fetch(CONFIG.API_REPO);
      if (repositoryMetricsResponse.ok) {
        const repositoryData = await repositoryMetricsResponse.json();
        if (DOM.statStars && repositoryData.stargazers_count) {
          DOM.statStars.innerHTML = `⭐ ${repositoryData.stargazers_count.toLocaleString()} GitHub Stars`;
        }
      }

      // Asynchronous Release Bundle Audit & Accumulation Sequence
      const assetDistributionResponse = await fetch(CONFIG.API_RELEASES);
      if (assetDistributionResponse.ok) {
        const analyticalDistributionPayload = await assetDistributionResponse.json();
        let accumulatedDownloadMetrics = 0;
        let targetDistributionUrl = "";

        analyticalDistributionPayload.forEach((releaseItem) => {
          if (releaseItem.assets) {
            releaseItem.assets.forEach((assetItem) => {
              accumulatedDownloadMetrics += assetItem.download_count;
            });
          }
        });

        const prioritizedStableRelease = analyticalDistributionPayload.find((r) => !r.prerelease) || analyticalDistributionPayload[0];
        if (prioritizedStableRelease) {
          targetDistributionUrl = prioritizedStableRelease.html_url;
          prioritizedStableRelease.assets.forEach((assetItem) => {
            if (assetItem.name.endsWith(".apk")) {
              targetDistributionUrl = assetItem.browser_download_url;
            }
          });
        }

        if (accumulatedDownloadMetrics > 0 && DOM.statDownloads) {
          DOM.statDownloads.innerHTML = `📦 ${accumulatedDownloadMetrics.toLocaleString()}+ Downloads`;
        }

        if (targetDistributionUrl) {
          DOM.downloadButtons.forEach((downloadElementReference) => {
            downloadElementReference.href = targetDistributionUrl;
          });
        }
      }
    } catch (errorContextCatch) {
      console.warn("Telemetry system fault: Unable to populate asset metrics mapping.", errorContextCatch);
    }
  }
  invokeGitHubLiveStatisticsFetch();

  /* ==========================================================================
         6. COMPONENT ANIMATION MOTIONS & RIPPLES ENGINE
         ========================================================================== */
  function deployMaterialRippleContext(event) {
    const interactiveButton = event.currentTarget;
    const rippleGraphicElement = document.createElement("span");

    const boundingDimensions = interactiveButton.getBoundingClientRect();
    const absoluteDiameter = Math.max(interactiveButton.clientWidth, interactiveButton.clientHeight);
    const radiusOffsetVal = absoluteDiameter / 2;

    let inputClientCoordinateX = 0;
    let inputClientCoordinateY = 0;

    if (event.touches && event.touches.length > 0) {
      inputClientCoordinateX = event.touches[0].clientX - boundingDimensions.left;
      inputClientCoordinateY = event.touches[0].clientY - boundingDimensions.top;
    } else {
      inputClientCoordinateX = event.clientX - boundingDimensions.left;
      inputClientCoordinateY = event.clientY - boundingDimensions.top;
    }

    rippleGraphicElement.style.width = rippleGraphicElement.style.height = `${absoluteDiameter}px`;
    rippleGraphicElement.style.left = `${inputClientCoordinateX - radiusOffsetVal}px`;
    rippleGraphicElement.style.top = `${inputClientCoordinateY - radiusOffsetVal}px`;
    rippleGraphicElement.classList.add("ripple-span");

    const structuralRippleObsoleteTarget = interactiveButton.querySelector(".ripple-span");
    if (structuralRippleObsoleteTarget) {
      structuralRippleObsoleteTarget.remove();
    }

    interactiveButton.appendChild(rippleGraphicElement);
    setTimeout(() => rippleGraphicElement.remove(), CONFIG.RIPPLE_DURATION);
  }

  DOM.rippleButtons.forEach((rippleBindingTarget) => {
    rippleBindingTarget.addEventListener("mousedown", deployMaterialRippleContext);
    rippleBindingTarget.addEventListener("touchstart", deployMaterialRippleContext, { passive: true });
  });

  /* ==========================================================================
         7. MODULE: MULTI-PANEL VIEW COMPONENT ACCORDIONS
         ========================================================================== */
  DOM.faqItems.forEach((currentFaqElementBlock) => {
    const interactiveTriggerElement = currentFaqElementBlock.querySelector(".faq-question");
    const internalPanelContentWrapper = currentFaqElementBlock.querySelector(".faq-answer");
    const conceptualIndicatorSymbol = currentFaqElementBlock.querySelector(".faq-icon");

    if (!interactiveTriggerElement || !internalPanelContentWrapper) return;

    interactiveTriggerElement.addEventListener("click", () => {
      const isCurrentlyExpanded = currentFaqElementBlock.classList.contains("open");

      // Structural Reset / Auto-Accordion functionality close out
      DOM.faqItems.forEach((alternativeFaqRowElement) => {
        if (alternativeFaqRowElement !== currentFaqElementBlock) {
          alternativeFaqRowElement.classList.remove("open");

          const rowTrigger = alternativeFaqRowElement.querySelector(".faq-question");
          const rowIcon = alternativeFaqRowElement.querySelector(".faq-icon");
          const rowAnswer = alternativeFaqRowElement.querySelector(".faq-answer");

          if (rowTrigger) rowTrigger.setAttribute("aria-expanded", "false");
          if (rowIcon) rowIcon.textContent = "+";
          if (rowAnswer) rowAnswer.style.maxHeight = null;
        }
      });

      // Process operational state swap transformations
      if (isCurrentlyExpanded) {
        currentFaqElementBlock.classList.remove("open");
        interactiveTriggerElement.setAttribute("aria-expanded", "false");
        conceptualIndicatorSymbol.textContent = "+";
        internalPanelContentWrapper.style.maxHeight = null;
      } else {
        currentFaqElementBlock.classList.add("open");
        interactiveTriggerElement.setAttribute("aria-expanded", "true");
        conceptualIndicatorSymbol.textContent = "−";
        internalPanelContentWrapper.style.maxHeight = `${internalPanelContentWrapper.scrollHeight + CONFIG.FAQ_EXTRA_PADDING}px`;
      }
    });
  });

  /* ==========================================================================
         8. SHARED EFFICIENCY INTERSECTION OBSERVER PIPELINE
         ========================================================================== */
  const generalizedViewportObserver = new IntersectionObserver(
    (monitoredDataEntries, systemObserverInstance) => {
      monitoredDataEntries.forEach((realtimePayloadItem) => {
        if (!realtimePayloadItem.isIntersecting) return;

        const targetContextElement = realtimePayloadItem.target;
        targetContextElement.classList.add("visible");
        systemObserverInstance.unobserve(targetContextElement);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.1,
    },
  );

  // Map components across the dynamic view engine instance pipelines
  DOM.featureCards.forEach((cardContextNode, internalIndexKey) => {
    cardContextNode.style.transitionDelay = `${internalIndexKey * 80}ms`;
    generalizedViewportObserver.observe(cardContextNode);
  });

  DOM.faqItems.forEach((faqContextNode, internalIndexKey) => {
    faqContextNode.style.transitionDelay = `${internalIndexKey * 60}ms`;
    generalizedViewportObserver.observe(faqContextNode);
  });
})();
