#!/bin/bash
set -e

# Debug build for simulator
SCHEME="MotorsportsData"
CONFIGURATION="Debug"

echo "🔨 Building for iOS Simulator..."
xcodebuild build \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination "generic/platform=iOS Simulator"

echo "✅ Debug build complete"
