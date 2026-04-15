# FileDrive Technical Breakdown

FileDrive is a production-grade, full-stack file management and collaboration platform. It is designed to mimic a modern SaaS environment where users can manage files, collaborate via organizations, and interact in real-time.

---

## 1. Project Overview
FileDrive is a **Collaborative File Management System** that allows teams to upload, share, and manage documents in a secure, organized workspace.

- **Primary Goal**: Provide a seamless, real-time experience for managing files within a professional team environment.
- **Key Use Cases**: 
  - Centralized team document storage.
  - Role-based collaboration (Admin, Editor, Viewer).
  - Secure internal file sharing with signed URLs.
  - Real-time activity notifications.

---

## 2. Tech Stack Breakdown & Rationale

| Technology | Purpose | Rationale |
| :--- | :--- | :--- |
| **React (Vite)** | Frontend Framework | Vite offers near-instant hot module replacement (HMR), and React provides a component-based architecture perfect for building complex UIs like the Dashboard. |
| **Node.js + Express** | Backend Runtime | JavaScript across the full stack enables faster development and unified models/validation logic. |
| **MongoDB (Mongoose)** | Database | A flexible document-based schema is ideal for file systems where metadata (exif data, CSV headers, etc.) can vary. |
| **Supabase Auth** | Authentication | Managed auth reduces security risks, handles session persistence, and provides advanced features like Magic Links and MFA out-of-the-box. |
| **Cloudinary** | File Storage | Handling raw binary data on a server is expensive and slow. Cloudinary provides global CDN delivery, optimized resizing, and the **Signed URL** feature for secure private access. |
| **Socket.io** | Real-time System | Enables low-latency bidirectional communication. Necessary for the "live" feel of notifications and file updates without manual refreshes. |
| **Tailwind CSS** | Styling | Utility-first CSS allows for high-velocity UI development while maintaining a premium, consistent design language. |

---

## 3. Project Architecture

The application follows a **Client-Server-Service** architecture:

1.  **Client (Frontend)**: A React Single Page Application (SPA) that manages state via the Context API. It communicates with the Backend via REST APIs and listens for live updates via Socket.io.
2.  **Server (Backend)**: An Express API that acts as a bridge. It handles business logic (RBAC, invitation validation), manages database records in MongoDB, and orchestrates real-time events.
3.  **External Services**:
    - **Supabase**: Validates identity and provides JWTs.
    - **Cloudinary**: Stores physical file binaries.

### Data Flow Overview
1.  User performs action (e.g., Upload).
2.  Frontend sends data to Backend + JWT.
3.  Backend `authMiddleware` verifies the JWT with Supabase.
4.  Backend modifies MongoDB records & interacts with Cloudinary if needed.
5.  Backend broadcasts the change via **Socket.io**.
6.  All connected clients in the same Organization room receive the event and update their UI instantly.

---

## 4. Folder Structure Explanation

### `backend/`
- `config/`: Contains DB and Cloudinary configuration.
- `controllers/`: The "Brain" of the backend. Contains functions for files, organizations, and users.
- `middlewares/`: Security layers (JWT verification, Role-based checks).
- `models/`: Mongoose schemas (User, Organization, File, Invitation, Notification).
- `routes/`: API endpoint definitions mapping URLs to controllers.
- `socket.js`: Manage the Socket.io lifecycle (init, emits, and rooms).

### `frontend/`
- `src/context/`: Global states (Auth, Organizations).
- `src/services/`: API (Axios) and Socket.io client configuration.
- `src/pages/`: Main application views (Dashboard, Login, Settings).
- `src/components/`: Reusable UI elements (Sidebar, Navbar, Modals).

---

## 5. Flow Deep-Dives (Interview Ready)

### 1. Invitation Flow (Step-by-Step)
This is a critical flow that demonstrates the interaction between Database, Email (simulated), and Frontend State.

1.  **Initiation**: An Admin sends an invite from the Dashboard. The backend creates a `Invitation` document with a unique `crypto.randomUUID()` token.
2.  **Notification**: If the invited user already has an account, a `Notification` is saved in MongoDB and a real-time event `notification:new` is emitted to their socket.
3.  **Email/Link**: The system generates a link: `filedrive.com/accept-invite?token=XYZ`. 
4.  **Capture**: When the user clicks the link, the **App-level `useEffect`** in `App.jsx` captures the token from the URL and saves it to `localStorage` as `inviteToken`.
5.  **Auth Check**: If the user isn't logged in, they are redirected to Login/Register.
6.  **Auto-Join**: Upon successful login, the `AuthContext`'s `onAuthStateChange` listener fires. If an `inviteToken` exists in `localStorage`, it automatically calls the `/api/organizations/accept-invite` API.
7.  **Resolution**: The backend verifies the token, adds the user to the organization's members list, marks the invitation as "accepted," and the frontend refreshes the organization list.

