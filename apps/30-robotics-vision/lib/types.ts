// Robotics Vision types
export interface Camera {
  id: string;
  robotId: string;
  resolution: string;
  frameRate: number;
  status: "active" | "inactive";
}

export interface VisionDetection {
  id: string;
  cameraId: string;
  timestamp: Date;
  type: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface ImageProcessingTask {
  id: string;
  imageId: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: string;
}
