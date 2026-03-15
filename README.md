# FileDrive - File Sharing System with RBAC

A complete MERN stack file sharing application with Role-Based Access Control (RBAC).

## Features

- **Custom JWT Authentication** - Secure login/register without third-party services
- **Role-Based Access Control** - Three user roles: Admin, Editor, and Viewer
- **File Management** - Upload, download, and delete files with role-based permissions
- **Modern UI** - Clean, Notion-style interface with Tailwind CSS and Bootstrap
- **Dual View Modes** - Switch between grid and table views
- **Advanced Filtering** - Search files and filter by type (Image, CSV, PDF)
- **Admin Dashboard** - Manage user roles and permissions

## Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- React 19 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Bootstrap & React-Bootstrap for components
- Lucide React for icons
- Axios for API calls
- React Hot Toast for notifications

## Role Permissions

### Viewer
- View all files
- Download files
- Filter and search files
- Switch between grid/table views
- **Cannot** upload or delete files

### Editor
- All Viewer permissions
- Upload files
- Delete own files

### Admin
- All Editor permissions
- Delete any file
- Access Members modal
- Change user roles

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fileshare
JWT_SECRET=supersecret
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### First Time Setup

1. Start MongoDB on your local machine
2. Start the backend server (`npm run dev` in backend folder)
3. Start the frontend server (`npm run dev` in frontend folder)
4. Open `http://localhost:5173` in your browser

### Creating Users

1. Click "Sign up" on the login page
2. Fill in your details and select a role:
   - **Viewer** - Read-only access
   - **Editor** - Can upload and manage own files
   - **Admin** - Full access including user management
3. Click "Create account"

### Uploading Files

1. Login as an Editor or Admin
2. Click the "Upload File" button in the dashboard
3. Select a file from your computer
4. Click "Upload"

### Managing Users (Admin Only)

1. Login as an Admin
2. Click "Members" in the top navigation
3. Use the dropdown next to each user to change their role
4. Changes take effect immediately

### Downloading Files

1. Click the three-dot menu on any file card/row
2. Select "Download"
3. The file will be downloaded to your default downloads folder

### Deleting Files

1. Click the three-dot menu on a file you own (or any file if you're an Admin)
2. Select "Delete"
3. Confirm the deletion

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Files
- `POST /api/files/upload` - Upload file (Admin/Editor only)
- `GET /api/files` - Get all files with filters (Protected)
- `GET /api/files/download/:id` - Download file (Protected)
- `DELETE /api/files/:id` - Delete file (Admin or file owner)

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:id/role` - Update user role (Admin only)

## Project Structure

```
FileDrive/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   └── adminController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── File.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── fileRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Topbar.jsx
    │   │   ├── DashboardControls.jsx
    │   │   ├── FileCard.jsx
    │   │   ├── FileRow.jsx
    │   │   └── AdminModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Security Features

- Passwords hashed with bcryptjs
- JWT tokens for stateless authentication
- Protected routes with authentication middleware
- Role-based authorization
- Automatic token refresh handling
- Secure file upload validation

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Uses Vite HMR
```

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check the `MONGO_URI` in `.env` file
- Verify MongoDB is accessible on port 27017

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Vite will automatically use next available port

### File Upload Fails
- Check file size (max 50MB)
- Verify `uploads/` directory exists in backend
- Ensure you're logged in as Admin or Editor

## License

MIT

## Author

Built with ❤️ using the MERN stack
