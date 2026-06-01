import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrushWidthSelector } from "../components/BrushWidthSelector";
import { DrawingCanvas } from "../components/Canvas";
import { Card } from "../components/Card";
import { ClearCanvasButton } from "../components/ClearCanvasButton";
import { ColorPalette } from "../components/ColorPalette";
import { GuessForm } from "../components/GuessForm";
import { GuessHistory } from "../components/GuessHistory";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { WordDisplay } from "../components/WordDisplay";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const { room, participantId } = useRoomState();
  const store = useRoomStore();
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentWidth, setCurrentWidth] = useState(3);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const isDrawer = participantId !== null && participantId === room.drawerId;
  const drawer = room.participants.find((p) => p.id === room.drawerId);
  const roundLabel = room.currentRound > 0 ? `Round ${room.currentRound}` : "Waiting to start";

  const isHost = participantId !== null && participantId === room.hostId;

  const handleClearCanvas = useCallback(() => {
    if (room && participantId) {
      store.clearCanvas(room.code, participantId);
    }
  }, [room, participantId, store]);

  const handleEndRound = useCallback(() => {
    if (room && participantId) {
      store.endRound(room.code, participantId);
    }
  }, [room, participantId, store]);

  const handleNextRound = useCallback(() => {
    if (room && participantId) {
      store.startGame();
    }
  }, [room, participantId, store]);

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">{roundLabel}</span>
          <h1 className="game-page__title">
            {room.status === "drawing" ? (
              isDrawer ? "Draw the Word!" : "Guess the Word!"
            ) : (
              room.status === "result" ? "Round Over!" : "Guess the Word!"
            )}
          </h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          <WordDisplay />
          <Card title="Canvas">
            {isDrawer && room.status === "drawing" && (
              <div className="canvas-toolbar">
                <ColorPalette selected={currentColor} onChange={setCurrentColor} />
                <BrushWidthSelector selected={currentWidth} onChange={setCurrentWidth} />
                <ClearCanvasButton onClear={handleClearCanvas} />
              </div>
            )}
            <DrawingCanvas color={currentColor} width={currentWidth} />
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
              <div>
                <dt>Drawer</dt>
                <dd>{drawer?.name ?? "Not assigned"}</dd>
              </div>
            </dl>
          </Card>

          {!isDrawer && room.status === "drawing" && (
            <Card title="Your Guess">
              <GuessForm />
            </Card>
          )}

          <GuessHistory />
        </aside>
      </div>

      <div className="button-row">
        {isHost && room.status === "drawing" && (
          <button className="button button--danger" onClick={handleEndRound}>
            End Round
          </button>
        )}
        {isHost && room.status === "result" && (
          <button className="button button--primary" onClick={handleNextRound}>
            Next Round
          </button>
        )}
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
