# Gestura: Architecture and Project Structure

Welcome to Step 1 of building **Gestura**! Below is the complete architectural design and folder structure for our sign language learning and recognition game. 

## 🏗️ High-Level Architecture

The application is divided into three main components:

1. **Frontend (React + Vite)**: Handles the user interface, game logic, webcam capture, and sending video frames/data to the backend. It will communicate with Firebase for authentication and database storage.
2. **Backend (Python + Flask-SocketIO)**: Receives webcam data (or landmarks) via WebSockets, processes it using MediaPipe, feeds the normalized data to the trained Random Forest model, and returns the predicted gesture in real-time.
3. **ML Pipeline**: A separate module in the backend for downloading the Hugging Face dataset, training the scikit-learn Random Forest model, and saving it as `model.pkl`.

## 📁 Full Folder Structure

```text
Gestura/
├── frontend/                  # React (Vite) Application
│   ├── public/
│   │   └── logo.svg           # Custom SVG logo for Gestura
│   ├── src/
│   │   ├── assets/            # Images, icons, and global CSS
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Card.jsx
│   │   ├── pages/             # Main application pages
│   │   │   ├── Home.jsx
│   │   │   ├── LearningMode.jsx
│   │   │   ├── PracticeMode.jsx
│   │   │   └── Result.jsx
│   │   ├── hooks/             # Custom React hooks (e.g., useWebSocket, useFirebase)
│   │   ├── context/           # React Context for Auth and Game State
│   │   ├── services/          # API and Firebase configuration
│   │   │   ├── firebase.js
│   │   │   └── socket.js
│   │   ├── utils/             # Helper functions (e.g., scoring logic)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js     # Tailwind configuration
│   └── vite.config.js
│
├── backend/                   # Python Flask Application
│   ├── app.py                 # Main Flask & SocketIO server entry point
│   ├── detector.py            # MediaPipe Hand Tracking and landmark extraction
│   ├── classifier.py          # Loads model.pkl and handles prediction logic
│   ├── requirements.txt       # Python dependencies
│   ├── wsgi.py                # For Render deployment
│   ├── model/
│   │   └── model.pkl          # Saved Random Forest model
│   └── ml_pipeline/           # Code for training the ML model
│       ├── training.py        # Fetches Hugging Face dataset & trains the RF model
│       └── utils.py           # Preprocessing and landmark normalization
│
├── .gitignore
└── README.md
```

## 🧩 Modular Design Principles

- **Separation of Concerns**: The frontend solely handles UI and state, while the backend handles heavy lifting (AI/ML).
- **Clean UI Approach**: Following your requirement, we will use plain HTML/Tailwind styling that mimics a clean, student-built project (white/light gray bg, soft blue accents, no glassmorphism).
- **Real-Time Communication**: We'll establish a persistent WebSocket connection when entering the Practice Mode so gesture predictions are instant.

## 🚀 Next Steps (Before Moving to Step 2)

As you requested **Tailwind CSS** for the frontend, I need to confirm:
**Which version of Tailwind CSS would you like to use?** 
- Tailwind v3 (Most standard with current Vite templates)
- Tailwind v4 (The newly released version, slightly different config)

Once you confirm, we will proceed to **Step 2: Backend**, where we'll set up the Python Flask-SocketIO server structure!
