# Motorsports Data iOS App

Real-time session logging and telemetry upload for motorsports riders.

## Features

- **Session Logging**: Track track sessions with real-time telemetry collection (GPS, accelerometer, motion)
- **Offline-First**: All data saved to CoreData; automatic upload when online
- **Coach AI**: Real-time coaching recommendations from backend AI
- **Push Notifications**: Alerts for engine temp, lap completions, and upload status
- **Team Sync**: View sessions and share with your coaching team

## Requirements

- iOS 14.0+
- Swift 5.9+
- Xcode 15.0+

## Project Structure

```
MotorsportsData/
├── Sources/
│   ├── App/
│   │   └── MotorsportsDataApp.swift       # Main app entry point
│   ├── Models/
│   │   └── TelemetryModels.swift          # Data models (Codable + CoreData)
│   ├── Services/
│   │   ├── PersistenceManager.swift       # CoreData operations
│   │   ├── TelemetryCollectionService.swift # GPS + motion sensors
│   │   ├── UploadManager.swift            # Batch upload + retry logic
│   │   ├── APIClient.swift                # Backend API client
│   │   ├── CoachAIService.swift           # Coach recommendations
│   │   └── NotificationManager.swift      # Push notifications
│   └── Views/
│       ├── MainTabView.swift              # Main tab container
│       ├── SessionView.swift              # Session logging UI
│       ├── SessionHistoryView.swift       # Session history + upload
│       └── CoachRecommendationsView.swift # Coach recommendations
├── Package.swift                          # Swift Package manifest
└── project.yml                            # XcodeGen project config
```

## Building

### Option 1: Using Xcode

1. Open the project in Xcode:
   ```bash
   cd ios/MotorsportsData
   open -a Xcode .
   ```

2. Select "MotorsportsData" target and device/simulator
3. Press Cmd+B to build
4. Press Cmd+R to run

### Option 2: Using XcodeGen (recommended)

```bash
cd ios/MotorsportsData
brew install xcodegen
xcodegen generate
open MotorsportsData.xcodeproj
```

## Architecture

### Offline-First

- All telemetry saved to CoreData immediately
- Upload queue tracks pending syncs
- Automatic retry with exponential backoff
- Network monitor detects when online

### Telemetry Collection

- **GPS**: Real-time location updates (speed, coordinates)
- **Accelerometer**: Throttle/brake simulation via acceleration
- **Gyroscope**: Lateral and longitudinal G-forces
- **Motion**: 50 Hz sensor fusion data
- **Display Link**: 20 Hz telemetry updates for battery efficiency

### Batch Upload

- Collects 50 telemetry points per batch
- Uploads every 30 seconds (configurable)
- Max 3 retry attempts per upload
- Compression and rate limiting handled by backend

### Coach AI

- Polls backend every 30 seconds for recommendations
- Real-time analysis: throttle, engine temp, braking, cornering, pace
- Priority-based alerts (CRITICAL/HIGH/MEDIUM/LOW/INFO)
- Automatic notifications for actionable insights

## Configuration

### Backend URL

Set the backend URL in `APIClient.swift`:

```swift
init(baseURL: String = "https://motorsportsdata.io")
```

### Sensor Sampling

Adjust in `TelemetryCollectionService.swift`:

```swift
motionManager.accelerometerUpdateInterval = 0.02  // 50 Hz
displayLink?.preferredFramesPerSecond = 20        // 20 Hz telemetry
```

### Upload Interval

Adjust in `UploadManager.swift`:

```swift
private let uploadInterval: TimeInterval = 30  // seconds
```

## API Integration

### Telemetry Upload

```
POST /api/md-telemetry/ingest
Headers:
  - Content-Type: application/json
  - x-device-id: <deviceId>
Body: TelemetryUploadRequest {
  sessionToken, deviceId, telemetry[]
}
```

### Coach AI Recommendations

```
POST /api/md-coach-live
Body: { liveSessionId, lastN }
Response: CoachRecommendationsResponse {
  recommendations[], currentLap, bestLap
}
```

## Performance

- **Battery**: <10% drain per hour during active session
- **Memory**: ~30MB base + 50MB per 1000 telemetry points
- **Upload Success**: >95% with retry logic
- **Latency**: <500ms coach recommendation visibility

## Testing

### Unit Tests

```bash
cd ios/MotorsportsData
swift test
```

### UI Testing

Build and run on simulator:
1. Start a session
2. Complete a lap
3. End session
4. Check CoreData for telemetry points
5. Verify upload queue status

### Real Device

1. Connect iPhone/iPad via USB
2. In Xcode: Product → Scheme → Edit Scheme → Run → Info.plist
3. Add location permission + motion permission
4. Build and run

## Deployment

### TestFlight

1. Create Apple Developer account
2. Create app on App Store Connect
3. Generate provisioning profiles
4. In Xcode: Product → Archive
5. Distribute to TestFlight
6. Invite beta testers

### App Store

1. Complete app metadata
2. Submit privacy policy
3. Configure pricing
4. Submit for review

## Troubleshooting

### Upload Failures

- Check network connectivity
- Verify backend URL is correct
- Check device ID and session token
- Review server logs for 429 (rate limit) errors

### No Telemetry Data

- Grant app location + motion permissions
- Check if GPS is enabled
- Verify accelerometer working (shake device)

### Coach Recommendations Not Showing

- Verify backend `/api/md-coach-live` is responding
- Check liveSessionId is valid
- Ensure telemetry has 50+ points for analysis

## Future Enhancements

- [ ] Offline map caching for tracks
- [ ] WidgetKit for home screen telemetry
- [ ] WatchKit for lap timing
- [ ] CloudKit sync across devices
- [ ] Apple Health integration for HRV
- [ ] Siri shortcuts for common actions

## License

Proprietary - Motorsports Data Inc.

## Support

For issues or feature requests, contact: support@motorsportsdata.io
