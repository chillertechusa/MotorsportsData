import Foundation
import CoreData

// MARK: - Telemetry Data Models

struct TelemetryPoint: Codable {
    let timestamp: TimeInterval
    let lapNumber: Int
    let lapTimeSeconds: Double?
    let speed: Double
    let throttle: Double
    let brakePressure: Double?
    let tirePressFront: Double?
    let tirePressRear: Double?
    let engineTempC: Double?
    let engineRpmK: Double?
    let gLateral: Double?
    let gLongitudinal: Double?
    let suspensionTravelFront: Double?
    let suspensionTravelRear: Double?
    let gpsLat: Double?
    let gpsLon: Double?
    let deviceTimestamp: Int64
}

struct RacingSession: Codable {
    let id: String
    let riderEmail: String
    let vehicleId: String
    let trackName: String
    let sessionDate: Date
    let discipline: String // motocross, sx, enduro, etc.
    let conditions: String? // dry, wet, mixed
    let temperature: Int?
    let telemetryPoints: [TelemetryPoint]
    let bestLapSeconds: Double?
    let totalLaps: Int
    let uploadedAt: Date?
    let synced: Bool
    
    var isOfflineSession: Bool {
        uploadedAt == nil
    }
}

struct SessionMetrics {
    let currentLap: Int
    let bestLap: Double?
    let avgSpeed: Double
    let maxSpeed: Double
    let avgThrottle: Double
    let avgBrake: Double
    let maxEngineTemp: Double?
    let sessionDuration: TimeInterval
    let maxGLateral: Double?
}

// MARK: - CoreData Entity Models

@NSManaged
class CDRacingSession: NSManagedObject {
    @NSManaged var id: String
    @NSManaged var riderEmail: String
    @NSManaged var vehicleId: String
    @NSManaged var trackName: String
    @NSManaged var sessionDate: Date
    @NSManaged var discipline: String
    @NSManaged var conditions: String?
    @NSManaged var temperature: NSNumber?
    @NSManaged var bestLapSeconds: NSNumber?
    @NSManaged var totalLaps: Int32
    @NSManaged var uploadedAt: Date?
    @NSManaged var synced: Bool
    @NSManaged var telemetryData: Data? // Archived TelemetryPoint array
    @NSManaged var createdAt: Date
    @NSManaged var updatedAt: Date
}

@NSManaged
class CDTelemetryPoint: NSManagedObject {
    @NSManaged var timestamp: TimeInterval
    @NSManaged var lapNumber: Int32
    @NSManaged var lapTimeSeconds: NSNumber?
    @NSManaged var speed: Double
    @NSManaged var throttle: Double
    @NSManaged var brakePressure: NSNumber?
    @NSManaged var tirePressFront: NSNumber?
    @NSManaged var tirePressRear: NSNumber?
    @NSManaged var engineTempC: NSNumber?
    @NSManaged var engineRpmK: NSNumber?
    @NSManaged var gLateral: NSNumber?
    @NSManaged var gLongitudinal: NSNumber?
    @NSManaged var suspensionTravelFront: NSNumber?
    @NSManaged var suspensionTravelRear: NSNumber?
    @NSManaged var gpsLat: NSNumber?
    @NSManaged var gpsLon: NSNumber?
    @NSManaged var deviceTimestamp: Int64
    @NSManaged var racingSession: CDRacingSession
    @NSManaged var createdAt: Date
}

// MARK: - Upload Queue

@NSManaged
class CDUploadQueue: NSManagedObject {
    @NSManaged var id: String
    @NSManaged var sessionId: String
    @NSManaged var status: String // pending, uploading, completed, failed
    @NSManaged var attempts: Int32
    @NSManaged var lastAttemptAt: Date?
    @NSManaged var createdAt: Date
    @NSManaged var updatedAt: Date
}
