import { GAME_CONFIG, GAME_STATES, MODES, UI_TEXT, laneToReefX } from "./config.js";

export class AdventureGame {
    constructor({ ui, scene, audio }) {
        this.ui = ui;
        this.scene = scene;
        this.audio = audio;
        this.state = this.createInitialState();
    }

    createInitialState() {
        return {
            gameState: GAME_STATES.MENU,
            gameMode: MODES.FOREST,
            detectionFrames: 0,
            countdownLocked: false,
            groundRefY: 0,
            waistCenterX: 0.5,
            currentLane: 0,
            nextReefLane: 0,
            reefState: "IDLE",
            reefJumpProgress: 0,
            speed: 0,
            distance: 0,
            lives: GAME_CONFIG.maxLives,
            jumpVelocity: 0,
            poseState: "run",
            frameCount: 0,
            distanceSinceLastSpawn: 0,
            nextSpawnThreshold: this.randomSpawnThreshold(),
            armEnergy: 0,
            prevWristLeft: 0,
            prevWristRight: 0,
            bodyScale: 0.1,
            landmarks: null,
            requestId: null
        };
    }

    randomSpawnThreshold() {
        return 15 + Math.random() * 10;
    }

    prepare() {
        if (this.state.gameState === GAME_STATES.PREPARING || this.state.gameState === GAME_STATES.PLAYING) {
            return;
        }

        this.scene.init();
        this.resetRunState();
        this.state.gameState = GAME_STATES.PREPARING;
        this.ui.showPreparing();
        this.ui.setLoading("摄像头已就绪，等待站位。");
        this.ui.showToast("进入校准", "#fde047");
        this.audio.resume();
        this.audio.speak(UI_TEXT.prepareVoice);

        if (!this.state.requestId) {
            this.animate();
        }
    }

    resetRunState() {
        Object.assign(this.state, {
            gameMode: MODES.FOREST,
            detectionFrames: 0,
            countdownLocked: false,
            groundRefY: 0,
            waistCenterX: 0.5,
            currentLane: 0,
            nextReefLane: 0,
            reefState: "IDLE",
            reefJumpProgress: 0,
            speed: 0,
            distance: 0,
            lives: GAME_CONFIG.maxLives,
            jumpVelocity: 0,
            poseState: "run",
            frameCount: 0,
            distanceSinceLastSpawn: 0,
            nextSpawnThreshold: this.randomSpawnThreshold(),
            armEnergy: 0,
            prevWristLeft: 0,
            prevWristRight: 0,
            bodyScale: 0.1,
            landmarks: null
        });

        this.scene.resetWorld();
        this.ui.updateHud({ distance: 0, lives: GAME_CONFIG.maxLives, energy: 0 });
        this.ui.setModeLabel(MODES.FOREST);
        this.ui.hideModeIndicator();
        this.ui.hideTargetArrow();
        this.ui.setActionLabel("检测中");
        this.ui.setLaneLabel("等待站位");
        this.ui.resetStatusDots();
        this.ui.setCountdown("");
    }

    animate = () => {
        this.state.requestId = window.requestAnimationFrame(this.animate);

        if (this.state.gameState === GAME_STATES.PLAYING) {
            this.updateGame();
        }

        if (this.state.gameState !== GAME_STATES.MENU) {
            this.scene.render();
        }
    };

    updateGame() {
        if (this.state.gameMode === MODES.REEF) {
            this.updateReefMode();
        } else {
            this.updateRunnerMode();
        }

        if (this.state.gameMode === MODES.FOREST && this.state.distance > GAME_CONFIG.riverStartDistance) {
            this.switchMode(MODES.RIVER);
        } else if (this.state.gameMode === MODES.RIVER && this.state.distance > GAME_CONFIG.reefStartDistance) {
            this.switchMode(MODES.REEF);
        }
    }

