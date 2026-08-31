import { type Card, fsrs, type Grade, Rating } from "ts-fsrs";

const scheduler = fsrs();

export function reviewCard(card: Card, rating: Grade, now = new Date()): Card {
  switch (rating) {
    case Rating.Again:
    case Rating.Hard:
    case Rating.Good:
    case Rating.Easy:
      return scheduler.next(card, now, rating).card;
    default: {
      const exhaustive: never = rating;
      return exhaustive;
    }
  }
}

export function ratingFromCorrect(correct: boolean): Grade {
  return correct ? Rating.Good : Rating.Again;
}
