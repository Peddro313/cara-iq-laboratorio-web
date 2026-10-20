import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker = null;
let loadingPromise = null;

/**
 * Initialize MediaPipe Face Landmarker (browser).
 * Uses the official WASM model from Google CDN.
 */
export async function initFaceLandmarker() {
  if (faceLandmarker) return faceLandmarker;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    return faceLandmarker;
  })();

  return loadingPromise;
}

/**
 * Detect face landmarks from an HTMLImageElement or HTMLCanvasElement.
 * Returns array of { index, x, y, z } in normalized coordinates (0-1).
 */
export async function detectLandmarks(imageElement) {
  const landmarker = await initFaceLandmarker();
  const result = landmarker.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    throw new Error('No face detected. Please use a clear front-facing photo.');
  }

  const landmarks = result.faceLandmarks[0];

  return landmarks.map((lm, index) => ({
    index,
    x: lm.x,
    y: lm.y,
    z: lm.z ?? 0,
  }));
}

/**
 * Load a File into an HTMLImageElement (needed by MediaPipe).
 */
export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}
