import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, error, isLoading, participantId, isPolling, lastPollError } = useRoomState();
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }

    roomStore.startPolling();

    return () => {
      roomStore.stopPolling();
    };
  }, [navigate, room, roomStore]);

  const isHost = participantId !== null && room !== null && participantId === room.hostId;
  const canStart = isHost && room !== null && room.participants.length >= 2;

  async function handleStart() {
    if (!room) {
      return;
    }

    try {
      setStartError(null);
      await roomStore.startGame();
      navigate("/game");
    } catch (caughtError) {
      setStartError(caughtError instanceof Error ? caughtError.message : "Unable to start game");
    }
  }

  if (!room) {
    return null;
  }

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>
                    {participant.name}
                    {participant.id === room.hostId && (
                      <span className="host-badge">Host</span>
                    )}
                  </span>
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p className="status-line" style={{
            backgroundColor: isPolling ? "#d1fae5" : "#fef3c7",
            color: isPolling ? "#065f46" : "#b45309"
          }}>
            {isPolling ? "Connected — watching for players..." : "Polling paused"}
          </p>
          <p style={{ marginTop: "8px" }}>
            {error ?? startError ?? lastPollError ?? (isHost
              ? "Click Start Game when enough players have joined."
              : "Waiting for the host to start the game.")}
          </p>
        </Card>
      </div>

      <div className="button-row button-row--spread">
        {isHost ? (
          <button
            className="button button--primary"
            disabled={!canStart || isLoading}
            onClick={handleStart}
          >
            {isLoading ? "Starting..." : "Start Game"}
          </button>
        ) : (
          <p className="waiting-message">Waiting for host to start the game...</p>
        )}
      </div>
    </section>
  );
}
