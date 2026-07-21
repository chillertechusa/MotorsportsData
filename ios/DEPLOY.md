# Motorsports Data iOS App — Production Deployment Guide

## Prerequisites

1. **Apple Developer Account** — $99/year (individual or org)
2. **Xcode 15+** — Latest macOS with Xcode installed
3. **Certificate & Provisioning** — Code signing credentials from Apple
4. **TestFlight Access** — App Store Connect enabled

## Quick Start: Deploy to TestFlight

### Option 1: Manual Build & Upload (Fastest)

```bash
cd ios

# 1. Build release archive
./scripts/build-release.sh 1.0.0

# 2. Set Apple credentials
export APPLE_ID_EMAIL="your-apple-id@example.com"
export APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"

# 3. Upload to TestFlight
./scripts/upload-testflight.sh build/MotorsportsData-1.0.0/MotorsportsData.ipa
```

### Option 2: Automated CI/CD via GitHub Actions (Recommended)

1. **Set GitHub Secrets** (in repo Settings → Secrets)
   ```
   APPLE_ID_EMAIL: your-apple-id@example.com
   APP_SPECIFIC_PASSWORD: xxxx-xxxx-xxxx-xxxx
   SLACK_WEBHOOK: https://hooks.slack.com/... (optional)
   ```

2. **Trigger Build**
   ```bash
   git push origin ios-fix  # or use GitHub UI → Actions → iOS TestFlight Build → Run workflow
   ```

3. **Monitor**
   - GitHub Actions tab shows build logs
   - Slack notification on completion
   - App appears in TestFlight within ~15 minutes

## Full Deployment Workflow

### 1. Prepare Release

```bash
cd ios

# Update version in Info.plist
# Commit changes
git add -A && git commit -m "Release v1.0.0"
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin main --tags
```

### 2. Build for Distribution

```bash
# Debug test first (optional)
./scripts/build-debug.sh

# Production release build
./scripts/build-release.sh 1.0.0
```

### 3. Code Signing Setup

**First-time setup only:**

```bash
# Generate Certificate Signing Request (CSR) in Keychain Access
# Go to Keychain Access → Certificate Assistant → Request a Certificate
# Save to file, then upload to Apple Developer Portal

# Create App ID (if not exists)
# Apple Developer Portal → Identifiers → create "com.motorsportsdata.ridersapp"

# Create Provisioning Profile
# Apple Developer Portal → Provisioning Profiles → create App Store profile
# Download and double-click to install
```

**Automatic Signing (Recommended):**
- Xcode → Project Settings → Signing & Capabilities
- Team: Select your Apple Developer account
- Automatically manage signing: Enable
- Xcode handles certificates + profiles automatically

### 4. Upload to TestFlight

```bash
# Using script
export APPLE_ID_EMAIL="your-id@example.com"
export APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
./scripts/upload-testflight.sh build/MotorsportsData-1.0.0/MotorsportsData.ipa

# Or manual via Xcode
# Product → Archive → Distribute App → TestFlight → Upload
```

### 5. TestFlight Internal Testing

1. **In App Store Connect:**
   - App → TestFlight → Internal Testing
   - Select build → click "Add Build to Submission"
   - Build takes ~15 min to process

2. **Invite Testers:**
   - Internal Testing: All team members (automatic)
   - External Testing: Up to 10k beta testers via link
   - Create test group → Send invite

3. **Monitor Crashes:**
   - TestFlight app → Motorsports Data → Feedback
   - App Store Connect → Analytics → Crashes

### 6. Submit to App Store (Production)

```bash
# After TestFlight testing complete + all crashes fixed:
# In App Store Connect:
# - Version Release → Prepare for Submission
# - Add screenshots, description, keywords
# - Set rating (PEGI/ESRB)
# - Review guidelines acceptance
# - Submit for Review

# Apple reviews within 24-48 hours
```

## Troubleshooting

### Build Fails: "Code signing required"
```bash
# Fix: Set team and enable automatic signing
xcode-select --install
xcodebuild -scheme MotorsportsData -showBuildSettings | grep CODE_SIGN
```

### Upload to TestFlight Fails: "App-specific password invalid"
```bash
# Fix: Generate new app-specific password
# Apple ID → App Passwords → Generate new password for "Xcode"
# Use that password (16 chars, spaces removed)
```

### Build Fails: "Provisioning profile not found"
```bash
# Fix: Download provisioning profile from Apple Developer Portal
# Double-click .mobileprovision file to install
# Xcode → Preferences → Accounts → Download Profiles
```

### App Crashes on TestFlight
```bash
# Check crashes in App Store Connect → Analytics → Crashes
# Enable Console logging:
# - In app: UploadManager logs to Console
# - Xcode: Window → Devices & Simulators → select device → Console
```

## App Store Submission Checklist

- [ ] Version number updated (CFBundleShortVersionString in Info.plist)
- [ ] Build number incremented (CFBundleVersion)
- [ ] All crashes fixed in TestFlight
- [ ] Permissions justified (Location, Motion, Notifications)
- [ ] Privacy policy provided
- [ ] Screenshots taken for all device sizes
- [ ] App description complete
- [ ] Keywords set for search
- [ ] Rating set (PEGI/ESRB)
- [ ] Age restriction appropriate
- [ ] No test credentials in app
- [ ] No simulator-only code

## Release Schedule

### Typical Timeline
- **Day 1**: Submit to App Store
- **Day 2-3**: Apple review (can be 48+ hours)
- **Day 3-4**: App available on App Store (if approved)

### Expedited Review (Premium)
- Contact Apple Developer Support
- +$200 per expedited review request
- Turnaround: 24 hours

## Monitoring Production

### In App Store Connect
1. **Analytics → Performance**
   - Crashes per user
   - ANRs (Application Not Responding)
   - Hang rate

2. **Analytics → Metrics**
   - Daily active users
   - Session length
   - Battery impact

3. **TestFlight → Feedback**
   - Beta tester feedback
   - Crash reports

### Logs from Riders
- Telemetry upload errors logged to `UploadManager`
- Recommend riders enable Diagnostics in iPhone Settings → Privacy
- Remote logging: Consider Firebase Crashlytics for production

## Next Deployment

After v1.0.0:

1. **Bug fixes → v1.0.1**
   ```bash
   ./scripts/build-release.sh 1.0.1
   # Same TestFlight workflow
   ```

2. **Features → v1.1.0**
   - Plan features
   - Build + test in TestFlight
   - Announce in app store notes

3. **Performance → v1.2.0**
   - Profile battery, memory
   - Optimize sensor updates
   - Reduce upload bandwidth

---

**Questions?** See [README.md](./README.md) for architecture or [DEPLOYMENT.md](./DEPLOYMENT.md) for additional details.
