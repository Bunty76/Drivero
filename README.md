# 🚗 Drivero - Driver App

A professional React Native application built for drivers, featuring real-time ride handling, live location tracking, and Socket.IO communication.

---

## ✨ Features

- 🔐 **Secure Driver Login**: Authentication system for drivers to access their dashboard.
- 🏠 **Home Dashboard**: Overview of driver statistics and status.
- 🟢 **Online/Offline System**: Toggle availability to start receiving ride requests.
- 📍 **Live Location Tracking**: Real-time GPS updates (centered on India by default).
- 🔌 **Socket.IO Engine**: Real-time connection for instant ride requests.
- 🚨 **Ride Interaction**: Accept or Reject rides via interactive popups.
- 🔒 **Safe Logout**: Prevents logging out while Online to protect tracking.

---

## 🧰 Tech Stack

- **Framework**: React Native CLI (No Expo)
- **Maps**: React Native Maps (Google Maps)
- **Real-time**: Socket.IO Client
- **Testing**: Detox (End-to-End)
- **Backend**: Node.js / Express / MongoDB (Deployed on Render)

---

## 🚀 Getting Started

### Prerequisites

⚠️ **Important**: Before building, please read [BUILD.md](./BUILD.md) for:
- ✅ Correct Java version setup (Java 21 required)
- ✅ Android SDK configuration
- ✅ Environment variables

### Installation

1. **Clone & Install**

   ```bash
   git clone https://github.com/Bunty76/Drivero.git
   cd Drivero
   npm install
   ```

2. **Backend Configuration**
   The app connects to the live backend: `https://ridexbackend.onrender.com`
   (Configurable in `src/api/axios.ts`)

---

## 📱 Running on Real Device

To run the app on your physical Android phone:

1.  **Enable USB Debugging** on your phone (Developer Options).
2.  **Connect your phone** to your computer via USB.
3.  **Verify connection**:
    ```bash
    adb devices
    ```
4.  **Run the App**:
    ```bash
    npx react-native run-android
    ```

---

## 🧪 Testing (Detox E2E)

The project includes automated tests that simulate real user behavior on your device.

**To run the tests:**

1.  **Build the Test APK** (Required for first-time or native changes):
    ```bash
    npx detox build --configuration android.att.debug
    ```
2.  **Run the Tests**:
    ensure you have started your backend server and metro server
    ```bash
    npx react-native start
    ```
    ```bash
    npx detox test --configuration android.att.debug
    ```
    _This tests: Login -> Map Visibility -> Online Toggle -> Logout Logic._

---

## 📦 Making an Installable APK (Universal)

To create a single `.apk` file that you can send to any Android phone for installation:

1.  **Clean and Build**:
    ```bash
    cd android
    ./gradlew assembleRelease
    ```
2.  **Locate your APK**:
    Your installable file is located at:
    `android/app/build/outputs/apk/release/app-release.apk`

---

## 📂 Project Structure

```text
src/
├── api/          # Network & Socket logic
├── components/   # UI Components (Buttons, Maps, Modals)
├── screens/      # Register, Login, Home screens
├── services/     # Location tracking services
├── store/        # Auth & State management
└── hooks/        # Custom reusable logic
```

---

## 🛠️ Troubleshooting

Having build issues? Check these guides:

- **[BUILD.md](./BUILD.md)** - Detailed build setup and requirements
- **[GRADLE_TROUBLESHOOTING.md](./GRADLE_TROUBLESHOOTING.md)** - Common errors and fixes
- **Quick setup**: Run `./setup-build.sh` to verify your environment

### Frequent Issues

| Issue | Solution |
|-------|----------|
| `NoSuchFieldError: IBM_SEMERU` | Use Java 21, Gradle 8.13 |
| `SDK location not found` | Set `ANDROID_HOME` or create `android/local.properties` |
| `Missing .env file` | Copy `.env.example` to `.env` |
| Build fails with Java 25 | Switch to Java 21 |

See **[GRADLE_TROUBLESHOOTING.md](./GRADLE_TROUBLESHOOTING.md)** for detailed solutions.

---

Developed with ❤️ by **Banti Avchhare**
