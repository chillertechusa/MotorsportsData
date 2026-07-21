#!/bin/bash
set -e

# Upload to TestFlight
IPA_PATH=${1:-"build/MotorsportsData-1.0.0/MotorsportsData.ipa"}
APPLE_ID=${2:-"$APPLE_ID_EMAIL"}
APP_SPECIFIC_PASSWORD=${3:-"$APP_SPECIFIC_PASSWORD"}

if [ ! -f "$IPA_PATH" ]; then
  echo "❌ IPA not found: $IPA_PATH"
  exit 1
fi

echo "📤 Uploading to TestFlight..."
xcrun altool --upload-app \
  -f "$IPA_PATH" \
  -t ios \
  -u "$APPLE_ID" \
  -p "$APP_SPECIFIC_PASSWORD"

echo "✅ TestFlight upload complete"
echo "📲 Check TestFlight app to install and test"
