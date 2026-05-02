# 🚗 Drivero - Driver App

A professional React Native application built for drivers, featuring real-time ride handling, live location tracking, and Socket.IO communication.

---

## ✨ Features

- 🔐 **Secure Driver Login**: Authentication system for drivers to access their dashboard.
- 🏠 **Home Dashboard**: Overview of driver statistics and status.
- 🟢 **Online/Offline System**: Toggle availability to start receiving ride requests.
- 📍 **Live Location Tracking**: Real-time GPS tracking (including background support).
- 🔌 **Socket.IO Integration**: Persistent real-time connection for instant updates.
- 🚨 **Ride Request Popup**: Interactive system for accepting or rejecting incoming rides.
- 🧪 **Test Ride Generator**: Built-in tool for development and testing of the ride flow.

---

## 🧰 Tech Stack

- **Framework**: React Native CLI (No Expo)
- **Real-time**: Socket.IO Client
- **Navigation**: React Navigation
- **Location**: React Native Geolocation Services
- **State Management**: Context API / Redux
- **Storage**: AsyncStorage
- **Backend Integration**: Node.js, Express, MongoDB (JWT Auth)

---

## 📂 Project Structure

```text
src/
├── api/          # Socket.IO and Axios configurations
├── components/   # Reusable UI components (buttons, cards, popups)
├── screens/      # Application screens (Login, Home, Profile)
├── navigation/   # Stack and Tab navigators
├── services/     # Location tracking and background services
├── store/        # State management (Context/Redux)
├── utils/        # Helper functions and constants
└── assets/       # Images, fonts, and static resources
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- Ruby & CocoaPods (for iOS)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Drivero
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS Dependencies (macOS only)**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory and add your backend URL:
   ```env
   API_URL=https://your-backend-api.com
   SOCKET_URL=https://your-backend-socket.com
   ```

### Running the App

#### Android

```bash
npx react-native run-android
```

#### iOS

```bash
npx react-native run-ios
```

---

## 🛠️ Development Tools

### Test Ride Generator

To simulate a ride request during development, use the built-in test generator available in the debug menu or designated testing screen.

---

Developed with ❤️ by Banti Avchhare
