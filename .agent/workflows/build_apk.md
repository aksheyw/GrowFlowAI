---
description: How to build the Android APK for GrowFlow
---

# Build Android APK

Follow these steps to generate the APK file for testing.

1.  **Build the Web Application**
    Compiles the React app into static files in the `dist` directory.
    ```bash
    npm run build
    ```

2.  **Sync with Capacitor**
    Copies the `dist` folder to the Android native project.
    ```bash
    npx cap sync
    ```

3.  **Open Android Studio**
    Opens the native project in Android Studio.
    ```bash
    npx cap open android
    ```

4.  **Generate APK in Android Studio**
    -   Wait for Gradle sync to finish.
    -   Go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    -   Wait for the build to complete.
    -   Click **locate** in the notification bubble to find the `app-debug.apk` file.
