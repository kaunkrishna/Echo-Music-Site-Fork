(function () {
  "use strict";

  const CONFIG = {
    TIMER_DURATION_SECONDS: 5 * 60,
    PING_TIMEOUT_MS: 10000,
  };

  const SERVICES = [
    { id: "canvas", name: "Canvas", url: "https://canvas.echomusic.fun" },
    { id: "youtube", name: "YouTube Music", url: "https://music.youtube.com" },
    { id: "saavn-1", name: "Server 1 - Saavn", url: "https://saavn.echomusic.fun" },
    { id: "saavn-2", name: "Server 2 - Saavn", url: "https://jiosaavn-api.pc-adityadav9532.workers.dev" },
    { id: "saavn-3", name: "Server 3 - Saavn", url: "https://jiosaavn-api.mac-adityadav9532.workers.dev" },
    { id: "qobuz", name: "Qobuz Lossless", url: "https://qobuz.kennyy.com.br" },
  ];

  const DOM = {
    statusList: document.getElementById("status-list"),
    forcePingBtn: document.getElementById("force-ping-btn"),
    countdownDisplay: document.getElementById("countdown"),
  };

  let state = {
    countdownSeconds: CONFIG.TIMER_DURATION_SECONDS,
    timerInterval: null,
  };

  function renderServiceList() {
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
    DOM.forcePingBtn.disabled = true;
    DOM.forcePingBtn.textContent = "Checking...";

    SERVICES.forEach((service) => {
      const statusEl = document.getElementById(`status-${service.id}`);
      if (statusEl) {
        statusEl.className = "status-badge status-pending";
        statusEl.textContent = "Checking...";
        statusEl.setAttribute("aria-label", "Status: Checking");
      }
    });

    const checkPromises = SERVICES.map(async (service) => {
      const isOnline = await performServicePing(service);
      updateServiceUIStatus(service.id, isOnline);
    });

    await Promise.all(checkPromises);

    DOM.forcePingBtn.disabled = false;
    DOM.forcePingBtn.textContent = "Check Status Now";
    restartCountdownTimer();
  }

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

  document.addEventListener("DOMContentLoaded", () => {
    renderServiceList();
    triggerSystemWideHealthCheck();

    DOM.forcePingBtn.addEventListener("click", triggerSystemWideHealthCheck);
  });
})();
