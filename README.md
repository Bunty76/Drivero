# 🚗 Drivero - Driver App

A professional React Native application built for drivers, featuring real-time ride handling, live location tracking, and Socket.IO communication.

---

## ✨ Features

- 🔐 **Secure Driver Login**: Authentication system for drivers to access their dashboard.
- 🏠 **Home Dashboard**: Overview of driver statistics and status.
- 🟢 **Online/Offline System**: Toggle availability to start receiving ride requests.
- 📍 **Live Location Tracking**: Real-time GPS updates sent to the backend via GeoJSON (with background support).
- 🔌 **Socket.IO Engine**: Persistent real-time connection for instant ride requests and cancellations.
- 🚨 **Ride Interaction**: Interactive popups to **Accept** or **Reject** rides instantly.
- 🔒 **Safe Session Management**: Restricts logout while Online to ensure location tracking integrity.
- 🧪 **E2E Testing**: Fully automated testing suite using **Detox**.

---

## 🧰 Tech Stack

- **Frontend**: React Native CLI (No Expo)
- **Real-time**: Socket.IO Client
- **Navigation**: React Navigation (Stack)
- **Location**: React Native Geolocation Services
- **Backend**: Node.js, Express, MongoDB (Deployed on Render)
- **Testing**: Detox (End-to-End)

---

## 🚀 Getting Started

### Installation

1. **Clone & Install**

   ```bash
   git clone https://github.com/Bunty76/Drivero.git
   cd Drivero
   npm install
   # or
   yarn install
   ```

2. **Install iOS Dependencies (macOS only)**

   ```bash
   cd ios && pod install && cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your backend URL:
   ```env
   API_URL=https://your-backend-api.com
   SOCKET_URL=https://your-backend-socket.com
   ```

### Running the App

```bash
# Start Metro Bundler
npx react-native start

# Run on Android Device/Emulator
npx react-native run-android
```

---

## 🧪 Testing (Detox E2E)

The project includes a robust automated test suite that runs on real Android devices.

**To run the tests:**

1. Ensure your device is connected via ADB.
2. Run the following command:
   ```bash
   npx detox test --configuration android.att.debug
   ```
   _This will test the full lifecycle: Registration -> Login -> Online/Offline Toggle -> Logout._

---

## 📦 Building for Production (Universal APK)

To generate a single APK that works on **all Android devices**:

1. **Generate the APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
2. **Find the file**:
   The APK will be located at:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## 📂 Project Structure

```text
src/
├── api/          # Socket.IO and Axios (Backend Connectivity)
├── components/   # Reusable UI components
├── screens/      # Register, Login, Home screens
├── navigation/   # Navigation logic
├── services/     # GPS and Location services
├── store/        # Auth Context (Session state)
└── utils/        # Constants and helpers
```

---

Developed with ❤️ by **Banti Avchhare**
