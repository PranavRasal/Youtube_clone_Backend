# 🎥 YouTube Clone Backend

A scalable backend API for a YouTube-like video sharing platform built with Node.js, Express.js, MongoDB, and Cloudinary.

This project provides complete backend functionality for video hosting, user management, authentication, subscriptions, playlists, likes, comments, and more.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User Registration
* User Login & Logout
* JWT Access Token Authentication
* Refresh Token Mechanism
* Protected Routes
* Secure Password Hashing

### 👤 User Management

* User Profile Management
* Avatar Upload
* Cover Image Upload
* Watch History
* Account Updates

<!--
### ❤️ Social Features

* Like / Unlike Videos
* Like / Unlike Tweets
* Comments System
* Reply Support
* Channel Subscriptions
* Subscriber Management

### 📋 Playlist Management

* Create Playlist
* Update Playlist
* Delete Playlist
* Add Videos to Playlist
* Remove Videos from Playlist

### 🐦 Tweet Feature

* Create Tweets
* Update Tweets
* Delete Tweets
* Like Tweets

### 📊 Dashboard APIs

* Channel Statistics
* Video Analytics
* User Activity Insights
  -->

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (Access Token & Refresh Token)
* bcrypt

### Media Storage

* Cloudinary

### Utilities

* Multer
* Cookie Parser
* CORS
* dotenv

---

## 📁 Project Structure

```bash
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── constants/
├── app.js
└── index.js
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/PranavRasal/Youtube_clone_Backend.git
cd Youtube_clone_Backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000

MONGODB_URI=your_mongodb_uri

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGIN=*
```

### Start Development Server

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## API Modules

* Authentication
* Users
* Videos
* Comments
* Likes
* Playlists
* Subscriptions
* Tweets
* Dashboard

---

## Learning Outcomes

This project demonstrates:

* REST API Design
* JWT Authentication
* MongoDB Data Modeling
* File Upload Handling
* Cloud Storage Integration
* Backend Architecture
* Scalable Express Applications

---

## Future Improvements

* Video Streaming Optimization
* Redis Caching
* Notifications System
* Real-Time Chat
* Recommendation Engine
* Microservices Architecture

---

## Author

**Pranav Rasal**



