#!/bin/bash
set -e

# Motorsports Data iOS App - Release Build Script
# Usage: ./scripts/build-release.sh [version]

VERSION=${1:-"1.0.0"}
SCHEME="MotorsportsData"
CONFIGURATION="Release"
DERIVED_DATA="./build"
ARCHIVE_PATH="${DERIVED_DATA}/MotorsportsData.xcarchive"
EXPORT_PATH="${DERIVED_DATA}/MotorsportsData-${VERSION}"

echo "🚀 Building Motorsports Data iOS App v${VERSION}"

# Clean previous builds
rm -rf "$DERIVED_DATA"
mkdir -p "$DERIVED_DATA"

# Build archive
echo "📦 Creating archive..."
xcodebuild archive \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -derivedDataPath "$DERIVED_DATA" \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS"

# Export for TestFlight
echo "📤 Exporting for TestFlight..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "./ExportOptions.plist" \
  -exportPath "$EXPORT_PATH"

echo "✅ Build complete: $EXPORT_PATH"
echo "📱 Ready for TestFlight upload"
