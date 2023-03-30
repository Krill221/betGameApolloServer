/* eslint-disable import/extensions */
import { PubSub, withFilter } from 'graphql-subscriptions';
import { v4 } from 'uuid';
import { users, messages } from './seed.js';
import RoundData from './RoundData.js';

const pubsub = new PubSub();
const rounds = new RoundData();

const resolvers = {
  Query: {
    users: () => Object.values(users),
  },
  Mutation: {
    login: (parent, { name }) => {
      // console.log('login', name);
      const points = 1000;
      const multi = '2.25';
      const user = {
        id: v4(), name, points, multi, robo: 'human',
      };
      if (!(name in users)) users[name] = user;
      setTimeout(() => pubsub.publish('USER_UPDATE', { users: Object.values(users) }), 0);

      return user;
    },
    startRound: (parent, {
      name, points, multi, speed,
    }) => {
      if (!(name in users)) return '';
      // console.log('startRound');

      // select bots
      const creator = users[name];
      const bots = Object.values(users).filter((u) => u.role === 'bot' && Number(u.points) > 0);
      // console.log(bots)
      const round = rounds.createRound(creator, points, multi, speed, bots);

      // broadcast events
      setTimeout(() => pubsub.publish('USER_UPDATE', { users: Object.values(users) }), 0);
      setTimeout(() => pubsub.publish('ROUND_UPDATE', { round }), 0);

      return name;
    },
    endRound: (parent, { name }) => {
      if (!(name in users)) return '';
      // console.log('endRound');

      rounds.updateScore(name, users);
      const round = rounds.getRound(name);

      // broadcast events
      setTimeout(() => pubsub.publish('USER_UPDATE', { users: Object.values(users) }), 0);
      setTimeout(() => pubsub.publish('ROUND_UPDATE', { round }), 0);

      return name;
    },
    postMessage: (parent, { name, text }) => {
      const id = messages.length;
      messages.push({ id, name, text });

      // console.log('postMessage');
      // pubsub.publish('POST_MESSAGE',  { messages: messages })
      setTimeout(() => pubsub.publish('POST_MESSAGE', { messages }), 0);
      return users[name].id;
    },
  },
  Subscription: {
    round: {
      subscribe: withFilter(
        // on sub
        (_, variables) => {
          if (rounds.getRound(variables.name) !== undefined) {
            setTimeout(() => pubsub.publish('ROUND_UPDATE', { round: rounds.getRound(variables.name) }), 0);
          }
          return pubsub.asyncIterator(['ROUND_UPDATE']);
        },
        // filter by user name
        (payload, variables) => payload.round.name === variables.name
        ,
      ),
    },
    timeIncremented: {
      subscribe: () => pubsub.asyncIterator(['NUMBER_INCREMENTED']),
    },
    users: {
      subscribe: () => {
        setTimeout(() => pubsub.publish('USER_UPDATE', { users: Object.values(users) }), 0);
        return pubsub.asyncIterator(['USER_UPDATE']);
      },
    },
    messages: {
      subscribe: () => {
        setTimeout(() => pubsub.publish('POST_MESSAGE', { messages }), 0);
        return pubsub.asyncIterator(['POST_MESSAGE']);
      },
    },
  },
};

export default resolvers;
