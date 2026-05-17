# Android Build Guide - Drivero

## Prerequisites

### Java Version
```bash
# Use Java 21 LTS (NOT Java 25)
export JAVA_HOME=/usr/local/sdkman/candidates/java/21.0.10-ms
```

### Android SDK
Set up Android SDK and point to it:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
# OR add to local.properties:
# sdk.dir=/path/to/android/sdk
```

### Environment File
Create `.env` file in project root:
```
# Example .env
API_BASE_URL=http://localhost:3000
```

## Building

### Clean Build
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Debug Build
```bash
./gradlew assembleDebugWithLogging
```

## Gradle Version Management

**DO NOT UPGRADE Gradle above 8.13** - Version 9.3.1 has Foojay plugin incompatibilities.

Current configuration:
- **Gradle**: 8.13 (stable, tested with React Native 0.85.2)
- **Kotlin**: 2.1.20
- **Java**: 21 LTS

## Common Build Issues

### Issue: "NoSuchFieldError: JvmVendorSpec IBM_SEMERU"
**Cause**: Gradle 9.3.1 + Java 25 incompatibility
**Fix**: Use Java 21 and Gradle 8.13 (already configured)

### Issue: "SDK location not found"
**Fix**: Set `ANDROID_HOME` or create `android/local.properties`:
```properties
sdk.dir=/path/to/android/sdk
```

### Issue: "Missing .env file"
**Fix**: Create `.env` in project root with required variables

## Troubleshooting

```bash
# Clear Gradle cache if issues persist
rm -rf ~/.gradle/daemon/*
rm -rf android/.gradle

# Rebuild
cd android && ./gradlew clean assembleDebug
```

## References
- React Native: 0.85.2
- Android Gradle Plugin: Latest (via React Native)
- Gradle: 8.13 (see gradle/wrapper/gradle-wrapper.properties)
