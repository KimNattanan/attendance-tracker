"use client";

import * as faceapi from "face-api.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAttendance } from "@/features/attendances/api/create-attendance";
import { Location } from "@/lib/utils";
import { CheckCircleIcon } from "lucide-react";

export default function CheckOut(){
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<
    "idle" | "loading_models" | "camera_on" | "scanning" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const canScan = useMemo(() => status === "camera_on" || status === "idle", [status]);

  const [location, setLocation] = useState<Location>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    })});

    let cancelled = false;

    async function loadModels(){
      try {
        setStatus("loading_models");
        setError("");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        if(!cancelled) setStatus("idle");
      } catch(e) {
        if(!cancelled){
          setStatus("error");
          setError(e instanceof Error ? e.message : "Failed to load face models");
        }
      }
    }

    loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const el = videoRef.current;
      if(!el) throw new Error("Video element not ready");
      el.srcObject = stream;
      await el.play();
      setStatus("camera_on");
    } catch(e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to start camera");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if(videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

  const handleFaceScan = useCallback(async () => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if(!videoEl || !canvasEl) return;

    try {
      setStatus("scanning");
      setError("");

      const { videoWidth, videoHeight } = videoEl;
      if(!videoWidth || !videoHeight) throw new Error("Camera not ready");

      canvasEl.width = videoWidth;
      canvasEl.height = videoHeight;
      const ctx = canvasEl.getContext("2d");
      if(!ctx) throw new Error("Canvas not available");
      ctx.drawImage(videoEl, 0, 0, videoWidth, videoHeight);

      const detection = await faceapi
        .detectSingleFace(canvasEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if(!detection){
        throw new Error("No face detected. Please center your face and try again.");
      }

      if(!location){
        throw new Error("Unable to get user's location.");
      }

      const result = await createAttendance({
        faceId: detection.descriptor,
        latitude: location.lat,
        longitude: location.lng,
        attendanceType: "check-out",
      });

      if (!result.success) {
        setStatus("camera_on");
        setError(result.error);
        return;
      }

      setUserId(result.data.userId);
      setStatus("success");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch (e) {
      setStatus("camera_on");
      setError(e instanceof Error ? e.message : "Scan failed");
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl space-y-4 border rounded-md p-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Check out: Face scan</h1>
          <p className="text-sm text-muted-foreground">
            This uses your camera to compute a face embedding in the browser, then stores a
            hashed “Face ID” in the database.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center" hidden={status !== "success"}>
          <CheckCircleIcon className="w-20 h-20 text-green-500" />
        </div>

        <div className="space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black/5 relative" hidden={status === "success"}>
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex flex-col sm:flex-row gap-2" hidden={status === "success"}>
            <Button
              type="button"
              onClick={startCamera}
              disabled={status === "loading_models" || status === "scanning" || status === "camera_on"}
            >
              Start camera
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              disabled={status === "loading_models" || status === "scanning" || (!streamRef.current && status !== "camera_on")}
            >
              Stop camera
            </Button>
            <Button type="button" onClick={handleFaceScan} disabled={!canScan || !streamRef.current}>
              Scan face
            </Button>
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {status === "loading_models"
                ? "Loading face models…"
                : status === "scanning"
                  ? "Scanning…"
                  : status === "success"
                    ? "Success."
                    : "Note: You must register first, but you do not need to log in to check out."}
            </p>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Input value={userId} readOnly placeholder="UserID will appear here" />
          </div>
        </div>
      </div>
    </div>
  );
}