# Tracker - Master Your Goals 🎯

Tracker is a premium, minimalist goal-tracking application designed to help you build consistency. Visualize your progress with interactive heatmaps, manage daily missions with countdowns, and learn from your failures with detailed logging.

**Live Demo:** [https://trackerwin.web.app](https://trackerwin.web.app)

## ✨ Features

- **🔥 Performance Heatmap**: Visualize your last 30 days of activity. Green for success, Red for failure.
- **⚡ Real-time Updates**: Instant task syncing across devices using Firebase Firestore.
- **📱 PWA Support**: Installable on iOS and Android as a native-like app (Add to Home Screen).
- **🎨 Premium Dark Mode**: Glassmorphism UI, smooth animations, and a focus on aesthetics.
- **🔐 Secure Auth**: Google Sign-In integration.
- **⏱️ Mission Control**: Set strict deadlines and track them with live countdown timers.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: Firebase (Authentication, Firestore)
- **Hosting**: Firebase Hosting
- **Icons**: Custom SVG & Generated Assets

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- A Firebase project created

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/tracker.git
    cd tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your Firebase credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 🌍 Deployment

This project is optimized for **Firebase Hosting**.

1.  **Build the project:**
    ```bash
    npm run build
    ```
    *(This exports a static version of the app to the `out/` directory)*

2.  **Deploy:**
    ```bash
    npx firebase-tools deploy --only hosting
    ```

## 📱 Installing on Mobile

1.  Open the site in Chrome (Android) or Safari (iOS).
2.  Tap the **Share/Menu** button.
3.  Select **"Add to Home Screen"**.
4.  Launch the app from your home screen for a full-screen experience.