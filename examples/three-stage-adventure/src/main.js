import { SoundSystem } from "./audio.js";
import { AdventureGame } from "./game.js";
import { createPoseController } from "./pose.js";
import { AdventureScene } from "./scene.js";
import { createUI } from "./ui.js";

const ui = createUI();
const audio = new SoundSystem();
const scene = new AdventureScene(ui.els.canvas);
const game = new AdventureGame({ ui, scene, audio });

scene.init();
scene.render();

const poseController = createPoseController({
    videoEl: ui.els.video,
    onResults: (results) => game.handlePoseResults(results),
    onReady: () => ui.setLoading("摄像头已就绪，开始站位校准。"),
    onError: () => {
        ui.setLoading("摄像头启动失败，请检查浏览器权限。", true);
        ui.showToast("需要摄像头权限", "#fca5a5");
    }
});

window.__aiPeLab = {
    ui,
    audio,
    scene,
    game,
    poseController
};

ui.bindStart(async () => {
    ui.setStartDisabled(true, "启动中...");

    try {
        await poseController.start();
        await audio.resume();
        game.prepare();
    } catch (error) {
        console.error("Failed to start pose controller:", error);
    } finally {
        ui.setStartDisabled(false, "再次准备");
    }
});

window.addEventListener("resize", () => {
    scene.resize();
});
