import Foundation
import Network

class UploadManager: ObservableObject {
    static let shared = UploadManager()
    
    @Published var isUploading = false
    @Published var uploadProgress: Double = 0
    @Published var lastUploadError: String?
    
    private let apiClient = APIClient.shared
    private let persistence = PersistenceManager.shared
    private let monitor = NWPathMonitor()
    private var isNetworkAvailable = true
    private var uploadTimer: Timer?
    
    private let batchSize = 50
    private let uploadInterval: TimeInterval = 30 // seconds
    private let maxRetries = 3
    
    init() {
        setupNetworkMonitoring()
        setupPeriodicUpload()
    }
    
    // MARK: - Network Monitoring
    
    private func setupNetworkMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isNetworkAvailable = path.status == .satisfied
                
                if path.status == .satisfied {
                    self?.processUploadQueue()
                }
            }
        }
        
        let queue = DispatchQueue(label: "com.motorsportsdata.network")
        monitor.start(queue: queue)
    }
    
    // MARK: - Periodic Upload
    
    private func setupPeriodicUpload() {
        uploadTimer = Timer.scheduledTimer(withTimeInterval: uploadInterval, repeats: true) { [weak self] _ in
            if self?.isNetworkAvailable ?? false {
                self?.processUploadQueue()
            }
        }
    }
    
    deinit {
        uploadTimer?.invalidate()
        monitor.cancel()
    }
    
    // MARK: - Upload Queue Processing
    
    func processUploadQueue() {
        guard !isUploading else { return }
        
        let pendingUploads = persistence.fetchPendingUploads()
        guard !pendingUploads.isEmpty else { return }
        
        isUploading = true
        uploadProgress = 0
        
        Task {
            for (index, item) in pendingUploads.enumerated() {
                let session = persistence.fetchSession(by: item.sessionId)
                guard let session = session else {
                    persistence.updateUploadStatus(item, status: "failed")
                    continue
                }
                
                let telemetryPoints = persistence.fetchTelemetryPoints(for: session)
                
                // Batch upload
                for batch in telemetryPoints.chunked(into: batchSize) {
                    do {
                        let _ = try await uploadBatch(
                            batch,
                            sessionToken: session.id,
                            deviceId: session.vehicleId
                        )
                        
                        persistence.updateUploadStatus(
                            item,
                            status: "completed",
                            attempts: Int(item.attempts) + 1
                        )
                        session.uploadedAt = Date()
                        session.synced = true
                        persistence.saveContext()
                        
                        uploadProgress = Double(index + 1) / Double(pendingUploads.count)
                    } catch {
                        let attempts = Int(item.attempts) + 1
                        
                        if attempts >= maxRetries {
                            persistence.updateUploadStatus(item, status: "failed", attempts: attempts)
                            DispatchQueue.main.async {
                                self.lastUploadError = error.localizedDescription
                            }
                        } else {
                            persistence.updateUploadStatus(item, status: "pending", attempts: attempts)
                        }
                    }
                }
            }
            
            DispatchQueue.main.async {
                self.isUploading = false
                self.uploadProgress = 0
            }
        }
    }
    
    private func uploadBatch(
        _ points: [CDTelemetryPoint],
        sessionToken: String,
        deviceId: String
    ) async throws {
        let telemetryPoints = points.map { point in
            TelemetryPoint(
                timestamp: point.timestamp,
                lapNumber: Int(point.lapNumber),
                lapTimeSeconds: point.lapTimeSeconds as? Double,
                speed: point.speed,
                throttle: point.throttle,
                brakePressure: point.brakePressure as? Double,
                tirePressFront: point.tirePressFront as? Double,
                tirePressRear: point.tirePressRear as? Double,
                engineTempC: point.engineTempC as? Double,
                engineRpmK: point.engineRpmK as? Double,
                gLateral: point.gLateral as? Double,
                gLongitudinal: point.gLongitudinal as? Double,
                suspensionTravelFront: point.suspensionTravelFront as? Double,
                suspensionTravelRear: point.suspensionTravelRear as? Double,
                gpsLat: point.gpsLat as? Double,
                gpsLon: point.gpsLon as? Double,
                deviceTimestamp: point.deviceTimestamp
            )
        }
        
        let response = try await apiClient.uploadTelemetry(
            points: telemetryPoints,
            sessionToken: sessionToken,
            deviceId: deviceId
        )
        
        guard response.ok else {
            throw UploadError.uploadFailed
        }
    }
    
    // MARK: - Manual Upload
    
    func uploadSession(_ session: CDRacingSession) async throws {
        let telemetryPoints = persistence.fetchTelemetryPoints(for: session)
        guard !telemetryPoints.isEmpty else {
            throw UploadError.noTelemetryData
        }
        
        isUploading = true
        uploadProgress = 0
        
        defer {
            isUploading = false
            uploadProgress = 0
        }
        
        for batch in telemetryPoints.chunked(into: batchSize) {
            let telemetryDTOs = batch.map { point in
                TelemetryPoint(
                    timestamp: point.timestamp,
                    lapNumber: Int(point.lapNumber),
                    lapTimeSeconds: point.lapTimeSeconds as? Double,
                    speed: point.speed,
                    throttle: point.throttle,
                    brakePressure: point.brakePressure as? Double,
                    tirePressFront: point.tirePressFront as? Double,
                    tirePressRear: point.tirePressRear as? Double,
                    engineTempC: point.engineTempC as? Double,
                    engineRpmK: point.engineRpmK as? Double,
                    gLateral: point.gLateral as? Double,
                    gLongitudinal: point.gLongitudinal as? Double,
                    suspensionTravelFront: point.suspensionTravelFront as? Double,
                    suspensionTravelRear: point.suspensionTravelRear as? Double,
                    gpsLat: point.gpsLat as? Double,
                    gpsLon: point.gpsLon as? Double,
                    deviceTimestamp: point.deviceTimestamp
                )
            }
            
            try await apiClient.uploadTelemetry(
                points: telemetryDTOs,
                sessionToken: session.id,
                deviceId: session.vehicleId
            )
        }
        
        session.uploadedAt = Date()
        session.synced = true
        persistence.saveContext()
    }
    
    enum UploadError: LocalizedError {
        case uploadFailed
        case noTelemetryData
        case networkUnavailable
        
        var errorDescription: String? {
            switch self {
            case .uploadFailed:
                return "Failed to upload telemetry"
            case .noTelemetryData:
                return "No telemetry data to upload"
            case .networkUnavailable:
                return "Network unavailable"
            }
        }
    }
}

// MARK: - Array Extension for Batching

extension Array {
    func chunked(into size: Int) -> [[Element]] {
        stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}
