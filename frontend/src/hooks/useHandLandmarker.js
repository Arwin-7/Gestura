import { useEffect, useRef, useState, useCallback } from 'react';

export const useHandLandmarker = () => {
    const landmarkerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                const { FilesetResolver, HandLandmarker } = await import(
                    /* @vite-ignore */
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs'
                );

                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
                );

                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: 1,
                });

                if (!cancelled) {
                    landmarkerRef.current = landmarker;
                    setIsReady(true);
                    console.log('MediaPipe HandLandmarker ready (via CDN)');
                }
            } catch (err) {
                console.error('Failed to init HandLandmarker:', err);
            }
        };

        init();
        return () => { cancelled = true; };
    }, []);

    const detectLandmarks = useCallback((videoEl) => {
        if (!landmarkerRef.current || !isReady || !videoEl) return null;
        if (videoEl.readyState < 2) return null;

        const result = landmarkerRef.current.detectForVideo(videoEl, performance.now());

        if (!result.landmarks || result.landmarks.length === 0) return null;

        const flat = [];
        for (const lm of result.landmarks[0]) {
            flat.push(lm.x, lm.y, lm.z);
        }
        return flat;
    }, [isReady]);

    return { isReady, detectLandmarks };
};
