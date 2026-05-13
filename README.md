# 🎨 Demand Signals Dashboard
### Inibsa · Interhack BCN 2026 

[![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.6+-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10+-22b5bf?style=for-the-badge&logo=recharts&logoColor=white)](https://recharts.org/)

**Demand Signals Dashboard** is the frontend component of the Inibsa Smart Demand Signals solution. It provides a high-fidelity, interactive interface for sales teams to monitor clinic retention, analyze purchase patterns, and act on prioritized alerts in real-time.

---

## 🌟 Key Features

### 🚦 Real-Time Alert Feed
*   **Prioritized View**: Alerts are ranked by impact (LTV, Urgency, Confidence).
*   **Status Workflow**: Manage alert lifecycles (New → In Progress → Complete/Discarded).
*   **Infinite Pagination**: Smooth navigation through large alert datasets.

### 📈 Interpretability Graphics
Every alert is backed by data. The dashboard visualizes:
*   **Historical Cadence**: A clear timeline of past purchases vs. expected cycles.
*   **Dynamic Thresholds**: Visual indicators of "Soft Trigger" vs. "Hard Overdue" states.
*   **Score Breakdown**: Transparency into why a specific client was prioritized.

### 💎 Premium UX/UI
*   **Glassmorphism Design**: Modern, clean aesthetic with dark mode optimization.
*   **Responsive Layout**: Fully optimized for both desktop and tablet views.
*   **Micro-animations**: Subtle transitions for improved user engagement.

---

## 🏗️ Technical Architecture

*   **Framework**: React (Vite)
*   **State Management**: Hooks-based architecture with custom `useAlerts`.
*   **Visualizations**: Recharts for high-performance SVG graphing.
*   **API Client**: Axios with centralized configuration and interceptors.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 18 or higher.
*   The backend API running (default: `http://localhost:8000`).

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/marcprogcode/inibsa-front.git
cd inibsa-front

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Running the Dashboard
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

*   `src/`: Main source code.
    *   `components/`: Reusable UI components (Graphs, Rows, Chips).
    *   `hooks/`: Custom logic hooks (`useAlerts`, `useInterpretability`).
    *   `services/`: API client configurations.
    *   `data/`: Mock data for development and testing.
    *   `assets/`: Icons and static branding.

---

## 📄 License
This project was developed for the **Interhack BCN 2026** Hackathon. All rights reserved by Inibsa and the development team.
