# iOS App Deployment Guide

Complete guide for building, testing, and deploying Motorsports Data iOS app.

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Visit: https://developer.apple.com/
   - Create account and enroll in Apple Developer Program

2. **Xcode 15+**
   ```bash
   # Install from Mac App Store or:
   xcode-select --install
   ```

3. **Git and SSH keys** configured for GitHub

4. **Backend URL configured**
   - Update `APIClient.swift` with production backend

## Phase 1: Local Development

### 1.1 Build on Simulator

```bash
cd ios/MotorsportsData
xcodegen generate  # Generate .pbxproj from YAML
open MotorsportsData.xcodeproj
```

In Xcode:
1. Select "MotorsportsData" target
2. Select "iPhone 15 Pro" simulator
3. Press Cmd+B to build
4. Press Cmd+R to run

### 1.2 Test Core Features

**Session Logging:**
- Open app, fill session details
- Press "Start Session"
- Verify telemetry updates in real-time
- Complete lap, end session
- Check CoreData persistence

**Upload:**
- Create a session
- End session (queues for upload)
- Check upload status in History tab
- Simulate offline: airplane mode
- Turn airplane mode off, verify auto-upload

**Coach AI:**
- Start session
- Watch recommendations appear (requires backend live)
- Verify push notifications fire

### 1.3 Test on Real Device

```bash
# Connect iPhone via USB
xcode-select --install  # If needed

# In Xcode:
# 1. Select your device (not simulator)
# 2. Cmd+Shift+K to build for device
# 3. Cmd+R to run on device
# 4. Grant permissions when prompted (Location, Motion)
```

## Phase 2: Testflight (Beta Testing)

### 2.1 Create App on App Store Connect

1. Visit: https://appstoreconnect.apple.com/
2. Login with Apple ID
3. Click "Apps" → "+"
4. Select "New App"
5. Fill in:
   - Platform: iOS
   - App Name: "Motorsports Data"
   - Primary Language: English
   - Bundle ID: `com.motorsportsdata.app` (matches Xcode)
   - SKU: `motorsports-data-ios` (any unique identifier)
   - User Access: Full Access

### 2.2 Configure App Info

1. In App Store Connect, go to your app
2. **App Information:**
   - Category: Sports
   - Content Rating: Fill out questionnaire (default is fine)
   - Privacy Policy: `https://motorsportsdata.io/privacy`

3. **Pricing:**
   - Type: Free
   - Availability: Worldwide

4. **App Privacy:**
   - Add privacy manifest (required for iOS 17+)
   - Data collected: Location (GPS), Motion (accelerometer)
   - Marketing: Unchecked

### 2.3 Create Provisioning Profile

In Xcode:
1. Preferences → Accounts
2. Add Apple ID
3. View Details → Download All (auto-generates certificates)
4. Close preferences

### 2.4 Configure Build Settings

In Xcode:
1. Select MotorsportsData target
2. Build Settings tab
3. Search "bundle"
4. Set "Product Bundle Identifier": `com.motorsportsdata.app`
5. Search "team"
6. Set "Team" to your Apple Developer team

### 2.5 Archive and Upload to TestFlight

```bash
# In Xcode:
# 1. Select generic iOS device (not simulator)
# 2. Product → Archive
# 3. Wait for build to complete
# 4. Distribute App → App Store Connect → Next
# 5. Upload with Bitcode → Next
# 6. Review info → Upload
```

Or via command line:

```bash
xcodebuild -scheme MotorsportsData \
  -configuration Release \
  -archivePath ./build/MotorsportsData.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath ./build/MotorsportsData.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ./build/ipa
```

### 2.6 Create ExportOptions.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>teamID</key>
  <string>TEAMID</string>
</dict>
</plist>
```

### 2.7 Invite Beta Testers

In App Store Connect:
1. TestFlight → Testers
2. Create Internal Group
3. Add Apple IDs of team members
4. Create External Group
5. Generate public link or add testers manually
6. Accept beta agreement in TestFlight app (iOS)

## Phase 3: App Store Submission

### 3.1 Prepare Store Listing

In App Store Connect:

1. **App Preview:**
   - Create 15-30 second video showing:
     - Start session, real-time metrics, upload, history

2. **Screenshots:**
   - Create for 5.5" display (iPhone 14 Pro)
   - Showcase: Session logging, metrics, history, settings
   - Add text overlays: "Real-time Telemetry", "Offline-First", etc.

3. **Description:**
   ```
   Motorsports Data iOS: The essential lap timer and telemetry app for 
   motorcycle racing.
   
   FEATURES:
   • Real-time GPS and motion telemetry collection
   • Coach AI recommendations during sessions
   • Offline-first with automatic sync
   • Push notifications for lap completion
   • Secure team sharing
   
   Perfect for motocross, supercross, enduro, and track days.
   ```

4. **Keyword Search Terms:**
   - motocross, supercross, enduro, lap timer, telemetry, racing

5. **Support URL:**
   - `https://motorsportsdata.io/support`

6. **Marketing URL:**
   - `https://motorsportsdata.io/mobile`

### 3.2 Set Version and Build

1. App Store Connect → Version:
   - Version Number: 1.0.0
   - Build: (select from TestFlight)

2. Submit for Review

### 3.3 Review & Approval

Apple review typically takes 1-2 days:
- iOS app review guidelines: https://developer.apple.com/app-store/review/guidelines/
- Common rejection reasons:
  - Missing privacy policy
  - Bugs/crashes
  - Vague app description
  - Misleading screenshots

### 3.4 Release

Once approved:
1. App Store Connect → Version
2. Click "Release This Version"
3. App goes live within 1-2 hours

## Phase 4: Post-Launch Monitoring

### 4.1 Crash Reports

In App Store Connect → Quality:
- View crash logs
- Set up alerts for new crash types
- Fix and release updates (same day preferred)

### 4.2 Analytics

Xcode Cloud or App Analytics:
- Monitor: Installs, active users, crash-free sessions
- Goal: >98% crash-free rate

### 4.3 Updates

Release cadence:
- Bug fixes: Within 24 hours
- Features: Every 2-4 weeks
- Major releases: Every quarter

## Troubleshooting

### Build Fails: "Code signing required"

```bash
xcode-select --reset
# Then re-add Apple ID in Xcode Preferences
```

### Archive Fails: "Unable to validate App ID"

- Verify Bundle ID matches App Store Connect
- Regenerate provisioning profiles

### Upload to TestFlight Fails

- Check certificate validity: https://developer.apple.com/account/resources/certificates
- Regenerate if needed

### App Rejected: "Misleading Metadata"

- Ensure app description matches actual features
- Review competitor apps for tone/style

## Automation (Optional)

### CI/CD with GitHub Actions

```yaml
name: Build and Upload

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build archive
        run: |
          xcodebuild -scheme MotorsportsData archive
      - name: Upload to TestFlight
        run: |
          xcrun altool --upload-app \
            --file build.ipa \
            --username ${{ secrets.APPLE_ID }} \
            --password ${{ secrets.APPLE_PASSWORD }}
```

## Support

For deployment issues:
- Apple Support: https://developer.apple.com/support/
- TestFlight Beta: https://testflight.apple.com/help
- App Review: https://developer.apple.com/contact/app-store/review/
