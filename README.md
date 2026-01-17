# HRMS Lite - Human Resource Management System

A full-stack HRMS application for managing employees and their attendance records.

## Live Demo

- **Frontend:** [https://hrms-lite-chj.vercel.app](https://hrms-lite-chj.vercel.app)
- **Backend API:** [https://hrms-lite-chj-api.onrender.com](https://hrms-lite-chj-api.onrender.com)

## Features

### Employee Management
- Add new employees with unique Employee ID, Full Name, Email, and Department
- View all employees in **Grid View** or **List View**
- Delete employees with confirmation dialog
- Click on employee name to view detailed profile and attendance history

### Attendance Management
- Mark daily attendance (Present/Absent) for each employee
- Filter by date using an intuitive date picker
- Filter by department (multi-select)
- Search employees by name
- Visual status indicators for attendance

### Dashboard
- Total employee count
- Today's attendance statistics
- Attendance rate percentage
- Quick navigation to key sections

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.14)
- **Database:** SQLite (development) / PostgreSQL (production)
- **ORM:** SQLAlchemy
- **Validation:** Pydantic

### Frontend
- **Framework:** React 18
- **UI Library:** Material UI (MUI) v5
- **Date Handling:** date-fns
- **HTTP Client:** Axios
- **Routing:** React Router DOM

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py           # FastAPI app & API endpoints
│   ├── models.py         # SQLAlchemy database models
│   ├── schemas.py        # Pydantic validation schemas
│   ├── database.py       # Database connection setup
│   ├── config.py         # Configuration settings
│   └── requirements.txt  # Python dependencies
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── api/          # API service layer
        ├── components/   # Reusable React components
        ├── pages/        # Page components
        ├── App.js        # Main app with routing
        ├── index.js      # App entry point
        └── theme.js      # MUI theme configuration
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd hrms-lite/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd hrms-lite/frontend

# Install dependencies
npm install

# Run the development server
npm start
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees with attendance stats |
| GET | `/api/employees/{employee_id}` | Get single employee details |
| POST | `/api/employees` | Create new employee |
| DELETE | `/api/employees/{employee_id}` | Delete employee |
| GET | `/api/employees/next-id` | Get next available employee ID |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get attendance records (with filters) |
| POST | `/api/attendance` | Mark attendance for an employee |
| GET | `/api/employees/{employee_id}/attendance` | Get attendance history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

## Validation & Error Handling

- **Server-side validation** for all required fields
- **Email format validation** using Pydantic
- **Duplicate employee ID** detection
- **Proper HTTP status codes** (200, 201, 400, 404, 409, 500)
- **Meaningful error messages** returned to client

## UI/UX Features

- Responsive design for all screen sizes
- Dark theme with teal/indigo accent colors
- Loading spinners during API calls
- Empty state illustrations
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Smooth hover animations

## Author

Chakshu Jindal
