import { GAME_CONFIG, laneToReefX, laneToRunnerX } from "./config.js";

export class AdventureScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.playerGroup = null;
        this.playerBodyParts = {};
        this.boatMesh = null;
        this.groundMesh = null;
        this.waterMesh = null;
        this.obstacles = [];
        this.scenery = [];
        this.reefPlatforms = [];
    }

    init() {
        if (this.renderer) return;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x81c784);
        this.scene.fog = new THREE.Fog(0x81c784, 20, 90);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 4, 8);
        this.camera.lookAt(0, 0, -10);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(hemiLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(20, 40, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);

        this.createEnvironment();
        this.createPlayer();
    }

    render() {
        if (!this.renderer || !this.scene || !this.camera) return;
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        if (!this.renderer || !this.camera) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createEnvironment() {
        const groundGeo = new THREE.PlaneGeometry(80, 200);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.position.z = -50;
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);

        const waterGeo = new THREE.PlaneGeometry(200, 200);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x1e88e5,
            transparent: true,
            opacity: 0.82
        });
        this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.set(0, -0.5, -50);
        this.waterMesh.visible = false;
        this.scene.add(this.waterMesh);

        for (let i = 0; i < 40; i += 1) {
            this.spawnScenery(-i * 5);
        }
    }

    createPlayer() {
        this.playerGroup = new THREE.Group();

        const skinMaterial = new THREE.MeshToonMaterial({ color: 0xffccbc });
        const clothingMaterial = new THREE.MeshToonMaterial({ color: 0x1976d2 });
        const legMaterial = new THREE.MeshToonMaterial({ color: 0x263238 });

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), skinMaterial);
        head.position.y = 1.1;
        head.castShadow = true;
        this.playerGroup.add(head);

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 16), clothingMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        this.playerGroup.add(body);

        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.15, 0.4, 0);
        const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.4), legMaterial);
        leftLeg.position.y = -0.2;
        leftLeg.castShadow = true;
        leftLegGroup.add(leftLeg);
        this.playerGroup.add(leftLegGroup);
        this.playerBodyParts.leftLeg = leftLegGroup;

        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.15, 0.4, 0);
        const rightLeg = leftLeg.clone();
        rightLeg.position.y = -0.2;
        rightLegGroup.add(rightLeg);
        this.playerGroup.add(rightLegGroup);
        this.playerBodyParts.rightLeg = rightLegGroup;

        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.45);
        const leftArm = new THREE.Mesh(armGeometry, clothingMaterial);
        leftArm.position.set(-0.4, 0.7, 0);
        leftArm.castShadow = true;
        this.playerGroup.add(leftArm);
        this.playerBodyParts.leftArm = leftArm;

        const rightArm = new THREE.Mesh(armGeometry, clothingMaterial);
        rightArm.position.set(0.4, 0.7, 0);
        rightArm.castShadow = true;
        this.playerGroup.add(rightArm);
        this.playerBodyParts.rightArm = rightArm;

        this.boatMesh = new THREE.Group();
        const plank = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.1, 3),
            new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
        );
        this.boatMesh.add(plank);
        const tip = new THREE.Mesh(
            new THREE.ConeGeometry(0.9, 1, 4),
            new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
        );
        tip.rotation.x = Math.PI / 2;
        tip.rotation.y = Math.PI / 4;
        tip.position.z = -2;
        this.boatMesh.add(tip);
        this.boatMesh.position.y = 0.1;
        this.boatMesh.visible = false;
        this.playerGroup.add(this.boatMesh);

        this.scene.add(this.playerGroup);
    }

    resetWorld() {
        this.clearObstacles();
        this.clearReefs();

        if (this.playerGroup) {
            this.playerGroup.position.set(0, 0, 0);
            this.playerGroup.rotation.set(0, 0, 0);
            this.playerGroup.visible = true;
        }

        if (this.groundMesh) {
            this.groundMesh.visible = true;
            this.groundMesh.material.color.setHex(0x5d4037);
        }
        if (this.waterMesh) {
            this.waterMesh.visible = false;
        }
        if (this.boatMesh) {
            this.boatMesh.visible = false;
        }
        if (this.scene?.fog) {
            this.scene.fog.color.setHex(0x81c784);
        }
        if (this.scene?.background) {
            this.scene.background.setHex(0x81c784);
        }

        this.scenery.forEach((mesh, index) => {
            mesh.position.z = -index * 5;
        });

        this.playerBodyParts.leftLeg.rotation.x = 0;
        this.playerBodyParts.rightLeg.rotation.x = 0;
        this.playerBodyParts.leftArm.rotation.x = 0;
        this.playerBodyParts.rightArm.rotation.x = 0;
        this.playerBodyParts.leftLeg.position.y = -0.2;
        this.playerBodyParts.rightLeg.position.y = -0.2;
    }

    setRiverMode() {
        this.clearObstacles();
        this.groundMesh.visible = true;
        this.waterMesh.visible = false;
        this.groundMesh.material.color.setHex(0x29b6f6);
        this.scene.fog.color.setHex(0x29b6f6);
        this.scene.background.setHex(0x81d4fa);
        this.boatMesh.visible = true;
    }

    setReefMode() {
        this.clearObstacles();
        this.clearReefs();
        this.groundMesh.visible = false;
        this.waterMesh.visible = true;
        this.scene.fog.color.setHex(0x0277bd);
        this.scene.background.setHex(0x01579b);
        this.boatMesh.visible = false;

        const startingReef = this.createReefMesh(0, 0);
        this.reefPlatforms.push(startingReef);
    }

    updateRunnerLane(lane) {
        const targetX = laneToRunnerX(lane);
        this.playerGroup.position.x += (targetX - this.playerGroup.position.x) * 0.15;
    }

    updateReefLane(lane) {
        const targetX = laneToReefX(lane);
        this.playerGroup.position.x += (targetX - this.playerGroup.position.x) * 0.1;
    }

    applyPhysics(jumpVelocity) {
        if (this.playerGroup.position.y > 0 || jumpVelocity > 0) {
            this.playerGroup.position.y += jumpVelocity;
            jumpVelocity += GAME_CONFIG.gravity;
            this.playerBodyParts.leftLeg.rotation.x = -Math.PI / 2;
            this.playerBodyParts.rightLeg.rotation.x = -Math.PI / 2;
            this.playerBodyParts.leftLeg.position.y = 0.1;
            this.playerBodyParts.rightLeg.position.y = 0.1;
        } else {
            this.playerBodyParts.leftLeg.position.y = -0.2;
            this.playerBodyParts.rightLeg.position.y = -0.2;
            if (this.playerGroup.position.y < 0) {
                this.playerGroup.position.y = 0;
                jumpVelocity = 0;
            }
        }
        return jumpVelocity;
    }

    animateCharacter(frameCount, mode) {
        if (mode === "RIVER") {
            const rowAngle = Math.sin(frameCount) * 1.2;
            this.playerBodyParts.leftArm.rotation.x = rowAngle;
            this.playerBodyParts.rightArm.rotation.x = rowAngle;
            this.playerBodyParts.leftLeg.rotation.x = 0;
            this.playerBodyParts.rightLeg.rotation.x = 0;
            return;
        }

        this.playerBodyParts.leftLeg.rotation.x = Math.sin(frameCount) * 0.8;
        this.playerBodyParts.rightLeg.rotation.x = Math.sin(frameCount + Math.PI) * 0.8;
        this.playerBodyParts.leftArm.rotation.x = Math.sin(frameCount + Math.PI) * 0.8;
        this.playerBodyParts.rightArm.rotation.x = Math.sin(frameCount) * 0.8;
    }

    spawnScenery(zPos) {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 2),
            new THREE.MeshStandardMaterial({ color: 0x4e342e })
        );
        trunk.position.y = 1;
        group.add(trunk);

        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(1.2, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
        );
        leaves.position.y = 2.5;
        group.add(leaves);

        const side = Math.random() > 0.5 ? 1 : -1;
        group.position.set(side * (GAME_CONFIG.laneWidth + 2 + Math.random() * 5), 0, zPos);
        this.scene.add(group);
        this.scenery.push(group);
    }

    manageObstacles(moveStep, mode, currentLane, handlers = {}) {
        for (let i = this.obstacles.length - 1; i >= 0; i -= 1) {
            const obstacle = this.obstacles[i];
            obstacle.mesh.position.z += moveStep;

            if (!obstacle.passed && obstacle.mesh.position.z > -0.5 && obstacle.mesh.position.z < 0.5) {
                if (obstacle.mesh.userData.lane === currentLane) {
                    let hit = true;
                    if (mode === "FOREST" && obstacle.mesh.userData.type === "jump" && this.playerGroup.position.y > 0.2) {
                        hit = false;
                    }
                    if (hit) {
                        handlers.onHit?.();
                    } else {
                        handlers.onPerfect?.();
                    }
                    obstacle.passed = true;
                }
            }

            if (obstacle.mesh.position.z > 10) {
                this.scene.remove(obstacle.mesh);
                this.obstacles.splice(i, 1);
            }
        }

        this.scenery.forEach((mesh) => {
            mesh.position.z += moveStep;
            if (mesh.position.z > 10) {
                mesh.position.z = -100;
            }
        });
    }

    spawnWave(mode) {
        const safeLane = Math.random() < 0.5 ? 0 : 1;
        const obstacleLane = safeLane === 0 ? 1 : 0;
        const obstacleType = mode === "FOREST" && Math.random() < 0.5 ? "LOG" : "ROCK";
        this.createObstacleMesh(obstacleLane, obstacleType, mode);
    }

    createObstacleMesh(laneIdx, type, mode) {
        let mesh;
        let color = 0x546e7a;
        if (mode === "RIVER") {
            color = 0x37474f;
        }

        if (type === "LOG") {
            mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 3),
                new THREE.MeshPhongMaterial({ color: 0x8d6e63 })
            );
            mesh.rotation.z = Math.PI / 2;
            mesh.position.y = 0.25;
            mesh.userData.type = "jump";
        } else {
            mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.8),
                new THREE.MeshPhongMaterial({ color })
            );
            mesh.position.y = 0.6;
            mesh.userData.type = "dodge";
        }

        mesh.position.x = laneToRunnerX(laneIdx);
        mesh.position.z = -80;
        mesh.castShadow = true;
        mesh.userData.lane = laneIdx;
        this.scene.add(mesh);
        this.obstacles.push({ mesh, passed: false });
    }

    createReefMesh(xPos, zPos) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 2, 1, 6),
            new THREE.MeshStandardMaterial({ color: 0x616161 })
        );
        mesh.position.set(xPos, -0.5, zPos);
        this.scene.add(mesh);
        return mesh;
    }

    spawnNextReef(previousLane) {
        const lanes = [-1, 0, 1];
        let pick = previousLane;

        do {
            pick = lanes[Math.floor(Math.random() * lanes.length)];
        } while (pick === previousLane && Math.random() > 0.3);

        const mesh = this.createReefMesh(laneToReefX(pick), -10);
        this.reefPlatforms.push(mesh);
        return pick;
    }

    moveWorldBack(step) {
        this.scenery.forEach((mesh) => {
            mesh.position.z += step;
            if (mesh.position.z > 10) {
                mesh.position.z = -100;
            }
        });

        this.reefPlatforms.forEach((mesh) => {
            mesh.position.z += step;
        });
    }

    advanceReef() {
        if (!this.reefPlatforms.length) return;
        const oldReef = this.reefPlatforms.shift();
        this.scene.remove(oldReef);
    }

    clearObstacles() {
        this.obstacles.forEach((item) => this.scene.remove(item.mesh));
        this.obstacles = [];
    }

    clearReefs() {
        this.reefPlatforms.forEach((mesh) => this.scene.remove(mesh));
        this.reefPlatforms = [];
    }
}

