// Schema definition
const typeDef = `#graphql
  type User {
    id: String
    name: String
    points: String
    multi: String
  }
  type Bet {
    id: String
    name: String
    bet: String
    multi: String
    win: Boolean
    score: String
  }
  type Round {
    id: String
    top: String
    speed: String
    status: String
    points: String
    bets: [Bet]
  }
  type Message {
    id: String
    name: String
    text: String
  }
  type Query {
    users: [User]
  }

  type Mutation {
    login(name: String!): User!
    postMessage(name: String!, text: String!): ID!
    startRound(name: String!, points: String!, multi: String!, speed: String!): String!
    endRound(name: String!): String!
  }

  type Subscription {
    timeIncremented: String
    round(name: String!): Round
    users: [User]
    messages: [Message]
  }
`;

export default typeDef;
