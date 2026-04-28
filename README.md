
# 📘 Verbrix - Frontend

Frontend application for **Verbrix: Intermediary Platform for Global Healthcare Communication**, built using **Angular 21** and **Tailwind CSS v4**.

This application provides the user interface for a secure platform that connects international patients with verified interpreters, enabling structured communication, consultation, and payments.

---

## 🧭 Overview

Verbrix is a full-stack platform designed to eliminate communication barriers in global healthcare by connecting:

- Clients (international patients)
- Verified interpreters
- Admin (verification authority)

The frontend is responsible for rendering the UI, managing user interactions, and integrating with backend services via REST APIs and WebSockets.

---

## 🚀 Features

### Authentication & Security
- OTP-based email verification  
- JWT-based authentication  
- Google social login  
- Device/session management  

### Role-Based System
- Client  
- Interpreter  
- Admin  

### Interpreter Onboarding
- Application submission with document upload  
- Admin verification workflow  
- Role transition from client to interpreter  

### Relationship Lifecycle
- REQUESTED → ACCEPTED → ACTIVE → TERMINATED  
- Controls access to chat and video services  

### Real-Time Communication
- WebSocket-based chat  
- Persistent message storage  
- Access control based on relationship state  

### Video Consultation
- Secure video calls using LiveKit  
- Token-based access control  

### Payment System
- Razorpay integration  
- Idempotent order creation  
- Payment verification  
- Automatic refund mechanism  

### Admin Module
- Interpreter verification  
- Application review and approval  
- Platform monitoring  

---

## 🏗️ Architecture

The system follows a layered architecture:

### Frontend
- Angular 21  
- Tailwind CSS v4  
- REST + WebSocket communication  

### Backend
- Spring Boot (Java 21)  
- JWT-based security  
- REST APIs  

### Data Layer
- PostgreSQL (relational data)  
- MongoDB (chat and logs)  

---

## 🔗 External Services

- Razorpay — payment processing  
- LiveKit — video communication  
- Cloudinary — file storage  
- Firebase — social authentication  
- Resend — email OTP delivery  

---

## 📂 Project Structure

```

verbrix-frontend/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── models/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── app.module.ts
│   │
│   ├── assets/
│   ├── environments/
│   └── main.ts
│
├── angular.json
├── tailwind.config.js
├── package.json
└── README.md

```

---

## ⚙️ Prerequisites

- Node.js (v18 or higher)  
- npm  
- Angular CLI  

Install Angular CLI:

```

npm install -g @angular/cli

````

---

## ⚙️ Installation & Running

```bash
git clone <repository-url>
cd verbrix-frontend
npm install
ng serve
````

Application runs at:

```
http://localhost:4200
```

---

## 🔗 Backend Configuration

Update API base URL in:

```
src/environments/environment.ts
```

Example:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

Ensure backend is running before starting frontend.

---

## 📡 API Modules

* `/auth` — authentication
* `/interpreters` — interpreter management
* `/clients` — client operations
* `/relationships` — connection lifecycle
* `/chat` — messaging
* `/payments` — transactions
* `/video` — video calls

---

## ⚡ Real-Time Communication

* WebSocket endpoint: `/ws`
* Protocol: STOMP
* Topic: `/topic/chat/{id}`

Flow:

1. Send message
2. Validate relationship
3. Store message
4. Broadcast in real-time

---

## 🔒 Security

* JWT-based authentication
* BCrypt password hashing
* Role-based authorization
* Secure API endpoints
* Session/device tracking

---

## 📦 Build

```bash
ng build --configuration production
```

Output directory:

```
dist/
```

---

## 🚀 Deployment

* Docker containerization
* CI/CD via GitHub Actions
* Backend deployed on Render
* Frontend deployed on Netlify

---

## 🧪 Testing Summary

* API testing using Postman
* Backend unit testing
* Manual UI testing

Performance:

* API response: ~200–500 ms
* Low-latency real-time communication

---

## ⚠️ Limitations

* No load testing performed
* Payments tested in sandbox mode
* Mobile app partially implemented

---

## 🔮 Future Scope

* Full mobile application
* Subscription-based services
* Booking and scheduling system
* Rating and feedback system
* AI-based recommendations
* Multi-language support
* Hospital integration

---

## 👨‍💻 Authors

* Raihan Alam
* Sameer Saifi
* Nancy Goyal
* Stuti

B.Tech Computer Science & Engineering
Sanskar College of Engineering & Technology

---

## 📄 License

Academic project.