    updateRunnerMode() {
        this.calculateRunningEnergy();
        this.scene.updateRunnerLane(this.state.currentLane);

        if (
            this.state.gameMode === MODES.FOREST &&
            this.state.poseState === "jump" &&
            this.scene.playerGroup.position.y <= 0
        ) {
            this.state.jumpVelocity = GAME_CONFIG.jumpForce;
            this.audio.playSFX("jump");
        }

        this.state.jumpVelocity = this.scene.applyPhysics(this.state.jumpVelocity);

        if (this.state.speed > 0.005) {
            this.state.frameCount += this.state.speed * 40;
            this.scene.animateCharacter(this.state.frameCount, this.state.gameMode);
        }

        this.scene.manageObstacles(this.state.speed * 25, this.state.gameMode, this.state.currentLane, {
            onHit: () => this.handleCrash(),
            onPerfect: () => this.ui.showToast("Nice!", "#4ade80")
        });

        if (this.state.distance > 10 && this.state.distanceSinceLastSpawn > this.state.nextSpawnThreshold) {
            this.scene.spawnWave(this.state.gameMode);
            this.state.distanceSinceLastSpawn = 0;
            this.state.nextSpawnThreshold = this.randomSpawnThreshold();
        }
    }

    updateReefMode() {
        if (this.scene.reefPlatforms.length < 2) {
            this.state.nextReefLane = this.scene.spawnNextReef(this.state.nextReefLane);
            this.ui.showTargetArrow(this.state.nextReefLane);
        }

        if (this.state.reefState === "IDLE") {
            this.scene.updateReefLane(this.state.currentLane);
            if (this.state.poseState === "jump") {
                this.audio.playSFX("jump");
                this.state.reefState = "JUMPING";
                this.state.reefJumpProgress = 0;
            }
            return;
        }

        if (this.state.reefState === "JUMPING") {
            this.state.reefJumpProgress += 0.04;
            this.scene.playerGroup.position.y = Math.sin(this.state.reefJumpProgress * Math.PI) * 2;
            this.scene.updateReefLane(this.state.currentLane);
            this.scene.moveWorldBack(0.4);

            if (this.state.reefJumpProgress >= 1) {
                this.scene.playerGroup.position.y = 0;
                if (this.state.currentLane === this.state.nextReefLane) {
                    this.state.reefState = "LANDED";
                    this.state.currentLane = this.state.nextReefLane;
                    this.state.distance += 10;
                    this.ui.updateHud({ distance: this.state.distance });
                    this.audio.playSFX("land");
                    this.ui.showToast("完美落点", "#22c55e");
                    this.scene.advanceReef();
                    this.ui.hideTargetArrow();
                    window.setTimeout(() => {
                        if (this.state.gameState === GAME_STATES.PLAYING) {
                            this.state.reefState = "IDLE";
                        }
                    }, 200);
                } else {
                    this.state.reefState = "FALLING";
                }
            }
            return;
        }

        if (this.state.reefState === "FALLING") {
            this.scene.playerGroup.position.y -= 0.1;
            if (this.scene.playerGroup.position.y < -2) {
                this.audio.playSFX("splash");
                this.state.lives -= 1;
                this.ui.updateHud({ lives: this.state.lives });

                if (this.state.lives <= 0) {
                    this.gameOver();
                    return;
                }

                this.state.reefState = "IDLE";
                this.state.currentLane = this.state.nextReefLane;
                this.scene.playerGroup.position.y = 0;
                this.scene.playerGroup.position.x = laneToReefX(this.state.nextReefLane);
                this.scene.advanceReef();
                this.ui.hideTargetArrow();
                this.ui.showToast("落水复位", "#fb923c");
            }
        }
    }

