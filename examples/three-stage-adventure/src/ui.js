import { GAME_CONFIG, MODE_META } from "./config.js";

export function createUI() {
    const els = {
        gameContainer: document.getElementById("game-container"),
        canvas: document.getElementById("scene-canvas"),
        video: document.getElementById("input-video"),
        score: document.getElementById("score"),
        lives: document.getElementById("lives"),
        energyBar: document.getElementById("energy-bar"),
        modeIndicator: document.getElementById("mode-indicator"),
        targetArrow: document.getElementById("target-arrow"),
        toast: document.getElementById("toast"),
        actionText: document.getElementById("action-text"),
        laneText: document.getElementById("lane-text"),
        startScreen: document.getElementById("start-screen"),
        introText: document.getElementById("intro-text"),
        detectStatus: document.getElementById("detect-status"),
        countdown: document.getElementById("countdown"),
        startBtn: document.getElementById("start-btn"),
        loading: document.getElementById("loading"),
        statusCamera: document.getElementById("status-camera"),
        statusBody: document.getElementById("status-body"),
        statusHand: document.getElementById("status-hand")
    };

    let toastTimer = null;

    function updateHud({ distance, lives, energy }) {
        if (typeof distance === "number") {
            els.score.textContent = `${Math.floor(distance)}m`;
        }
        if (typeof lives === "number") {
            els.lives.textContent = "❤".repeat(Math.max(0, lives));
        }
        if (typeof energy === "number") {
            els.energyBar.style.width = `${Math.max(0, Math.min(100, energy))}%`;
        }
    }

    function setModeLabel(mode) {
        const meta = MODE_META[mode];
        if (!meta) return;
        els.modeIndicator.textContent = meta.banner;
        els.modeIndicator.style.color = meta.accent;
    }

    function showModeIndicator() {
        els.modeIndicator.style.display = "block";
        els.modeIndicator.classList.remove("is-pulsing");
        window.requestAnimationFrame(() => els.modeIndicator.classList.add("is-pulsing"));
    }

    function hideModeIndicator() {
        els.modeIndicator.style.display = "none";
    }

    function setActionLabel(text) {
        els.actionText.textContent = text;
    }

    function setLaneLabel(text) {
        els.laneText.textContent = text;
    }

    function setCountdown(text) {
        els.countdown.textContent = text;
    }

    function setLoading(text, isError = false) {
        els.loading.textContent = text;
        els.loading.classList.toggle("is-error", isError);
    }

    function updateStatusDot(kind, ok) {
        const map = {
            camera: els.statusCamera,
            body: els.statusBody,
            hand: els.statusHand
        };
        const el = map[kind];
        if (!el) return;
        el.classList.toggle("is-ok", ok);
        el.classList.toggle("is-bad", !ok);
    }

    function resetStatusDots() {
        ["camera", "body", "hand"].forEach((kind) => updateStatusDot(kind, false));
    }

    function showToast(text, color = "#ffffff") {
        els.toast.textContent = text;
        els.toast.style.color = color;
        els.toast.style.opacity = "1";
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            els.toast.style.opacity = "0";
        }, 700);
    }

    function showTargetArrow(lane) {
        els.targetArrow.style.display = "block";
        els.targetArrow.style.left = `${50 + lane * 20}%`;
    }

    function hideTargetArrow() {
        els.targetArrow.style.display = "none";
    }

    function showPreparing() {
        els.startScreen.style.display = "flex";
        els.introText.style.display = "none";
        els.detectStatus.style.display = "block";
        els.startBtn.style.display = "none";
    }

    function showStartScreen() {
        els.startScreen.style.display = "flex";
        els.introText.style.display = "grid";
        els.detectStatus.style.display = "none";
        els.startBtn.style.display = "inline-block";
        setCountdown("");
    }

    function hideStartScreen() {
        els.startScreen.style.display = "none";
    }

    function bindStart(handler) {
        els.startBtn.addEventListener("click", handler);
    }

    function setStartDisabled(disabled, label = null) {
        els.startBtn.disabled = disabled;
        if (label) {
            els.startBtn.textContent = label;
        }
    }

    function setStartButtonLabel(label) {
        els.startBtn.textContent = label;
    }

    function shakeContainer() {
        els.gameContainer.classList.remove("is-shaking");
        window.requestAnimationFrame(() => els.gameContainer.classList.add("is-shaking"));
        window.setTimeout(() => {
            els.gameContainer.classList.remove("is-shaking");
        }, 420);
    }

    updateHud({ distance: 0, lives: GAME_CONFIG.maxLives, energy: 0 });
    setModeLabel("FOREST");
    setActionLabel("检测中");
    setLaneLabel("等待站位");
    resetStatusDots();

    return {
        els,
        bindStart,
        updateHud,
        setModeLabel,
        showModeIndicator,
        hideModeIndicator,
        setActionLabel,
        setLaneLabel,
        setCountdown,
        setLoading,
        updateStatusDot,
        resetStatusDots,
        showToast,
        showTargetArrow,
        hideTargetArrow,
        showPreparing,
        showStartScreen,
        hideStartScreen,
        setStartDisabled,
        setStartButtonLabel,
        shakeContainer
    };
}

