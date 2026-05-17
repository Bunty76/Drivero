#!/bin/bash

# Drivero Android Build Setup Script
# This script ensures correct Java version and Gradle configuration

set -e

echo "🔧 Drivero Android Build Setup"
echo "==============================="
echo ""

# Check Java version
echo "📋 Checking Java version..."
JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[0-9]+' | head -1)

if [ "$JAVA_VERSION" != "21" ]; then
    echo "⚠️  WARNING: Java $JAVA_VERSION detected, but Java 21 is required!"
    echo ""
    echo "Setting JAVA_HOME to Java 21..."
    
    if [ -d "/usr/local/sdkman/candidates/java/21.0.10-ms" ]; then
        export JAVA_HOME=/usr/local/sdkman/candidates/java/21.0.10-ms
        echo "✅ JAVA_HOME set to: $JAVA_HOME"
    else
        echo "❌ Java 21 not found at /usr/local/sdkman/candidates/java/21.0.10-ms"
        echo "Please install Java 21 and try again."
        exit 1
    fi
else
    echo "✅ Java 21 detected"
fi

echo ""

# Check Android SDK
echo "📋 Checking Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME=$HOME/Android/Sdk
        echo "✅ ANDROID_HOME set to: $ANDROID_HOME"
    else
        echo "⚠️  WARNING: ANDROID_HOME not set and default SDK path not found"
        echo "Please set ANDROID_HOME environment variable:"
        echo "  export ANDROID_HOME=\$HOME/Android/Sdk"
        echo ""
    fi
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
fi

echo ""

# Check .env file
echo "📋 Checking .env file..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env file..."
    cat > .env << 'EOF'
# API Configuration
API_BASE_URL=http://localhost:3000

# Debug settings
DEBUG=true
EOF
    echo "✅ .env file created with defaults"
else
    echo "✅ .env file exists"
fi

echo ""

# Check Gradle version
echo "📋 Checking Gradle configuration..."
GRADLE_VERSION=$(grep "distributionUrl" android/gradle/wrapper/gradle-wrapper.properties | grep -oP 'gradle-\K[^-]+')
echo "✅ Gradle version: $GRADLE_VERSION"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Ready to build. Run:"
echo "   cd android && ./gradlew clean assembleDebug"