    calculateRunningEnergy() {
        const landmarks = this.state.landmarks;
        if (landmarks?.length) {
            const shoulderLeft = landmarks[11];
            const shoulderRight = landmarks[12];
            const wristLeft = landmarks[15];
            const wristRight = landmarks[16];

            this.state.bodyScale =
                this.state.bodyScale * 0.95 + Math.abs(shoulderLeft.x - shoulderRight.x) * 0.05;

            const relativeLeft = wristLeft.y - shoulderLeft.y;
            const relativeRight = wristRight.y - shoulderRight.y;
            const velocityLeft = Math.abs(relativeLeft - this.state.prevWristLeft);
            const velocityRight = Math.abs(relativeRight - this.state.prevWristRight);

            this.state.prevWristLeft = relativeLeft;
            this.state.prevWristRight = relativeRight;

            const hasStrongMotion =
                velocityLeft > this.state.bodyScale * 0.1 ||
                velocityRight > this.state.bodyScale * 0.1;

            if (hasStrongMotion) {
                if (this.state.gameMode === MODES.RIVER) {
                    if (velocityLeft > 0.05 && velocityRight > 0.05) {
                        this.state.armEnergy += (velocityLeft + velocityRight) * 150;
                    } else {
                        this.state.armEnergy += (velocityLeft + velocityRight) * 60;
                    }
                } else {
                    this.state.armEnergy += Math.min(4, (velocityLeft + velocityRight) * 120);
                }
            }
        }

        this.state.armEnergy *= 0.92;

        let targetSpeed = GAME_CONFIG.idleSpeed + this.state.armEnergy * GAME_CONFIG.accelFactor;
        if (targetSpeed > GAME_CONFIG.maxSpeed) {
            targetSpeed = GAME_CONFIG.maxSpeed;
        }

        this.state.speed = this.state.speed * 0.9 + targetSpeed * 0.1;
        this.state.distance += this.state.speed * 5;
        this.state.distanceSinceLastSpawn += this.state.speed * 25;

        this.ui.updateHud({
            distance: this.state.distance,
            lives: this.state.lives,
            energy: this.state.armEnergy
        });
    }

    switchMode(mode) {
        this.state.gameMode = mode;
        this.state.poseState = "run";
        this.state.distanceSinceLastSpawn = 0;
        this.state.nextSpawnThreshold = this.randomSpawnThreshold();

        if (mode === MODES.RIVER) {
            this.scene.setRiverMode();
            this.ui.setModeLabel(mode);
            this.ui.showModeIndicator();
            this.ui.hideTargetArrow();
            this.ui.showToast("双手同步划船", "#7dd3fc");
            this.audio.playSFX("splash");
            this.audio.speak(UI_TEXT.riverVoice);
            return;
        }

        if (mode === MODES.REEF) {
            this.scene.setReefMode();
            this.state.currentLane = 0;
            this.state.nextReefLane = 0;
            this.state.reefState = "IDLE";
            this.state.reefJumpProgress = 0;
            this.ui.setModeLabel(mode);
            this.ui.showModeIndicator();
            this.ui.setLaneLabel("中");
            this.ui.showToast("双脚同时起跳", "#facc15");
            this.audio.speak(UI_TEXT.reefVoice);
        }
    }

