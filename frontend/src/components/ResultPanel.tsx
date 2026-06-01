import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function ResultPanel() {
  const { room } = useRoomState();

  if (!room || room.status !== "result" || !room.roundScores || room.roundScores.length === 0) {
    return null;
  }

  const correctGuesserIds = new Set(
    room.currentRoundGuesses
      .filter(g => g.isCorrect)
      .map(g => g.participantId)
  );

  const sorted = [...room.roundScores].sort((a, b) => b.points - a.points);

  return (
    <>
      <Card title="The Word Was">
        <p className="result-word">{room.secretWord ?? "Unknown"}</p>
      </Card>
      <Card title="Round Scores">
        <div className="score-display">
          {sorted.map((s) => {
            const participant = room.participants.find(p => p.id === s.participantId);
            const isCorrect = correctGuesserIds.has(s.participantId);
            return (
              <div key={s.participantId} className="score-row">
                <span className="score-row__name">
                  {participant?.name ?? "Unknown"}
                  {isCorrect && <span className="score-row__correct-badge">Correct!</span>}
                </span>
                <div>
                  <span className="score-row__points">+{s.points}</span>
                  <span className="score-row__total">{participant?.score ?? 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