### 2. Authentication Flow (Supabase ↔ MongoDB Sync)
This project uses a "Hybrid Auth" pattern.

1.  **Managed Login**: The user logs in via Supabase. Supabase returns a `session` containing a **JWT (JSON Web Token)**.
2.  **Backend Verification**: Every API call includes this JWT in the `Authorization` header.
3.  **The Bridge (Middleware)**: The backend `authMiddleware.js` decodes the token (extracting the Supabase UID).
4.  **Auto-Provisioning**:
    - If the user exists in MongoDB, it fetches their profile.
    - If it's a **new user**, the backend automatically creates a `User` record in MongoDB and generates a "Personal Organization" for them instantly.
    - This ensures we have a MongoDB `_id` to link with files and organization memberships.

### 3. File Upload & Download Flow
1.  **Upload Phase**:
    - Frontend sends a `multipart/form-data` request with the file to the Backend.
    - `multer-storage-cloudinary` intercepts the request, streams the file directly to Cloudinary, and provides the backend with the Cloudinary URL and `public_id`.
    - Backend saves the metadata (filename, size, format, uploader ID) to the `File` model in MongoDB.
2.  **Download Phase (Signed URLs)**:
    - Files are stored as "private" in Cloudinary for security.
    - When a user clicks "Download," the frontend requests a **Signed URL** from the backend.
    - The backend verifies permissions, generates a time-limited signed URL via the Cloudinary SDK, and sends it back.
    - **Why?** This prevents direct URL guessing and ensures only authorized members can view/download files.

### 4. Real-Time Flow (Socket.io)
1.  **Initialization**: When the dashboard loads, the client connects to the socket server and joins a specific "room" based on the `organizationId`.
2.  **Event Emission**: When an action occurs (e.g., `deleteFile`), the controller calls `getIO().to(room).emit('file:deleted', { fileId })`.
3.  **Frontend Synchronicity**: The frontend `Dashboard.jsx` listens for these events:
    - On `file:new`: Appends the new file to the current list.
    - On `file:deleted`: Removes the file from the UI instantly.
    - This provides a "multiplayer" feel—if two users are in the same org, they see each other's changes without refreshing.

---

## 6. Database Schema (Mongoose Models)

- **User**: Stores Supabase metadata link, name, email, and personal org ID.
- **Organization**: Stores the member list (array of Objects with `user` ref and `role`).
- **File**: Stores Cloudinary metadata, uploader ID, and organization ID.
- **Invitation**: Stores the invite token, recipient email, and target org/role.
- **Notification**: Stores in-app alerts (invite requests, system messages).

---

## 7. Security Considerations

1.  **JWT Integrity**: All backend routes are protected. We decode the Supabase JWT to verify user identity.
2.  **Role-Based Access Control (RBAC)**: A custom middleware checks if a user is an `admin` or `editor` before allowing destructive actions (Delete/Upload).
3.  **Private Storage**: Files are not publicly accessible. They require a backend-generated signed URL to view.
4.  **Audit Logs (Trash System)**: Files are "soft deleted" (marked as `isDeleted`) first, allowing for recovery and tracking who deleted which file.

---

## 8. Interview Talking Points

- **"Why the Hybrid Auth Approach?"**: "We use Supabase for its industry-standard security and session management, while MongoDB gives us the flexibility to store complex relationships like organization hierarchies and notification histories which are easier to manage in a document store."
- **"How do you handle large file uploads?"**: "We use a streaming approach with `multer-storage-cloudinary`. The file doesn't sit on our server's disk; it streams directly to the cloud, reducing memory overhead and improving latency."
- **"What was the biggest challenge?"**: "Implementing the auto-join logic. Capturing a token from an email link, preserving it through a third-party auth redirect, and then executing the join logic once the session was established required careful coordination between the App-level effects and the Auth Context listeners."

---

## 9. Summary
FileDrive is a robust example of a modern **Real-time SaaS architecture**. By combining a managed authentication service (Supabase) with specialized media storage (Cloudinary) and a fast real-time layer (Socket.io), the project achieves a high level of security, scalability, and UX quality.
