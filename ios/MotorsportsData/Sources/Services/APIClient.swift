import Foundation

class APIClient {
    static let shared = APIClient()
    
    let baseURL: String
    private var authToken: String?
    
    init(baseURL: String = "https://motorsportsdata.io") {
        self.baseURL = baseURL
    }
    
    // MARK: - Auth
    
    func setAuthToken(_ token: String) {
        self.authToken = token
    }
    
    // MARK: - Telemetry Upload
    
    struct TelemetryUploadRequest: Codable {
        let sessionToken: String
        let deviceId: String
        let telemetry: [TelemetryPointDTO]
    }
    
    struct TelemetryPointDTO: Codable {
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
    
    func uploadTelemetry(
        points: [TelemetryPoint],
        sessionToken: String,
        deviceId: String
    ) async throws -> UploadResponse {
        let dtoPoints = points.map { point in
            TelemetryPointDTO(
                timestamp: point.timestamp,
                lapNumber: point.lapNumber,
                lapTimeSeconds: point.lapTimeSeconds,
                speed: point.speed,
                throttle: point.throttle,
                brakePressure: point.brakePressure,
                tirePressFront: point.tirePressFront,
                tirePressRear: point.tirePressRear,
                engineTempC: point.engineTempC,
                engineRpmK: point.engineRpmK,
                gLateral: point.gLateral,
                gLongitudinal: point.gLongitudinal,
                suspensionTravelFront: point.suspensionTravelFront,
                suspensionTravelRear: point.suspensionTravelRear,
                gpsLat: point.gpsLat,
                gpsLon: point.gpsLon,
                deviceTimestamp: point.deviceTimestamp
            )
        }
        
        let request = TelemetryUploadRequest(
            sessionToken: sessionToken,
            deviceId: deviceId,
            telemetry: dtoPoints
        )
        
        let url = URL(string: "\(baseURL)/api/md-telemetry/ingest")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue(deviceId, forHTTPHeaderField: "x-device-id")
        
        let encoder = JSONEncoder()
        urlRequest.httpBody = try encoder.encode(request)
        
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        if httpResponse.statusCode == 429 {
            throw APIError.rateLimited
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        let uploadResponse = try decoder.decode(UploadResponse.self, from: data)
        return uploadResponse
    }
    
    struct UploadResponse: Codable {
        let ok: Bool
        let inserted: Int
        let alertsGenerated: Int?
        let bestLap: Double?
        let currentLap: Int?
    }
    
    // MARK: - Coach AI
    
    func getCoachRecommendations(
        liveSessionId: String,
        lastN: Int = 50
    ) async throws -> CoachRecommendationsResponse {
        let url = URL(string: "\(baseURL)/api/md-coach-live")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["liveSessionId": liveSessionId, "lastN": lastN]
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        let recommendations = try decoder.decode(CoachRecommendationsResponse.self, from: data)
        return recommendations
    }
    
    struct CoachRecommendationsResponse: Codable {
        let ok: Bool
        let sessionId: String
        let riderEmail: String
        let currentLap: Int
        let bestLap: Double?
        let recommendations: [CoachRecommendation]
    }
    
    struct CoachRecommendation: Codable {
        let type: String
        let priority: String
        let message: String
        let actionable: Bool
        let estimate: String
    }
    
    // MARK: - Errors
    
    enum APIError: LocalizedError {
        case invalidResponse
        case httpError(statusCode: Int)
        case rateLimited
        case encodingError(Error)
        case decodingError(Error)
        
        var errorDescription: String? {
            switch self {
            case .invalidResponse:
                return "Invalid response from server"
            case .httpError(let statusCode):
                return "HTTP error: \(statusCode)"
            case .rateLimited:
                return "Rate limited - try again later"
            case .encodingError(let error):
                return "Encoding error: \(error.localizedDescription)"
            case .decodingError(let error):
                return "Decoding error: \(error.localizedDescription)"
            }
        }
    }
}
