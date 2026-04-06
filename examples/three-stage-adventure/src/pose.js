export function createPoseController({ videoEl, onResults, onReady, onError }) {
    let startPromise = null;

    async function start() {
        if (startPromise) return startPromise;

        startPromise = (async () => {
            try {
                const pose = new Pose({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
                });

                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    minDetectionConfidence: 0.4,
                    minTrackingConfidence: 0.5
                });
                pose.onResults(onResults);

                const cameraController = new Camera(videoEl, {
                    onFrame: async () => {
                        await pose.send({ image: videoEl });
                    },
                    width: 640,
                    height: 480
                });

                await cameraController.start();
                onReady?.();
            } catch (error) {
                startPromise = null;
                onError?.(error);
                throw error;
            }
        })();

        return startPromise;
    }

    return { start };
}

