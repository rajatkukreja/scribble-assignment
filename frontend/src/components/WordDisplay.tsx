import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function WordDisplay() {
  const { room, participantId } = useRoomState();

  if (!room) {
    return null;
  }

  const isDrawer = participantId !== null && participantId === room.drawerId;

  if (room.status !== "drawing") {
    return null;
  }

  if (isDrawer && room.secretWord) {
    return (
      <Card title="Your Word">
        <p className="word-display__word">{room.secretWord}</p>
      </Card>
    );
  }

  return (
    <Card title="Secret Word">
      <p className="word-display__hidden">Waiting for the drawer to draw...</p>
    </Card>
  );
}
