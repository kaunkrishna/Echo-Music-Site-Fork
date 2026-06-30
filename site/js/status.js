(function () {
  "use strict";

  /* ==========================================================================
               1. SYSTEM CONFIGURATION & DATA
               ========================================================================== */
  const CONFIG = {
    TIMER_DURATION_SECONDS: 5 * 60, // 5 minutes
    PING_TIMEOUT_MS: 10000, // 10 seconds
  };

  const SERVICES = [
    { id: "canvas", name: "Canvas", url: "https://canvas.echomusic.fun" },
    { id: "youtube", name: "YouTube Music", url: "https://music.youtube.com" },
    { id: "saavn-1", name: "Server 1 - Saavn", url: "https://saavn.echomusic.fun" },
    { id: "saavn-2", name: "Server 2 - Saavn", url: "https://jiosaavn-api.pc-adityadav9532.workers.dev" },
    { id: "saavn-3", name: "Server 3 - Saavn", url: "https://jiosaavn-api.mac-adityadav9532.workers.dev" },
    { id: "qobuz", name: "Qobuz Lossless", url: "https://qobuz.kennyy.com.br" },
  ];

  /* ==========================================================================
               2. CENTRAL DOM CACHE LAYER REGISTRY
               ========================================================================== */
  const DOM = {
    statusList: document.getElementById("status-list"),
    forcePingBtn: document.getElementById("force-ping-btn"),
    countdownDisplay: document.getElementById("countdown"),
  };

  /* ==========================================================================
               3. STATE CONTROLLERS
               ========================================================================== */
  let state = {
    countdownSeconds: CONFIG.TIMER_DURATION_SECONDS,
    timerInterval: null,
  };

  /* ==========================================================================
               4. UI GENERATION & UPDATE LOGIC
               ========================================================================== */
  function renderServiceList() {
    // Clear existing content just in case
    DOM.statusList.innerHTML = "";

    SERVICES.forEach((service) => {
      const item = document.createElement("div");
      item.className = "status-item";
      item.innerHTML = `
                        <div class="service-info">
                            <div class="service-name">
                                <a href="${service.url}" target="_blank" rel="noopener noreferrer">${service.name}</a>
                            </div>
                        </div>
                        <div id="status-${service.id}" class="status-badge status-pending" aria-label="Status: Checking">Checking...</div>
                    `;
      DOM.statusList.appendChild(item);
    });
  }

  function updateServiceUIStatus(serviceId, isOnline) {
    const statusEl = document.getElementById(`status-${serviceId}`);
    if (!statusEl) return;

    if (isOnline) {
      statusEl.className = "status-badge status-online";
      statusEl.textContent = "Operational";
      statusEl.setAttribute("aria-label", "Status: Operational");
    } else {
      statusEl.className = "status-badge status-offline";
      statusEl.textContent = "Outage";
      statusEl.setAttribute("aria-label", "Status: Outage");
    }
  }

  /* ==========================================================================
               5. NETWORK HEALTH CHECK LOGIC
               ========================================================================== */
  async function performServicePing(service) {
    let isOnline = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.PING_TIMEOUT_MS);

      await fetch(service.url, {
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      isOnline = true;
    } catch (error) {
      isOnline = false;
    }

    return isOnline;
  }

  async function triggerSystemWideHealthCheck() {
    // Disable button and set loading state
    DOM.forcePingBtn.disabled = true;
    DOM.forcePingBtn.textContent = "Checking...";

    // Reset UI to pending state
    SERVICES.forEach((service) => {
      const statusEl = document.getElementById(`status-${service.id}`);
      if (statusEl) {
        statusEl.className = "status-badge status-pending";
        statusEl.textContent = "Checking...";
        statusEl.setAttribute("aria-label", "Status: Checking");
      }
    });

    // Execute checks concurrently
    const checkPromises = SERVICES.map(async (service) => {
      const isOnline = await performServicePing(service);
      updateServiceUIStatus(service.id, isOnline);
    });

    await Promise.all(checkPromises);

    // Restore button state and reset timer
    DOM.forcePingBtn.disabled = false;
    DOM.forcePingBtn.textContent = "Check Status Now";
    restartCountdownTimer();
  }

  /* ==========================================================================
               6. TIMER MECHANICS
               ========================================================================== */
  function renderTimerDisplay() {
    const mins = Math.floor(state.countdownSeconds / 60);
    const secs = state.countdownSeconds % 60;
    DOM.countdownDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function restartCountdownTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    state.countdownSeconds = CONFIG.TIMER_DURATION_SECONDS;
    renderTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.countdownSeconds--;

      if (state.countdownSeconds <= 0) {
        triggerSystemWideHealthCheck();
      } else {
        renderTimerDisplay();
      }
    }, 1000);
  }

  /* ==========================================================================
               7. INITIALIZATION BINDINGS
               ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    renderServiceList();
    triggerSystemWideHealthCheck(); // Execute initial ping

    // Bind manual refresh trigger
    DOM.forcePingBtn.addEventListener("click", triggerSystemWideHealthCheck);
  });
})();
