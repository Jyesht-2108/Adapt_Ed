/**
 * ProctorEye — Webcam-based proctoring using MediaPipe Tasks Vision
 * 
 * Detects:
 * - No face (user left the frame)
 * - Multiple faces (unauthorized person)
 * - Looking away (head pose estimation via nose landmark)
 * - Phone/device detection (object detection via EfficientDet)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver, ObjectDetector } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult, Detection } from '@mediapipe/tasks-vision';

interface ProctorEyeProps {
  onViolation: (type: string, message: string) => void;
  isActive?: boolean;
}

export default function ProctorEye({ onViolation, isActive = true }: ProctorEyeProps) {
  const webcamRef = useRef<Webcam>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const objectDetectorRef = useRef<ObjectDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef<number>(Date.now());

  const [noFaceStartTime, setNoFaceStartTime] = useState<number | null>(null);
  const [lookingAwayStartTime, setLookingAwayStartTime] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'active' | 'no-face' | 'multiple-faces' | 'looking-away' | 'phone-detected'>('active');

  const phoneDetectionCountRef = useRef<number>(0);

  // Constants
  const NO_FACE_THRESHOLD_MS = 2000;
  const LOOKING_AWAY_THRESHOLD_MS = 2000;
  const DETECTION_INTERVAL_MS = 100;
  const HEAD_POSE_THRESHOLD = 0.15;
  const PHONE_DETECTION_THRESHOLD = 15;

  const initializeModels = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 2,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });

      const objectDetector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        scoreThreshold: 0.3,
        maxResults: 10,
        categoryAllowlist: ['cell phone', 'remote control', 'book', 'laptop']
      });

      faceLandmarkerRef.current = faceLandmarker;
      objectDetectorRef.current = objectDetector;
      setIsInitialized(true);
      setInitError(null);
    } catch (error) {
      console.error('[ProctorEye] Failed to initialize:', error);
      setInitError('Failed to initialize detection models. Please refresh.');
      setIsInitialized(false);
    }
  }, []);

  const isLookingAway = useCallback((result: FaceLandmarkerResult): boolean => {
    if (result.faceLandmarks.length === 0) return false;
    const landmarks = result.faceLandmarks[0];
    const noseTip = landmarks[1];
    const leftFaceEdge = landmarks[234];
    const rightFaceEdge = landmarks[454];
    const faceWidth = Math.abs(rightFaceEdge.x - leftFaceEdge.x);
    const faceCenter = (leftFaceEdge.x + rightFaceEdge.x) / 2;
    const noseOffset = Math.abs(noseTip.x - faceCenter);
    return (noseOffset / faceWidth) > HEAD_POSE_THRESHOLD;
  }, []);

  const detectViolations = useCallback(() => {
    if (!isActive || !isInitialized || !faceLandmarkerRef.current || !objectDetectorRef.current || !webcamRef.current) {
      return;
    }

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectViolations);
      return;
    }

    const now = Date.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
      animationFrameRef.current = requestAnimationFrame(detectViolations);
      return;
    }
    lastDetectionTimeRef.current = now;

    try {
      const faceResult = faceLandmarkerRef.current.detectForVideo(video, now);
      const numFaces = faceResult.faceLandmarks.length;

      const objectResult = objectDetectorRef.current.detectForVideo(video, now);
      const detections = objectResult.detections || [];

      // Phone detection (accumulator-based)
      let phoneDetectedThisFrame = false;
      for (const detection of detections) {
        const category = (detection as Detection).categories[0];
        if (!category) continue;
        const categoryName = category.categoryName.toLowerCase();
        const score = category.score || 0;
        const isPhone = categoryName.includes('cell') || categoryName.includes('phone') || categoryName.includes('remote');
        if (isPhone && score >= 0.3) {
          phoneDetectedThisFrame = true;
          break;
        }
      }

      if (phoneDetectedThisFrame) {
        phoneDetectionCountRef.current++;
      } else {
        phoneDetectionCountRef.current = Math.max(0, phoneDetectionCountRef.current - 1);
      }

      if (phoneDetectionCountRef.current > PHONE_DETECTION_THRESHOLD) {
        setCurrentStatus('phone-detected');
        onViolation('UNAUTHORIZED_DEVICE', 'Unauthorized device (phone) detected');
        phoneDetectionCountRef.current = 0;
      }

      // Face detection rules
      if (numFaces === 0) {
        setCurrentStatus('no-face');
        if (noFaceStartTime === null) {
          setNoFaceStartTime(now);
        } else if (now - noFaceStartTime >= NO_FACE_THRESHOLD_MS) {
          onViolation('NO_FACE', 'No face detected in frame');
          setNoFaceStartTime(now);
        }
        setLookingAwayStartTime(null);
      } else if (numFaces > 1) {
        setCurrentStatus('multiple-faces');
        onViolation('MULTIPLE_FACES', 'Multiple faces detected');
        setNoFaceStartTime(null);
        setLookingAwayStartTime(null);
      } else if (isLookingAway(faceResult)) {
        setCurrentStatus('looking-away');
        if (lookingAwayStartTime === null) {
          setLookingAwayStartTime(now);
        } else if (now - lookingAwayStartTime >= LOOKING_AWAY_THRESHOLD_MS) {
          onViolation('LOOKING_AWAY', 'User is looking away from screen');
          setLookingAwayStartTime(now);
        }
        setNoFaceStartTime(null);
      } else {
        if (phoneDetectionCountRef.current === 0) {
          setCurrentStatus('active');
        }
        setNoFaceStartTime(null);
        setLookingAwayStartTime(null);
      }
    } catch (error) {
      console.error('[ProctorEye] Detection error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectViolations);
  }, [isActive, isInitialized, noFaceStartTime, lookingAwayStartTime, onViolation, isLookingAway]);

  useEffect(() => {
    initializeModels();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
      if (objectDetectorRef.current) objectDetectorRef.current.close();
    };
  }, [initializeModels]);

  useEffect(() => {
    if (isActive && isInitialized) {
      detectViolations();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive, isInitialized, detectViolations]);

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'active': return 'border-green-500';
      case 'no-face': return 'border-yellow-500';
      case 'multiple-faces': return 'border-red-500';
      case 'looking-away': return 'border-orange-500';
      case 'phone-detected': return 'border-red-600 animate-pulse';
      default: return 'border-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isActive) return 'Proctor Inactive';
    if (!isInitialized) return 'Initializing...';
    switch (currentStatus) {
      case 'active': return '✅ Monitoring Active';
      case 'no-face': return '⚠️ No Face Detected';
      case 'multiple-faces': return '🚫 Multiple Faces';
      case 'looking-away': return '⚠️ Looking Away';
      case 'phone-detected': return '📱 Phone Detected!';
      default: return 'Active';
    }
  };

  if (initError) {
    return (
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-red-600">{initError}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`relative rounded-lg overflow-hidden shadow-lg border-4 transition-colors duration-300 ${getStatusColor()}`}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
          className="w-full h-auto object-cover"
          mirrored={true}
        />

        {/* Status overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">{getStatusText()}</span>
            {isActive && isInitialized && currentStatus === 'active' && (
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay */}
        {!isInitialized && !initError && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-white font-medium">Loading models...</p>
            </div>
          </div>
        )}
      </div>

      {/* Warning message */}
      {isActive && isInitialized && currentStatus !== 'active' && (
        <div className="mt-2 bg-orange-50 border border-orange-200 rounded-md p-2">
          <p className="text-xs text-orange-700 text-center">
            {currentStatus === 'no-face' && 'Please stay in frame'}
            {currentStatus === 'multiple-faces' && 'Only one person allowed'}
            {currentStatus === 'looking-away' && 'Please look at the screen'}
            {currentStatus === 'phone-detected' && '📱 Remove phone immediately!'}
          </p>
        </div>
      )}
    </div>
  );
}
