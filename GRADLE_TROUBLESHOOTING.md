# Gradle Build Troubleshooting Guide

## Common Errors and Solutions

### 1. ❌ NoSuchFieldError: JvmVendorSpec IBM_SEMERU

**Error Message:**
```
Exception java.lang.NoSuchFieldError: Class org.gradle.jvm.toolchain.JvmVendorSpec 
does not have member field 'org.gradle.jvm.toolchain.JvmVendorSpec IBM_SEMERU'
```

**Cause:** Gradle 9.3.1+ has Foojay plugin incompatibilities with Java 25

**Solution:**
```bash
# Verify Java version (should be 21, not 25)
java -version

# Set to Java 21
export JAVA_HOME=/usr/local/sdkman/candidates/java/21.0.10-ms

# Clear caches and rebuild
rm -rf ~/.gradle/daemon/*
cd android && ./gradlew clean assembleDebug
```

**Prevention:**
- Never use Gradle > 8.13
- Always use Java 21 LTS (currently configured)

---

### 2. ❌ SDK location not found

**Error Message:**
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME 
environment variable or by setting the sdk.dir path in your project's local.properties
```

**Cause:** Android SDK path not configured

**Solution:**

**Option A: Using ANDROID_HOME**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
```

**Option B: Using local.properties**
```bash
# Copy the template
cp android/local.properties.example android/local.properties

# Edit and add your SDK path
# Windows: sdk.dir=C:\\Users\\username\\AppData\\Local\\Android\\Sdk
# macOS: sdk.dir=/Users/username/Library/Android/Sdk
# Linux: sdk.dir=/home/username/Android/Sdk
```

---

### 3. ❌ Missing .env file

**Error Message:**
```
**************************
*** Missing .env file ****
**************************
```

**Cause:** Environment configuration file not found

**Solution:**
```bash
# Copy from example
cp .env.example .env

# Edit with your values (at minimum, API_BASE_URL)
```

---

### 4. ❌ Unsupported class file major version 69

**Error Message:**
```
BUG! exception in phase 'semantic analysis'
Unsupported class file major version 69
```

**Cause:** Java version too new (Java 25) for older Gradle (8.11.1)

**Solution:**
```bash
# Use Java 21
export JAVA_HOME=/usr/local/sdkman/candidates/java/21.0.10-ms

# Clear gradle daemon
rm -rf ~/.gradle/daemon/*
```

---

### 5. ❌ Deprecated Gradle features incompatible with Gradle 10

**Error Message:**
```
Deprecated Gradle features were used in this build, making it 
incompatible with Gradle 10
```

**Cause:** Gradle configuration using deprecated syntax

**Solution:**
- Don't upgrade to Gradle 10 yet
- Current version (8.13) is stable and maintained
- Warnings can be ignored for now

---

## Prevention Checklist

Before each build, verify:

- [ ] Java version is 21: `java -version`
- [ ] Gradle version is 8.13: `cd android && ./gradlew --version`
- [ ] `.env` file exists: `ls .env`
- [ ] Android SDK is configured: `echo $ANDROID_HOME`
- [ ] `local.properties` exists (optional): `ls android/local.properties`

---

## Automated Setup

Run the setup script to check all prerequisites:

```bash
./setup-build.sh
```

This will:
- ✅ Verify Java 21 is available
- ✅ Set ANDROID_HOME if needed
- ✅ Create .env file if missing
- ✅ Display Gradle configuration

---

## Quick Fix Script

Copy and run to fix most common issues:

```bash
#!/bin/bash
export JAVA_HOME=/usr/local/sdkman/candidates/java/21.0.10-ms
rm -rf ~/.gradle/daemon/*
[ ! -f .env ] && cp .env.example .env
cd android
./gradlew clean assembleDebug --no-daemon
```

---

## When All Else Fails

**Nuclear option** (resets everything):

```bash
# Stop all gradle daemons
cd android && ./gradlew --stop

# Clear all gradle caches
rm -rf ~/.gradle
rm -rf android/.gradle
rm -rf android/build

# Clear node modules and reinstall
cd ..
rm -rf node_modules
npm install

# Rebuild
cd android
./gradlew clean assembleDebug
```

---

## Need More Help?

1. Check [BUILD.md](../BUILD.md) for setup instructions
2. Review Android build logs: `cd android && ./gradlew assembleDebug --debug`
3. Check Gradle status: `./gradlew --status`
4. See GitHub Actions workflow: `.github/workflows/android-build.yml`
