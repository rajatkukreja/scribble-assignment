import type { Guess, Participant, Room, RoundScore } from "../models/game.js";
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

export function calculateRoundScores(
  participants: Participant[],
  currentRoundGuesses: Guess[],
  drawerId: string
): RoundScore[] {
  const correctGuessers = currentRoundGuesses
    .filter(g => g.isCorrect)
    .filter((g, idx, arr) => arr.findIndex(a => a.participantId === g.participantId) === idx)
    .map(g => g.participantId);

  return participants.map(p => {
    if (p.id === drawerId) {
      return { participantId: p.id, points: correctGuessers.length * 5 };
    }
    const orderIndex = correctGuessers.indexOf(p.id);
    if (orderIndex === -1) return { participantId: p.id, points: 0 };
    return { participantId: p.id, points: Math.max(3, 10 - orderIndex * 2) };
  });
}

export function endRound(room: Room): Room {
  const roundScores = calculateRoundScores(room.participants, room.currentRoundGuesses, room.drawerId!);

  for (const score of roundScores) {
    const participant = room.participants.find(p => p.id === score.participantId);
    if (participant) {
      participant.score += score.points;
    }
  }

  room.roundScores = roundScores;
  room.status = "result";

  return room;
}
