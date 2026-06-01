import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function Scoreboard() {
  const { room } = useRoomState();

  if (!room || room.participants.length === 0) {
    return (
      <Card title="Scoreboard">
        <div className="placeholder-block" style={{ backgroundColor: '#f9fafb' }}>
          <div className="placeholder-row">
            <span>Waiting for players...</span>
            <strong>0</strong>
          </div>
        </div>
      </Card>
    );
  }

  const sorted = [...room.participants].sort((a, b) => b.score - a.score);

  return (
    <Card title="Scoreboard">
      <div className="score-display">
        {sorted.map((p) => (
          <div key={p.id} className="score-row">
            <span className="score-row__name">{p.name}</span>
            <div>
              <span className="score-row__points">{p.score}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
