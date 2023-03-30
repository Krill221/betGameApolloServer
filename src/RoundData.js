import { v4 } from 'uuid';

function getRandom(min, max) {
  return parseInt(Math.random() * (max - min) + min, 10);
}

function createBet(user, points, multi, top) {
  // eslint-disable-next-line no-param-reassign
  user.points -= points;
  // eslint-disable-next-line no-param-reassign
  user.multi = multi;
  return {
    id: user.id,
    name: user.name,
    bet: points,
    multi,
    win: (multi <= top / 100),
    score: (multi <= top / 100) ? points * multi : 0,
  };
}

export default class RoundData {
  constructor() {
    this.rounds = {};
  }

  createRound(creator, roundPoints, multi, speed, bots) {
    // round vals
    const roundId = v4();
    const top = getRandom(0, 1000);

    // bets
    const bets = [];
    const creatorBet = createBet(creator, roundPoints, multi, top);
    bets.push(creatorBet);

    // eslint-disable-next-line no-restricted-syntax
    for (const bot of bots) {
      const botRoundPoints = getRandom(1, bot.points);
      const botMulti = getRandom(1, 10);
      const botBet = createBet(bot, botRoundPoints, botMulti, top);
      bets.push(botBet);
    }

    this.rounds[creator.name] = {
      name: creator.name,
      id: roundId,
      top,
      speed,
      status: 'started',
      points: creator.points,
      bets,
    };
    return this.rounds[creator.name];
  }

  updateScore(name, users) {
    const round = this.getRound(name);
    if (round === undefined) return;
    if (round.status !== 'started') return;

    round.status = 'end';
    // eslint-disable-next-line no-restricted-syntax
    for (const bet of round.bets) {
      const user = users[bet.name];
      if (bet.win) {
        user.points += bet.score;
      }
    }
  }

  getRound(name) {
    return this.rounds[name];
  }
}
