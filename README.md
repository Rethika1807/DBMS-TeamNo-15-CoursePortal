# 📚 Course Registration Portal

A full-stack web application that allows users to register, log in, and enroll in courses. This project demonstrates frontend + backend integration using modern web technologies.

---

## 🚀 Features

* 👤 User Signup & Login
* 🎓 Course Enrollment
* 📊 View Enrolled Courses
* 🔐 Authentication System
* 💾 MySQL Database Integration
* 📱 Responsive Dashboard UI

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

---

## 📁 Project Structure

```
course-portal/
│
├── dashboard.html
    dashboard.html
    index.html
    login.html
    package-lock.json
    package.json
   schema.sql
   script.js
   server.js
   signup.html
   styles.css

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/Rethika1807/course-portal.git
cd course-portal
```

---

### 2️⃣ Install Dependencies

```
npm install
```

---

### 3️⃣ Setup MySQL Database

Open MySQL and run:

```sql
CREATE DATABASE course_portal;
USE course_portal;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    course_name VARCHAR(255),
    phone VARCHAR(20),
    date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 4️⃣ Configure Database

Open `server.js` and update:

```js
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "course_portal"
});
```

---

### 5️⃣ Run Server

```
npm start
```

OR

```
node server.js
```

---

### 6️⃣ Open Application

Open `index.html` in your browser
OR use Live Server in VS Code

---

## 🔗 API Endpoints

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | /signup              | Register new user    |
| POST   | /login               | Login user           |
| POST   | /enroll              | Enroll in course     |
| GET    | /enrollments/:userId | Get user enrollments |

---

## 🧪 Sample SQL Queries

```sql
SELECT * FROM users;
SELECT * FROM enrollments;

SELECT users.name, enrollments.course_name
FROM users
JOIN enrollments ON users.id = enrollments.user_id;
```

---

## 📌 Future Improvements

* 🔐 Password hashing (bcrypt)
* 🎟️ JWT Authentication
* 🧑‍💼 Admin Panel
* 🔍 Course Search & Filter
* 🌐 Deployment (Render / Railway)

---

## 👨‍💻 Author

**Malloji Rethika**

---

## ⭐ If you like this project

Give it a star on GitHub ⭐
