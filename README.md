# InternSafe-AI 🛡️

### A Web Application for Reporting Suspicious Internship Offers

InternSafe-AI is a web application designed to help users record and review suspicious internship offers. Users can submit company details and describe their experiences to maintain a record of potentially suspicious recruitment practices.

## 🚀 Live Demo

- **Frontend:** https://internsafe-ai.vercel.app
- **Backend API:** https://internsafe-ai-backend.onrender.com
- **Reports API:** https://internsafe-ai-backend.onrender.com/api/reports

## ✨ Features

- Submit reports about suspicious internship offers.
- Record company names and incident descriptions.
- Validate required form fields.
- Store reports in a PostgreSQL database.
- Retrieve and display previously submitted reports.
- Preserve submitted reports across page refreshes.
- Support descriptions containing special characters.
- Deploy the frontend and backend separately.

## 🛠️ Tech Stack

**Frontend**
- React
- JavaScript
- HTML
- CSS
- Vercel

**Backend**
- Node.js
- Express.js
- REST API
- PostgreSQL
- `pg` PostgreSQL client
- Render

## ⚙️ How It Works

1. A user enters a company name and describes an internship-related incident.
2. The frontend sends the report to the backend API.
3. The backend validates the required fields.
4. The report is stored in PostgreSQL.
5. The frontend retrieves and displays recorded reports.

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check backend status |
| GET | `/api/reports` | Retrieve recorded reports |
| POST | `/api/reports` | Submit a new report |

## 💻 Run Locally

### Prerequisites
- Node.js and npm
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/PushpanjaliVemuluri-1122/Internsafe-AI.git
cd Internsafe-AI
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Configure the `DATABASE_URL` environment variable with your PostgreSQL connection string. Keep database credentials private and never commit secrets to GitHub.

Start the backend using:

```bash
npm start
```

### 3. Configure the frontend

Open a separate terminal and navigate to the frontend project directory. Install its dependencies and configure the API URL according to the frontend environment settings.

Use the development command specified in the frontend `package.json` to start the application.

## 🧪 Testing

The following checks were performed on the deployed application:

- Required-field validation
- Successful report submission
- Retrieval of reports through the backend API
- Persistence of reports after refreshing the page
- Long descriptions and special characters
- Consistent report data between the frontend and API

## 🔮 Future Improvements

- Search reports by company name
- Filter reports by category
- Add report verification and moderation
- Improve the user interface and accessibility
- Add secure user authentication and administrative controls

## 👩‍💻 Developer

**Pushpanjali Vemuluri**

B.Tech Computer Science and Engineering Student

GitHub: https://github.com/PushpanjaliVemuluri-1122

LinkedIn: https://linkedin.com/in/pushpanjali-vemuluri-a88023428

---

*Note: Reports are user-submitted and should be independently verified. A report alone does not establish that a company or internship offer is fraudulent.*
