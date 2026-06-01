import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function GuessHistory() {
  const { room } = useRoomState();

  if (!room || room.currentRoundGuesses.length === 0) {
    return null;
  }

  const guesses = [...room.currentRoundGuesses].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <Card title={`Guesses (${guesses.length})`}>
      <div className="guess-history">
        {guesses.map((guess) => (
          <div
            key={`${guess.participantId}-${guess.timestamp}`}
            className={`guess-entry${guess.isCorrect ? " guess-entry--correct" : ""}`}
          >
            <span className="guess-entry__text">{guess.text}</span>
            <div>
              <span className="guess-entry__author">{guess.participantName}</span>
              {guess.isCorrect && <span className="guess-entry__badge">Correct!</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
