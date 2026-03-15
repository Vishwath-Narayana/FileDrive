# FileDrive Organization System - Complete Guide

## 🎉 What's New

The application has been completely rebuilt with an **organization-based architecture**:

### ✅ Fixed Issues
- ✅ Registration now works without role selection
- ✅ Users can login after registration
- ✅ No more global user roles - roles are now organization-specific

### ✨ New Features
- ✨ **Personal Organizations**: Every user gets their own organization automatically
- ✨ **Multiple Organizations**: Users can join multiple organizations
- ✨ **Organization Switcher**: Easily switch between organizations
- ✨ **Create Organizations**: Users can create new organizations
- ✨ **Invitation System**: Admins can invite users via email
- ✨ **Member Management**: Admins can manage roles per organization
- ✨ **Organization-Specific Files**: Files belong to organizations, not users globally

## 🚀 Quick Start Guide

### 1. Register a New Account

1. Navigate to `http://localhost:5173`
2. Click "Sign up"
3. Fill in:
   - **Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
4. Click "Create account"
5. You'll see: "Account created successfully! You can now login."

**What happens behind the scenes:**
- A user account is created
- A personal organization is automatically created (e.g., "John's Personal")
- You are added as an **admin** of your personal organization

### 2. Login

1. Enter your email and password
2. Click "Sign in"
3. You'll be redirected to the dashboard

**What happens:**
- You receive a JWT token
- Your organizations are loaded
- Your personal organization is set as the default

## 📋 Organization Management

### View Your Organizations

- Click the **organization dropdown** in the top-left corner
- You'll see all organizations you're a member of
- Your personal organization will be listed first

### Create a New Organization

1. Click the organization dropdown
2. Select **"Create Organization"**
3. Enter organization name
4. Click "Create Organization"

**Result:**
- New organization is created
- You are automatically added as an **admin**
- You can now switch to this organization

### Switch Between Organizations

1. Click the organization dropdown
2. Select any organization from the list
3. The dashboard will reload with files from that organization

**Important:** Files, uploads, and permissions are **organization-specific**!

## 👥 Member Management (Admin Only)

### Access Member Management

1. Make sure you're in an organization where you're an **admin**
2. Click **"Manage Organization"** in the top navigation
3. The management modal will open with two tabs:
   - **Members**: View and manage existing members
   - **Invitations**: Send and view invitations

### View Members

In the **Members** tab:
- See all organization members
- View their current roles
- Each member shows:
  - Avatar (first letter of name)
  - Name and email
  - Current role (Admin/Editor/Viewer)

### Change Member Roles

1. Go to **Members** tab
2. Find the member you want to update
3. Click the role dropdown next to their name
4. Select new role:
   - **Admin**: Full access + member management
   - **Editor**: Can upload and delete own files
   - **Viewer**: Can only view and download files
5. Role updates immediately

## 📧 Invitation System

### Send an Invitation

1. Click **"Manage Organization"**
2. Go to **Invitations** tab
3. Click **"Send Invitation"**
4. Fill in:
   - **Email**: Recipient's email address
   - **Role**: Admin/Editor/Viewer
5. Click "Send Invitation"

**What happens:**
- Invitation is created with a unique token
- Status is set to "pending"
- The invited user will see it when they login

### View Pending Invitations

In the **Invitations** tab, you'll see:
- Email address of invitee
- Assigned role
- Status (Pending/Accepted/Rejected)
- Color-coded status badges

### Accept an Invitation (As Invitee)

**Note:** Currently invitations are stored in the database. To accept:

1. Login to your account
2. The system will check for pending invitations to your email
3. Accept the invitation (via API or future UI)
4. You'll be added to the organization with the assigned role

**API Endpoint:**
```bash
POST /api/organizations/invitations/:invitationId/accept
```

## 🔐 Role-Based Permissions

### Viewer Role
- ✅ View all files in the organization
- ✅ Download files
- ✅ Search and filter files
- ✅ Switch between grid/table views
- ❌ Cannot upload files
- ❌ Cannot delete files
- ❌ Cannot manage members

### Editor Role
- ✅ All Viewer permissions
- ✅ Upload files to the organization
- ✅ Delete **own** uploaded files
- ❌ Cannot delete files uploaded by others
- ❌ Cannot manage members

### Admin Role
- ✅ All Editor permissions
- ✅ Delete **any** file in the organization
- ✅ Access "Manage Organization" button
- ✅ View all members
- ✅ Change member roles
- ✅ Send invitations
- ✅ View invitation status

## 📁 File Management

### Upload Files

1. Make sure you're an **Editor** or **Admin** in the current organization
2. Click **"Upload File"** button
3. Select a file from your computer
4. Click "Upload"

**Important:**
- Files are uploaded to the **current organization**
- Only members of that organization can see the file
- Your role in the organization determines upload permissions

### Download Files

1. Click the **3-dot menu** on any file
2. Select "Download"
3. File downloads to your default folder

**Available to:** All roles (Viewer, Editor, Admin)

### Delete Files

1. Click the **3-dot menu** on a file
2. Select "Delete" (if available)
3. Confirm deletion

**Permissions:**
- **Viewer**: No delete option shown
- **Editor**: Can delete own files only
- **Admin**: Can delete any file

### Search and Filter

- **Search**: Type in the search box to find files by name
- **Filter by Type**: Use the dropdown to filter by:
  - All
  - Image
  - CSV
  - PDF

