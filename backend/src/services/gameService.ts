import type { Participant, Room } from "../models/game.js";
import { selectWord } from "./wordService.js";

export function assignDrawer(participants: Participant[], drawCounts: Record<string, number>): string {
  let fewestDraws = Infinity;
  let selected = participants[0].id;

  for (const participant of participants) {
    const count = drawCounts[participant.id] ?? 0;
    if (count < fewestDraws) {
      fewestDraws = count;
      selected = participant.id;
    }
  }

  return selected;
}

export function startRound(room: Room): Room {
  const drawerId = assignDrawer(room.participants, room.drawCounts);
  const currentRound = room.currentRound + 1;
  const secretWord = selectWord(room.code, currentRound);

  room.status = "drawing";
  room.currentRound = currentRound;
  room.drawerId = drawerId;
  room.secretWord = secretWord;
  room.drawCounts[drawerId] = (room.drawCounts[drawerId] ?? 0) + 1;

  return room;
}
