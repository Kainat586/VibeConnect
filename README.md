# VibeConnect 🌐✨  
A full-stack modern social networking platform built with React, Node.js, and MongoDB — designed to bring people together through posts, profiles, likes, and real-time interaction.

## 🚀 Project Overview

**VibeConnect** is a responsive and scalable social media web app inspired by platforms like Facebook and Instagram. It allows users to sign up, create a profile, post updates (with media), follow/unfollow users, like/comment on posts, and engage in a vibrant online community.

> This project was built as part of an internship at **Arch Technologies**, focused on mastering full-stack development and deploying a production-grade web app.

## 🔧 Tech Stack

### 🌐 Frontend
- **React.js** (with Hooks & Context API)
- **React Router** – Routing and navigation
- **Tailwind CSS / CSS3** – Responsive & modern UI
- **Axios** – HTTP requests to backend
- **Framer Motion / AOS** – Animations and transitions

### 🛠️ Backend
- **Node.js** – Server-side runtime
- **Express.js** – REST API framework
- **MongoDB Atlas** – Cloud-based NoSQL database
- **Mongoose** – ODM for MongoDB
- **JWT** – Secure authentication
- **bcrypt** – Password hashing
- **Multer** – File uploads (profile pictures, post media)

## 🔐 Core Features

- ✅ User registration & secure login (JWT-based)
- ✅ Profile creation & editing (name, bio, image)
- ✅ Create/update/delete posts with text & images/videos
- ✅ Like, comment, and engage on posts
- ✅ Follow/unfollow users & view their profiles
- ✅ View feed of posts from followed users
- ✅ View user-specific posts (MyPosts)
- ✅ Light/Dark mode toggle
- ✅ Fully responsive & mobile-friendly design
- ✅ Smooth UI transitions and hover effects

## 📁 Project Structure

vibeconnect/
│
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components like Home, Profile, Login
│ │ ├── context/ # Auth and state providers
│ │ ├── App.js # Routing
│ │ └── index.js
│
├── server/ # Node.js backend
│ ├── controllers/ # Route handlers
│ ├── models/ # Mongoose models
│ ├── routes/ # API route definitions
│ ├── middleware/ # Auth middleware, file upload config
│ ├── server.js # Entry point
│ └── .env


## 🛠️ Installation & Setup

### Clone the repository
git clone https://github.com/Kainat586/VibeConnect.git
cd VibeConnect
🌍 Backend Setup
cd server
npm install
Create a .env file in the server/ directory with:

env

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
Start the backend server:
npm start
🎨 Frontend Setup
cd client
npm install
npm start
The app will be running at http://localhost:3000 and the backend at http://localhost:5000.

🤝 Contributions
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

🙌 Acknowledgements
Thanks to Arch Technologies for the opportunity to build this platform during my internship and refine my skills in full-stack web development.

📬 Contact
GitHub: Kainat586

Email: kainat.khuram786@gmail.com

Live Demo: 

https://github.com/user-attachments/assets/3a5b0565-899f-4077-8c4a-58bb15dcbe22