**Available to:** All roles

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey

1. **Register** as "Alice" (alice@test.com)
2. **Login** - You'll see "Alice's Personal" organization
3. **Upload** a file to your personal organization
4. **Create** a new organization called "Team Project"
5. **Switch** to "Team Project" organization
6. **Upload** a file to Team Project
7. **Switch back** to "Alice's Personal"
8. Verify you only see files from Alice's Personal

### Scenario 2: Multi-User Organization

1. **User 1 (Admin)**: Register as admin@test.com
2. **User 1**: Create organization "Shared Workspace"
3. **User 1**: Send invitation to editor@test.com with role "Editor"
4. **User 2 (Editor)**: Register as editor@test.com
5. **User 2**: Accept invitation (via API or future UI)
6. **User 2**: Login and switch to "Shared Workspace"
7. **User 2**: Upload a file
8. **User 1**: Switch to "Shared Workspace"
9. **User 1**: Verify they can see and delete User 2's file
10. **User 2**: Verify they cannot delete User 1's files

### Scenario 3: Role Management

1. **Admin**: Create organization and invite user as "Viewer"
2. **Viewer**: Login and verify no upload button
3. **Admin**: Change viewer's role to "Editor"
4. **Editor**: Refresh and verify upload button appears
5. **Editor**: Upload a file
6. **Admin**: Change editor's role back to "Viewer"
7. **Viewer**: Verify upload button disappears

## 🔧 API Endpoints Reference

### Authentication
```
POST /api/auth/register - Register new user (creates personal org)
POST /api/auth/login - Login (returns organizations)
GET /api/auth/me - Get current user with organizations
```

### Organizations
```
POST /api/organizations - Create new organization
GET /api/organizations - Get all my organizations
GET /api/organizations/:id - Get specific organization
PUT /api/organizations/:organizationId/members/:userId/role - Update member role
```

### Invitations
```
POST /api/organizations/:organizationId/invitations - Send invitation
GET /api/organizations/:organizationId/invitations - Get org invitations
GET /api/organizations/invitations/me - Get my pending invitations
POST /api/organizations/invitations/:invitationId/accept - Accept invitation
POST /api/organizations/invitations/:invitationId/reject - Reject invitation
```

### Files
```
POST /api/files/upload - Upload file (requires organizationId in body)
GET /api/files?organizationId=xxx - Get files for organization
GET /api/files/download/:id - Download file
DELETE /api/files/:id - Delete file
```

## 🐛 Troubleshooting

### Registration Failed
- **Check**: MongoDB is running
- **Check**: Backend console for errors
- **Check**: All required fields are filled
- **Solution**: Restart backend server

### Cannot See Upload Button
- **Check**: Your role in the current organization
- **Check**: You're not a Viewer
- **Solution**: Ask admin to change your role to Editor or Admin

### Files Not Showing
- **Check**: You're in the correct organization
- **Check**: Files were uploaded to this organization
- **Solution**: Switch to the organization where files were uploaded

### Cannot Manage Members
- **Check**: You're an Admin in the current organization
- **Check**: "Manage Organization" button is visible
- **Solution**: Only admins can manage members

### Invitation Not Working
- **Check**: Email matches exactly (case-insensitive)
- **Check**: Invitation status is "pending"
- **Check**: User has registered with that email
- **Solution**: Use API endpoint to accept invitation

## 📊 Database Structure

### Users Collection
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  personalOrganization: ObjectId (ref: Organization)
}
```

### Organizations Collection
```javascript
{
  _id: ObjectId,
  name: "Team Project",
  owner: ObjectId (ref: User),
  members: [
    {
      user: ObjectId (ref: User),
      role: "admin" | "editor" | "viewer",
      joinedAt: Date
    }
  ]
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  filename: "unique-filename.pdf",
  originalName: "document.pdf",
  path: "/path/to/file",
  size: 12345,
  fileType: "pdf" | "image" | "csv" | "other",
  uploader: ObjectId (ref: User),
  organization: ObjectId (ref: Organization)
}
```

### Invitations Collection
```javascript
{
  _id: ObjectId,
  organization: ObjectId (ref: Organization),
  email: "invitee@example.com",
  role: "admin" | "editor" | "viewer",
  invitedBy: ObjectId (ref: User),
  status: "pending" | "accepted" | "rejected",
  token: "unique-token"
}
```

## 🎯 Key Differences from Previous Version

| Feature | Old System | New System |
|---------|-----------|------------|
| User Roles | Global (one role per user) | Organization-specific |
| File Access | All users see all files | Organization-scoped files |
| Permissions | Based on user role | Based on org membership + role |
| Registration | Choose role during signup | No role selection |
| Organizations | Not supported | Full multi-org support |
| Invitations | Not available | Email-based invitations |
| Member Management | Global admin panel | Per-organization management |

## 🚀 Next Steps

1. **Test the complete flow** with multiple users
2. **Create UI for accepting invitations** in the dashboard
3. **Add email notifications** for invitations
4. **Implement favorites** functionality
5. **Add trash/recycle bin** per organization
6. **Create organization settings** page
7. **Add organization deletion** feature
8. **Implement file sharing** between organizations
9. **Add activity logs** per organization
10. **Deploy to production**

---

**Application is now running:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- MongoDB: localhost:27017

**Ready to test!** 🎉
