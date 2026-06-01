import { useEffect, useRef, type MouseEvent, type TouchEvent } from "react";
import { useRoomState, useRoomStore } from "../state/roomStore";
import type { CanvasPoint, CanvasStroke } from "../services/api";

interface CanvasProps {
  color: string;
  width: number;
}

export function DrawingCanvas({ color, width }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<CanvasPoint[]>([]);
  const { room, participantId } = useRoomState();
  const store = useRoomStore();

  const isDrawer = participantId !== null && participantId === room?.drawerId;

  function getPos(event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>): CanvasPoint {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in event) {
      const touch = event.touches[0] ?? event.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function startDrawing(event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) {
    if (!isDrawer) return;
    isDrawingRef.current = true;
    const pos = getPos(event);

    if ("touches" in event) {
      event.preventDefault();
    }

    currentPointsRef.current = [pos];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current || !isDrawer) return;
    const pos = getPos(event);

    if ("touches" in event) {
      event.preventDefault();
    }

    currentPointsRef.current.push(pos);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (!isDrawingRef.current || !isDrawer) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length >= 2 && room && participantId) {
      const stroke: CanvasStroke = {
        points: currentPointsRef.current,
        color,
        width
      };
      store.saveStroke(room.code, participantId, stroke);
    }
    currentPointsRef.current = [];
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!room || !room.canvasStrokes) return;
    for (const stroke of room.canvasStrokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, [room?.canvasStrokes, room?.code]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      style={{
        width: "100%",
        height: "500px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        cursor: isDrawer ? "crosshair" : "default",
        touchAction: isDrawer ? "none" : "auto"
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
}
