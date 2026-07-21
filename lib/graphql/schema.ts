/**
 * GraphQL Schema for telemetry queries
 */
export const typeDefs = `
  scalar DateTime
  
  type Query {
    telemetryMetrics(sessionId: ID!, riderId: ID!, startTime: DateTime!, endTime: DateTime!): [TelemetryMetric!]!
    lapData(sessionId: ID!, riderId: ID!): [LapDatum!]!
    multiRiderComparison(sessionId: ID!, lapNumber: Int): [RiderLapMetrics!]!
    readinessScore(riderId: ID!, date: DateTime!): ReadinessScore
    readinessProgression(riderId: ID!, startDate: DateTime!, endDate: DateTime!): [ReadinessScore!]!
    session(id: ID!): Session
    sessionsByRider(riderId: ID!): [Session!]!
  }

  type TelemetryMetric {
    id: ID!
    timestamp: DateTime!
    heartRate: Int
    power: Int
    speed: Float
    cadence: Int
    temperature: Float
    latitude: Float
    longitude: Float
  }

  type LapDatum {
    id: ID!
    lapNumber: Int!
    lapTimeMs: Int!
    heartRateAvg: Float
    heartRateMax: Int
    powerAvg: Float
    powerPeak: Int
    speedMax: Float
  }

  type RiderLapMetrics {
    riderId: ID!
    riderName: String!
    lapNumber: Int!
    lapTime: Int!
    heartRateAvg: Int!
    powerAvg: Int!
    speedMax: Float!
    position: Int!
  }

  type ReadinessScore {
    id: ID!
    riderId: ID!
    date: DateTime!
    score: Int!
    sleep: Float
    hrv: Int
    peakProbability: Int!
    confidence: Float!
  }

  type Session {
    id: ID!
    riderId: ID!
    startTime: DateTime!
    endTime: DateTime!
    deviceId: ID!
    lapCount: Int!
    avgPower: Int
    avgHeartRate: Int
  }
`