    handleCrash() {
        this.state.lives -= 1;
        this.state.speed = 0;
        this.state.armEnergy = 0;
        this.state.jumpVelocity = 0;
        this.ui.updateHud({ lives: this.state.lives, energy: 0 });
        this.ui.showToast("撞到了", "#ef4444");
        this.ui.shakeContainer();
        this.audio.playSFX("hit");

        if (this.state.lives <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.state.gameState = GAME_STATES.GAME_OVER;
        this.audio.stopBGM();
        this.audio.speak(UI_TEXT.gameOverVoice);

        window.setTimeout(() => {
            window.alert(`训练结束，成绩 ${Math.floor(this.state.distance)} 米。`);
            this.resetToMenu();
        }, 350);
    }

    resetToMenu() {
        if (this.state.requestId) {
            window.cancelAnimationFrame(this.state.requestId);
            this.state.requestId = null;
        }

        this.audio.stopBGM();
        this.resetRunState();
        this.state.gameState = GAME_STATES.MENU;
        this.ui.showStartScreen();
        this.ui.setLoading("摄像头已就绪，点击再次挑战。");
        this.ui.setStartButtonLabel("再次挑战");
        this.scene.render();
    }

    checkJumpVsRun(landmarks) {
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        if (!leftAnkle || !rightAnkle) return false;

        const ankleDiffY = Math.abs(leftAnkle.y - rightAnkle.y);
        const isFeetSynced = ankleDiffY < 0.06;
        const avgFootY = (leftAnkle.y + rightAnkle.y) / 2;
        const heightFromGround = this.state.groundRefY - avgFootY;
        const isAirborne = heightFromGround > this.state.bodyScale * 0.08;
        return isFeetSynced && isAirborne;
    }

    handlePoseResults(results) {
        if (!results.poseLandmarks) return;
        this.state.landmarks = results.poseLandmarks;

        if (this.state.gameState === GAME_STATES.PREPARING) {
            this.handlePreparationPose(results.poseLandmarks);
            return;
        }

        if (this.state.gameState !== GAME_STATES.PLAYING) return;

        const currentHipX = (results.poseLandmarks[23].x + results.poseLandmarks[24].x) / 2;

        if (this.state.gameMode === MODES.REEF) {
            if (currentHipX > this.state.waistCenterX + GAME_CONFIG.waistSensitivity) {
                this.state.currentLane = -1;
            } else if (currentHipX < this.state.waistCenterX - GAME_CONFIG.waistSensitivity) {
                this.state.currentLane = 1;
            } else {
                this.state.currentLane = 0;
            }

            const reefLabel =
                this.state.currentLane === -1 ? "左" : this.state.currentLane === 1 ? "右" : "中";
            this.ui.setLaneLabel(reefLabel);
        } else {
            if (currentHipX > this.state.waistCenterX + GAME_CONFIG.waistSensitivity) {
                this.state.currentLane = 0;
            } else if (currentHipX < this.state.waistCenterX - GAME_CONFIG.waistSensitivity) {
                this.state.currentLane = 1;
            }

            this.ui.setLaneLabel(this.state.currentLane === 0 ? "左道" : "右道");
        }

        this.state.poseState = this.checkJumpVsRun(results.poseLandmarks) ? "jump" : "run";

        let actionText = "跑步";
        if (this.state.gameMode === MODES.RIVER) {
            actionText = "划船";
        }
        if (this.state.poseState === "jump") {
            actionText = "跳跃";
        }
        if (this.state.gameMode === MODES.REEF) {
            actionText = this.state.poseState === "jump" ? "起跳" : "站立";
        }

        this.ui.setActionLabel(actionText);

        const fullBodyVisible =
            results.poseLandmarks[27].visibility > 0.4 &&
            results.poseLandmarks[28].visibility > 0.4 &&
            results.poseLandmarks[0].visibility > 0.4;
        this.ui.updateStatusDot("camera", fullBodyVisible);
    }

    handlePreparationPose(landmarks) {
        const headVisible = landmarks[0].visibility > 0.4;
        const feetVisible = landmarks[27].visibility > 0.4 || landmarks[28].visibility > 0.4;
        const isFullBody = headVisible && feetVisible;
        this.ui.updateStatusDot("body", isFullBody);

        const noseY = landmarks[0].y;
        const leftWristY = landmarks[15].y;
        const rightWristY = landmarks[16].y;
        const isHandRaised = leftWristY < noseY || rightWristY < noseY;
        this.ui.updateStatusDot("hand", isHandRaised);

        if (isFullBody && isHandRaised) {
            const currentGround = Math.max(landmarks[27].y, landmarks[28].y);
            this.state.detectionFrames += 1;

            if (this.state.detectionFrames > 1) {
                this.state.groundRefY = currentGround;
                this.state.waistCenterX = (landmarks[23].x + landmarks[24].x) / 2;
            }

            if (this.state.detectionFrames >= GAME_CONFIG.preparationFrames) {
                this.startCountdown();
            }
        } else {
            this.state.detectionFrames = 0;
            this.ui.setCountdown("");
        }
    }

    startCountdown() {
        if (this.state.countdownLocked) return;
        this.state.countdownLocked = true;
        this.ui.setCountdown("GO!");

        window.setTimeout(() => {
            if (this.state.gameState !== GAME_STATES.PREPARING) return;
            this.startGameLogic();
        }, 500);
    }

    startGameLogic() {
        this.state.gameState = GAME_STATES.PLAYING;
        this.state.distanceSinceLastSpawn = 100;
        this.state.nextSpawnThreshold = this.randomSpawnThreshold();
        this.ui.hideStartScreen();
        this.ui.showModeIndicator();
        this.ui.showToast("开跑", "#fde047");
        this.audio.startBGM();
    }
}

