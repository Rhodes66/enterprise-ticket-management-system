# Enterprise Ticket Management System

## 1. Project Overview

Enterprise Ticket Management System is a full-stack web application designed around an internal IT service desk scenario. It simulates how employees submit IT support requests, how technical staff handle assigned tickets, and how administrators monitor service efficiency through a dashboard.

This project is designed as an enterprise-scenario practice project rather than a simple classroom demo. It focuses on business workflow, role-based access control, ticket status management, database design, RESTful APIs, dashboard statistics, and AI-assisted ticket handling.

## 2. Business Scenario

In many companies, employees may need help with network issues, account access, software errors, hardware problems, or internal system usage. A ticket management system helps standardize this process.

The system includes three roles:

- Employee: submits tickets and checks personal ticket progress.
- Technician: handles assigned tickets and adds processing comments.
- Administrator: manages users, assigns tickets, checks all tickets, and monitors dashboard statistics.

## 3. Main Features

- User registration and login
- JWT-based authentication
- Role-based access control
- Ticket creation and ticket list display
- Ticket assignment and status update
- Processing comments and ticket history
- Dashboard statistics
- AI-assisted ticket summary
- AI priority recommendation
- AI handling suggestions
- SQLite database persistence
- Demo accounts for presentation and testing

## 4. Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: SQLite
- Authentication: JWT
- AI Integration: DeepSeek API compatible interface
- Project Documentation: Markdown

## 5. System Architecture

```text
Browser
  |
  v
Frontend UI: HTML / CSS / JavaScript
  |
  v
Backend API: Node.js / Express
  |
  +--> Authentication & Authorization
  +--> Ticket Management
  +--> Dashboard Statistics
  +--> AI Assistance
  |
  v
SQLite Database
  |
  v
Users / Tickets / Comments / Logs
```

## 6. How to Run

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Configure environment variables

Copy `.env.example` to `.env` and fill in your own values if needed.

```env
PORT=3000
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_api_key_optional
```

If no AI API key is provided, the project can still run with local mock AI responses for demonstration.

### Step 3: Start the server

```bash
npm start
```

### Step 4: Open the website

Visit:

```text
http://localhost:3000
```

## 7. Demo Accounts

```text
Administrator: admin@example.com / admin123
Technician:    tech@example.com / tech123
Employee:      employee@example.com / emp123
```

## 8. Project Value

This project demonstrates the ability to design and implement a web-based enterprise workflow system. It covers full-stack development, database modeling, API design, authentication, authorization, business process modeling, and AI API integration.

It can be used as a portfolio project for software engineering, IT management, data analytics, and AI application-related postgraduate applications.

## 9. Limitations and Future Improvements

Current limitations:

- The frontend is implemented with vanilla JavaScript rather than a modern framework.
- The database uses SQLite, which is suitable for local demonstration but not large-scale production.
- File attachment and SLA notification features are not included in this version.

Future improvements:

- Add file attachment support for tickets.
- Add SLA timeout reminders.
- Add email notifications.
- Add Docker deployment.
- Add unit tests and API tests.
- Replace SQLite with MySQL or PostgreSQL for production-like deployment.
