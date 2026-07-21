import SwiftUI
import CoreData

struct SessionView: View {
    @Environment(\.managedObjectContext) var viewContext
    @StateObject var telemetryService = TelemetryCollectionService()
    @State var sessionStarted = false
    @State var sessionMetrics: SessionMetrics?
    @State var currentSession: CDRacingSession?
    
    @State var riderEmail: String = ""
    @State var vehicleId: String = ""
    @State var trackName: String = ""
    @State var discipline: String = "motocross"
    @State var conditions: String = "dry"
    
    let disciplines = ["Motocross", "Supercross", "Enduro", "GNCC", "FMX", "Flat Track", "Trail"]
    let conditionOptions = ["Dry", "Wet", "Mixed"]
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.03, green: 0.03, blue: 0.05).ignoresSafeArea()
                
                if !sessionStarted {
                    sessionSetupView
                } else {
                    sessionActiveView
                }
            }
            .navigationTitle("Session Logger")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    // MARK: - Session Setup View
    
    private var sessionSetupView: some View {
        VStack(spacing: 16) {
            Form {
                Section(header: Text("Rider Info")) {
                    TextField("Email", text: $riderEmail)
                        .keyboardType(.emailAddress)
                    TextField("Vehicle ID", text: $vehicleId)
                }
                
                Section(header: Text("Session Details")) {
                    TextField("Track Name", text: $trackName)
                    
                    Picker("Discipline", selection: $discipline) {
                        ForEach(disciplines, id: \.self) { d in
                            Text(d).tag(d)
                        }
                    }
                    
                    Picker("Conditions", selection: $conditions) {
                        ForEach(conditionOptions, id: \.self) { c in
                            Text(c).tag(c)
                        }
                    }
                }
            }
            .scrollContentBackground(.hidden)
            
            Button(action: startSession) {
                Text("Start Session")
                    .font(.headline)
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(12)
                    .background(Color(red: 0.84, green: 0.97, blue: 0.20))
                    .cornerRadius(8)
            }
            .disabled(riderEmail.isEmpty || vehicleId.isEmpty || trackName.isEmpty)
            .padding()
            
            Spacer()
        }
    }
    
    // MARK: - Session Active View
    
    private var sessionActiveView: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading) {
                    Text("LIVE SESSION")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(trackName)
                        .font(.headline)
                        .foregroundColor(.white)
                }
                Spacer()
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)
                    Text("Recording")
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
            .padding(16)
            .background(Color(red: 0.08, green: 0.08, blue: 0.12))
            .border(Color(red: 0.15, green: 0.15, blue: 0.20), width: 1)
            
            // Metrics Grid
            ScrollView {
                VStack(spacing: 12) {
                    // Speed Gauge
                    metricCard(
                        title: "SPEED",
                        value: String(format: "%.0f", telemetryService.currentSpeed),
                        unit: "km/h",
                        color: speedColor(telemetryService.currentSpeed)
                    )
                    
                    // Performance Metrics
                    HStack(spacing: 12) {
                        metricSmall(
                            title: "LAP",
                            value: String(telemetryService.currentLap),
                            color: Color(red: 0.84, green: 0.97, blue: 0.20)
                        )
                        
                        metricSmall(
                            title: "THROTTLE",
                            value: String(format: "%.0f%%", telemetryService.currentThrottle),
                            color: Color(red: 0.24, green: 0.51, blue: 0.98)
                        )
                        
                        metricSmall(
                            title: "BRAKE",
                            value: String(format: "%.0f%%", telemetryService.currentBrake),
                            color: Color(red: 0.97, green: 0.45, blue: 0.10)
                        )
                    }
                    
                    // Engine Metrics
                    HStack(spacing: 12) {
                        metricSmall(
                            title: "ENGINE TEMP",
                            value: String(format: "%.0f°C", telemetryService.engineTemp),
                            color: engineTempColor(telemetryService.engineTemp)
                        )
                        
                        metricSmall(
                            title: "G LATERAL",
                            value: String(format: "%.1fG", telemetryService.gLateral),
                            color: Color(red: 0.06, green: 0.88, blue: 0.88)
                        )
                    }
                    
                    // Lap Control
                    Button(action: {
                        telemetryService.completeLap()
                    }) {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Complete Lap")
                        }
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(12)
                        .background(Color(red: 0.84, green: 0.97, blue: 0.20))
                        .cornerRadius(8)
                    }
                    .padding(.top, 8)
                    
                    Spacer(minLength: 20)
                }
                .padding(16)
            }
            
            // Bottom Controls
            HStack(spacing: 12) {
                Button(action: pauseSession) {
                    Image(systemName: "pause.fill")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(12)
                        .background(Color(red: 0.15, green: 0.15, blue: 0.20))
                        .cornerRadius(8)
                }
                
                Button(action: endSession) {
                    Image(systemName: "stop.fill")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(12)
                        .background(Color.red)
                        .cornerRadius(8)
                }
            }
            .padding(16)
            .background(Color(red: 0.08, green: 0.08, blue: 0.12))
        }
        .background(Color(red: 0.03, green: 0.03, blue: 0.05))
    }
    
    // MARK: - Helper Views
    
    private func metricCard(
        title: String,
        value: String,
        unit: String,
        color: Color
    ) -> some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
            HStack(spacing: 4) {
                Text(value)
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .foregroundColor(color)
                Text(unit)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(Color(red: 0.08, green: 0.08, blue: 0.12))
        .border(Color(red: 0.15, green: 0.15, blue: 0.20), width: 1)
        .cornerRadius(8)
    }
    
    private func metricSmall(
        title: String,
        value: String,
        color: Color
    ) -> some View {
        VStack(spacing: 6) {
            Text(title)
                .font(.caption2)
                .foregroundColor(.gray)
            Text(value)
                .font(.system(size: 18, weight: .bold, design: .monospaced))
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding(8)
        .background(Color(red: 0.08, green: 0.08, blue: 0.12))
        .border(Color(red: 0.15, green: 0.15, blue: 0.20), width: 1)
        .cornerRadius(6)
    }
    
    // MARK: - Actions
    
    private func startSession() {
        let session = PersistenceManager.shared.createSession(
            riderEmail: riderEmail,
            vehicleId: vehicleId,
            trackName: trackName,
            discipline: discipline.lowercased(),
            conditions: conditions.lowercased()
        )
        currentSession = session
        telemetryService.startCollection()
        sessionStarted = true
    }
    
    private func pauseSession() {
        // TODO: Implement pause
    }
    
    private func endSession() {
        let points = telemetryService.stopCollection()
        sessionMetrics = telemetryService.calculateMetrics()
        
        if let session = currentSession {
            for point in points {
                _ = PersistenceManager.shared.addTelemetryPoint(
                    to: session,
                    timestamp: point.timestamp,
                    lapNumber: point.lapNumber,
                    speed: point.speed,
                    throttle: point.throttle,
                    brakePressure: point.brakePressure,
                    engineTempC: point.engineTempC,
                    gLateral: point.gLateral,
                    gLongitudinal: point.gLongitudinal,
                    gpsLat: point.gpsLat,
                    gpsLon: point.gpsLon
                )
            }
            
            session.bestLapSeconds = sessionMetrics?.bestLap as NSNumber?
            PersistenceManager.shared.saveContext()
            
            // Queue for upload
            _ = PersistenceManager.shared.addToUploadQueue(sessionId: session.id)
        }
        
        sessionStarted = false
    }
    
    // MARK: - Color Helpers
    
    private func speedColor(_ speed: Double) -> Color {
        if speed > 100 {
            return Color.red
        } else if speed > 80 {
            return Color(red: 1.0, green: 0.84, blue: 0.0)
        }
        return Color(red: 0.34, green: 0.98, blue: 0.22)
    }
    
    private func engineTempColor(_ temp: Double) -> Color {
        if temp > 100 {
            return Color.red
        } else if temp > 90 {
            return Color(red: 1.0, green: 0.84, blue: 0.0)
        }
        return Color(red: 0.34, green: 0.98, blue: 0.22)
    }
}

#Preview {
    SessionView()
        .environment(\.managedObjectContext, PersistenceManager.shared.viewContext)
}
