import { useState } from "react";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GuessForm() {
  const [guessText, setGuessText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { room, participantId } = useRoomState();
  const store = useRoomStore();

  const isDrawer = participantId !== null && participantId === room?.drawerId;

  if (isDrawer || !room || !participantId) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = guessText.trim();

    if (!trimmed) {
      setError("Guess cannot be empty");
      return;
    }

    if (trimmed.length > 100) {
      setError("Guess cannot exceed 100 characters");
      return;
    }

    if (!room || !participantId) {
      return;
    }

    setSubmitting(true);

    try {
      await store.submitGuess(room.code, participantId, trimmed);
      setGuessText("");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Failed to submit guess";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form__error">{error}</div>}
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => setGuessText(event.target.value)}
          placeholder="Type your guess here..."
          disabled={submitting}
        />
      </label>
      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Guess"}
        </button>
      </div>
    </form>
  );
}
