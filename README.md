# 📘 Verbrix Frontend

Frontend application for **Verbrix**, a platform that connects international patients with verified interpreters to facilitate secure healthcare communication.

Built with **Angular 21** and **Tailwind CSS v4**, the application delivers a responsive user experience for authentication, onboarding, communication, consultations, and payment workflows.

---

## Overview

Verbrix is a healthcare communication platform designed to bridge language barriers between patients and professional interpreters.

The frontend provides:

* Secure authentication and account management
* Interpreter onboarding workflows
* Relationship management
* Real-time messaging
* Video consultations
* Payment processing
* Administrative dashboards

---

## Features

### Authentication & Authorization

* Email OTP verification
* JWT authentication
* Google OAuth login
* Session and device management

### Role Management

* Client
* Interpreter
* Admin

### Interpreter Onboarding

* Application submission
* Document uploads
* Verification workflow
* Role transition management

### Relationship Management

Relationship lifecycle:

```text
REQUESTED → ACCEPTED → ACTIVE → TERMINATED
```

Features:

* Controlled access to platform services
* Relationship validation
* Secure workflow management

### Real-Time Messaging

* WebSocket-based communication
* Real-time chat updates
* Relationship-based access control

### Video Consultation

* LiveKit integration
* Secure token-based session access
* Real-time video communication

### Payment Processing

* Razorpay integration
* Payment verification
* Transaction tracking
* Refund workflow support

### Administration

* Interpreter verification
* Application review
* Platform monitoring

---

## Technology Stack

### Frontend

* Angular 21
* TypeScript
* Tailwind CSS v4
* RxJS
* Angular Router
* Angular Signals

### Backend Integration

* Spring Boot REST APIs
* JWT Authentication
* WebSocket (STOMP)

---

## External Services

* Razorpay
* LiveKit
* Cloudinary
* Firebase Authentication
* Resend

---

## Project Structure

```text
src/
├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── models/
│   ├── guards/
│   ├── interceptors/
│   └── shared/
│
├── assets/
├── environments/
└── main.ts
```

---

## Prerequisites

* Node.js 18+
* npm
* Angular CLI

Install Angular CLI:

```bash
npm install -g @angular/cli
```

---

## Installation

```bash
git clone <repository-url>
cd verbrix-frontend
npm install
```

---

## Running Locally

```bash
ng serve
```

Application URL:

```text
http://localhost:4200
```

---

## Environment Configuration

Configure API endpoints inside:

```text
src/environments/environment.ts
```

Example:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/api"
};
```

---

## API Modules

| Module         | Endpoint         |
| -------------- | ---------------- |
| Authentication | `/auth`          |
| Interpreter    | `/interpreters`  |
| Client         | `/clients`       |
| Relationship   | `/relationships` |
| Chat           | `/chat`          |
| Payment        | `/payments`      |
| Video          | `/video`         |

---

## Real-Time Communication

### WebSocket Endpoint

```text
/ws
```

### Chat Topic

```text
/topic/chat/{relationshipId}
```

### Workflow

1. Establish WebSocket connection
2. Subscribe to relationship topic
3. Send and receive messages in real time
4. Synchronize chat history

---

## Security

* JWT-based authentication
* Route guards
* HTTP interceptors
* Secure token handling
* Role-based UI access control

---

## Build

```bash
ng build --configuration production
```

Build output:

```text
dist/
```

---

## Deployment

* Docker
* GitHub Actions
* Netlify

---

## Author

**Raihan Alam**
