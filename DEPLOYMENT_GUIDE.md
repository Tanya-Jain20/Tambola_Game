# Tambola Deployment Guide

Since this is a full-stack application with a real-time (Socket.io) backend, the best way to deploy is to separate the Frontend and Backend.

## 1. Prerequisites
- A [GitHub](https://github.com) account.
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (for the database).
- A [Render](https://render.com) account (for the Backend).
- A [Vercel](https://vercel.com) account (for the Frontend).

---

## 2. Database Setup (MongoDB Atlas)
1.  Log in to MongoDB Atlas and create a **Free Cluster**.
2.  In **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or a specific IP if you know it.
3.  In **Database Access**, create a user with a password.
4.  Get your **Connection String** (it looks like `mongodb+srv://<user>:<password>@cluster.mongodb.net/tambola`).

---

## 3. Backend Deployment (Render)
Render is recommended for the backend because it supports persistent WebSocket connections (unlike Vercel's serverless functions).

1.  Connect your GitHub repository to Render.
2.  Create a new **Web Service**.
3.  Set the **Root Directory** to `backend`.
4.  **Build Command**: `npm install`
5.  **Start Command**: `npm start`
6.  **Environment Variables**:
    - `MONGODB_URI`: Your MongoDB Atlas connection string.
    - `PORT`: `5000` (or leave as default).
7.  Once deployed, copy your Render URL (e.g., `https://tambola-backend.onrender.com`).

---

## 4. Frontend Deployment (Vercel)
Vercel is the best choice for the React frontend.

1.  Connect your GitHub repository to Vercel.
2.  Create a new project.
3.  Set the **Root Directory** to `frontend`.
4.  **Framework Preset**: `Create React App` (or Vite if you upgraded).
5.  **Build Command**: `npm run build`
6.  **Output Directory**: `build`
7.  **Environment Variables**:
    - `REACT_APP_SOCKET_URL`: Paste your Render Backend URL here.
8.  Click **Deploy**.

---

## 5. Final Step
Once both are deployed, open your Vercel URL. You should see the game and be able to create rooms!
