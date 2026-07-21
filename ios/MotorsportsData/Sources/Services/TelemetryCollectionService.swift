import Foundation
import CoreLocation
import CoreMotion

class TelemetryCollectionService: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var isCollecting = false
    @Published var currentSpeed: Double = 0
    @Published var currentThrottle: Double = 0
    @Published var currentBrake: Double = 0
    @Published var currentLap: Int = 1
    @Published var engineTemp: Double = 0
    @Published var gLateral: Double = 0
    @Published var gLongitudinal: Double = 0
    @Published var gpsLat: Double = 0
    @Published var gpsLon: Double = 0
    
    private let locationManager = CLLocationManager()
    private let motionManager = CMMotionManager()
    private var displayLink: CADisplayLink?
    
    private var collectedPoints: [TelemetryPoint] = []
    private var lastLapTime: TimeInterval = 0
    private var sessionStartTime: TimeInterval = Date().timeIntervalSince1970
    private var lastSpeed: Double = 0
    private var throttleSmoothing: Double = 0
    private var brakeSmoothing: Double = 0
    
    override init() {
        super.init()
        setupLocationManager()
        setupMotionManager()
    }
    
    // MARK: - Setup
    
    private func setupLocationManager() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.activityType = .other
    }
    
    private func setupMotionManager() {
        motionManager.accelerometerUpdateInterval = 0.02 // 50 Hz
        motionManager.gyroUpdateInterval = 0.02
        motionManager.deviceMotionUpdateInterval = 0.02
    }
    
    // MARK: - Session Control
    
    func startCollection() {
        guard !isCollecting else { return }
        
        isCollecting = true
        collectedPoints = []
        sessionStartTime = Date().timeIntervalSince1970
        lastLapTime = sessionStartTime
        
        locationManager.requestWhenInUseAuthorization()
        locationManager.startUpdatingLocation()
        
        if motionManager.isDeviceMotionAvailable {
            motionManager.startDeviceMotionUpdates(using: .xArbitraryZVertical)
        }
        
        // Start high-frequency updates via display link
        displayLink = CADisplayLink(
            target: self,
            selector: #selector(updateTelemetry)
        )
        displayLink?.preferredFramesPerSecond = 20 // 20 Hz for battery efficiency
        displayLink?.add(to: .main, forMode: .common)
    }
    
    func stopCollection() -> [TelemetryPoint] {
        guard isCollecting else { return [] }
        
        isCollecting = false
        displayLink?.invalidate()
        displayLink = nil
        
        locationManager.stopUpdatingLocation()
        motionManager.stopDeviceMotionUpdates()
        
        return collectedPoints
    }
    
    // MARK: - Telemetry Updates
    
    @objc private func updateTelemetry() {
        guard isCollecting else { return }
        
        let currentTime = Date().timeIntervalSince1970
        let elapsedSeconds = currentTime - sessionStartTime
        
        // Get motion data
        if let motion = motionManager.deviceMotion {
            let accelX = motion.userAcceleration.x
            let accelY = motion.userAcceleration.y
            let accelZ = motion.userAcceleration.z
            
            // Simulate throttle from acceleration (smooth acceleration increases throttle)
            throttleSmoothing = throttleSmoothing * 0.8 + abs(accelX) * 20 * 0.2
            throttleSmoothing = min(max(throttleSmoothing, 0), 100)
            
            // Simulate brake from deceleration
            if accelX < -0.2 {
                brakeSmoothing = brakeSmoothing * 0.7 + abs(accelX) * 30 * 0.3
            } else {
                brakeSmoothing = brakeSmoothing * 0.9
            }
            brakeSmoothing = min(max(brakeSmoothing, 0), 100)
            
            // Calculate G-forces
            gLateral = accelY * 9.81
            gLongitudinal = accelX * 9.81
            
            // Simulate engine temp (increases with load)
            let load = (throttleSmoothing / 100.0)
            engineTemp = 60 + (load * 50) + Double.random(in: -2...2)
            engineTemp = min(max(engineTemp, 40), 120)
        }
        
        // Current throttle and brake
        currentThrottle = throttleSmoothing
        currentBrake = brakeSmoothing
        
        // Create telemetry point
        let point = TelemetryPoint(
            timestamp: currentTime,
            lapNumber: currentLap,
            lapTimeSeconds: currentTime - lastLapTime,
            speed: currentSpeed,
            throttle: currentThrottle,
            brakePressure: currentBrake,
            tirePressFront: 28 + Double.random(in: -1...1),
            tirePressRear: 26 + Double.random(in: -1...1),
            engineTempC: engineTemp,
            engineRpmK: (currentThrottle / 100.0) * 15 + Double.random(in: -0.5...0.5),
            gLateral: gLateral,
            gLongitudinal: gLongitudinal,
            suspensionTravelFront: nil,
            suspensionTravelRear: nil,
            gpsLat: gpsLat,
            gpsLon: gpsLon,
            deviceTimestamp: Int64(currentTime * 1000)
        )
        
        collectedPoints.append(point)
    }
    
    func completeLap() {
        currentLap += 1
        lastLapTime = Date().timeIntervalSince1970
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let location = locations.last else { return }
        
        currentSpeed = location.speed * 3.6 // m/s to km/h
        gpsLat = location.coordinate.latitude
        gpsLon = location.coordinate.longitude
    }
    
    func locationManager(
        _ manager: CLLocationManager,
        didFailWithError error: Error
    ) {
        print("[TelemetryCollection] Location error: \(error)")
    }
    
    // MARK: - Metrics
    
    func calculateMetrics() -> SessionMetrics? {
        guard !collectedPoints.isEmpty else { return nil }
        
        let speeds = collectedPoints.map { $0.speed }
        let throttles = collectedPoints.map { $0.throttle }
        let brakes = collectedPoints.compactMap { $0.brakePressure }
        let engineTemps = collectedPoints.compactMap { $0.engineTempC }
        let gLaterals = collectedPoints.compactMap { $0.gLateral }
        
        let avgSpeed = speeds.reduce(0, +) / Double(speeds.count)
        let maxSpeed = speeds.max() ?? 0
        let avgThrottle = throttles.reduce(0, +) / Double(throttles.count)
        let avgBrake = brakes.isEmpty ? 0 : brakes.reduce(0, +) / Double(brakes.count)
        let maxEngineTemp = engineTemps.max()
        let maxGLateral = gLaterals.map { abs($0) }.max()
        
        let sessionDuration = collectedPoints.last?.timestamp ?? 0 - (collectedPoints.first?.timestamp ?? 0)
        let bestLap = collectedPoints.compactMap { $0.lapTimeSeconds }.min()
        
        return SessionMetrics(
            currentLap: currentLap,
            bestLap: bestLap,
            avgSpeed: avgSpeed,
            maxSpeed: maxSpeed,
            avgThrottle: avgThrottle,
            avgBrake: avgBrake,
            maxEngineTemp: maxEngineTemp,
            sessionDuration: sessionDuration,
            maxGLateral: maxGLateral
        )
    }
}
