export const GAME_STATES = {
    MENU: "MENU",
    PREPARING: "PREPARING",
    PLAYING: "PLAYING",
    GAME_OVER: "GAME_OVER"
};

export const MODES = {
    FOREST: "FOREST",
    RIVER: "RIVER",
    REEF: "REEF"
};

export const MODE_META = {
    [MODES.FOREST]: {
        banner: "🌲 森林奔跑模式 🌲",
        accent: "#fde047"
    },
    [MODES.RIVER]: {
        banner: "🌊 激流划船模式 🌊",
        accent: "#7dd3fc"
    },
    [MODES.REEF]: {
        banner: "🪨 礁石跳跃模式 🪨",
        accent: "#fcd34d"
    }
};

export const UI_TEXT = {
    prepareVoice: "请后退一点，全身入镜，举起一只手开始准备。",
    riverVoice: "进入激流关卡，双手同步划船。",
    reefVoice: "进入礁石关卡，看准方向，双脚同时起跳。",
    gameOverVoice: "训练结束。"
};

export const GAME_CONFIG = {
    laneWidth: 4,
    maxLives: 5,
    riverStartDistance: 50,
    reefStartDistance: 100,
    gravity: -0.022,
    jumpForce: 0.32,
    idleSpeed: 0.008,
    maxSpeed: 0.035,
    accelFactor: 0.002,
    waistSensitivity: 0.05,
    preparationFrames: 9
};

export function laneToRunnerX(lane) {
    return (lane === 0 ? -1 : 1) * (GAME_CONFIG.laneWidth / 2);
}

export function laneToReefX(lane) {
    if (lane === -1) return -(GAME_CONFIG.laneWidth / 2);
    if (lane === 1) return GAME_CONFIG.laneWidth / 2;
    return 0;
}

