# CybrSens Dashboard Project

## Table of Contents
- [Overview](#overview)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Services](#services)
- [Frontend](#frontend)
- [Backend Services](#backend-services)
- [Development](#development)
- [Deployment](#deployment)

## Overview
CybrSens Dashboard is a comprehensive web application that provides KPI visualization, data parsing, and analytics capabilities. The project is built using a microservices architecture with multiple backend services and a React-based frontend.

## Project Architecture
The project follows a microservices architecture with the following main components:
- Frontend (React + Vite)
- Main Backend Service
- Calculator Backend Service
- Parser Backend Service
- Database Layer

### System Architecture Diagram
```
┌────────────┐     ┌─────────────┐
│            │     │             │
│  Frontend  │◄────►  Backend    │
│  (React)   │     │  Service    │
│            │     │             │
└────────────┘     └─────────────┘
                          ▲
                          │
                   ┌──────┴──────┐
                   │             │
         ┌────────►│  Database   │◄─────────┐
         │         │             │          │
         │         └─────────────┘          │
┌────────────────┐              ┌────────────────┐
│   Calculator   │              │    Parser      │
│   Backend      │              │    Backend     │
└────────────────┘              └────────────────┘
```

## Tech Stack
### Frontend
- React 18+
- Vite
- TailwindCSS
- React Flow (@xyflow/react)
- Lucide React (Icons)

### Backend Services
- Python FastAPI
- SQLAlchemy
- Alembic (Database Migrations)
- PostgreSQL
- Docker

## Project Structure
```
├── frontend/                  # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   └── services/         # API services
│   ├── Dockerfile
│   └── package.json
│
├── backend/                   # Main backend service
│   ├── app/
│   │   ├── auth/            # Authentication
│   │   ├── core/            # Core configurations
│   │   ├── dashboard/       # Dashboard functionality
│   │   └── init_db/         # Database initialization
│   ├── alembic/             # Database migrations
│   └── Dockerfile
│
├── calculator_backend/        # Calculator service
│   ├── core/
│   └── Dockerfile
│
├── parser_backend/           # Parser service
│   ├── parsers/             # Different parsers
│   ├── core/
│   └── Dockerfile
│
└── docker-compose.yml        # Docker compose configuration
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 16+
- Python 3.11+
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abdo-amsg/dashboard.git
cd dashboard
```

2. Environment Setup:
```bash
# Create necessary .env files in each service directory
cp .env.example .env
```

3. Start the services using Docker Compose:
```bash
docker-compose up -d
```

## Services

### Frontend Service (Port 3000)
The frontend service is built with React and Vite, featuring:
- KPI Mindmap visualization
- Interactive dashboard components
- User authentication interface
- File upload and management
- Settings management

Key Features:
- Interactive KPI visualization using React Flow
- Responsive design with TailwindCSS
- Real-time data updates
- File management system

### Main Backend Service (Port 8000)
Handles core functionality including:
- User authentication and authorization
- Dashboard data management
- File storage and retrieval
- Database operations

### Calculator Backend (Port 8001)
Specialized service for:
- Data calculations
- Metric processing
- Statistical analysis

### Parser Backend (Port 8002)
Handles various file parsing operations:
- Cisco ASA log parsing
- Kaspersky AV log parsing
- Nessus report parsing

## Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

Available Scripts:
- `npm run dev`: Start development server
- `npm run build`: Build production version
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## API Documentation

### Main Backend Endpoints
- Authentication:
  - POST `/api/auth/login`
  - POST `/api/auth/register`
  - POST `/api/auth/logout`

- Dashboard:
  - GET `/api/dashboard/kpis`
  - POST `/api/dashboard/upload`
  - GET `/api/dashboard/metrics`

### Calculator Backend Endpoints
- POST `/api/calculate/metrics`
- GET `/api/calculate/status`

### Parser Backend Endpoints
- POST `/api/parse/cisco-asa`
- POST `/api/parse/kaspersky`
- POST `/api/parse/nessus`

## Security Features
- JWT Authentication
- Role-based access control
- Secure password hashing
- Input validation
- CORS configuration
- Security headers

## Testing
The project includes various test suites:
```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd frontend
npm run test
```

## Deployment
The application can be deployed using Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Production Considerations
- Set up proper environment variables
- Configure proper security settings
- Set up SSL/TLS certificates
- Configure backup systems
- Set up monitoring and logging

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.