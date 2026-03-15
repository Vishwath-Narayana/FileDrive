# FileDrive Testing Guide

## Quick Start Testing

The application is now running:
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **MongoDB:** localhost:27017

## Test Scenarios

### 1. User Registration & Authentication

#### Test Admin User
1. Navigate to http://localhost:5173
2. Click "Sign up"
3. Register with:
   - Name: `Admin User`
   - Email: `admin@test.com`
   - Password: `admin123`
   - Role: `Admin`
4. You should be automatically logged in and redirected to the dashboard

#### Test Editor User
1. Sign out from the Admin account
2. Register a new user:
   - Name: `Editor User`
   - Email: `editor@test.com`
   - Password: `editor123`
   - Role: `Editor`

#### Test Viewer User
1. Sign out from the Editor account
2. Register a new user:
   - Name: `Viewer User`
   - Email: `viewer@test.com`
   - Password: `viewer123`
   - Role: `Viewer`

### 2. RBAC Testing

#### As Viewer (viewer@test.com)
✅ **Should be able to:**
- View all files in grid/table mode
- Search files
- Filter files by type
- Download files
- Switch between grid and table views

❌ **Should NOT be able to:**
- See "Upload File" button
- See "Delete" option in file context menu
- Access Members modal

#### As Editor (editor@test.com)
✅ **Should be able to:**
- All Viewer permissions
- See "Upload File" button
- Upload new files
- Delete own uploaded files

❌ **Should NOT be able to:**
- Delete files uploaded by others
- Access Members modal

#### As Admin (admin@test.com)
✅ **Should be able to:**
- All Editor permissions
- Delete ANY file (regardless of uploader)
- Access "Members" button in top navigation
- Change user roles in Members modal

### 3. File Upload Testing

1. Login as Editor or Admin
2. Click "Upload File" button
3. Select a test file (try different types: image, PDF, CSV)
4. Click "Upload"
5. Verify file appears in the dashboard
6. Check that file shows correct:
   - File name
   - File type icon (blue for images, red for PDF, green for CSV)
   - Uploader name and avatar
   - Upload timestamp

### 4. File Download Testing

1. Click the 3-dot menu on any file
2. Select "Download"
3. Verify file downloads to your default downloads folder

### 5. File Delete Testing

#### As Editor
1. Login as Editor
2. Upload a test file
3. Click 3-dot menu on YOUR file → should see "Delete" option
4. Click 3-dot menu on Admin's file → should NOT see "Delete" option
5. Delete your file and confirm deletion

#### As Admin
1. Login as Admin
2. Click 3-dot menu on ANY file → should see "Delete" option
3. Delete a file uploaded by Editor
4. Verify deletion works

### 6. Search & Filter Testing

1. Upload multiple files of different types
2. Test search:
   - Type partial filename in search box
   - Verify only matching files appear
3. Test type filter:
   - Select "Image" → only images show
   - Select "PDF" → only PDFs show
   - Select "CSV" → only CSVs show
   - Select "All" → all files show

### 7. View Mode Testing

1. Click Grid icon → files display as cards
2. Click Table icon → files display in table format
3. Verify both views show:
   - File name
   - File type
   - Uploader info
   - Upload date
   - 3-dot context menu

### 8. Admin Role Management Testing

1. Login as Admin
2. Click "Members" in top navigation
3. Verify all registered users appear
4. Change a user's role:
   - Click dropdown next to a user
   - Select different role (Admin/Editor/Viewer)
   - Verify success toast appears
5. Login as that user and verify permissions changed

### 9. Authentication Flow Testing

1. Try accessing `/dashboard` without login → should redirect to `/login`
2. Login successfully → should redirect to `/dashboard`
3. Try accessing `/login` while logged in → should redirect to `/dashboard`
4. Sign out → should redirect to `/login`
5. Refresh page while logged in → should stay logged in

### 10. Error Handling Testing

1. Try uploading without selecting a file → should show error
2. Try logging in with wrong credentials → should show error message
3. Try registering with existing email → should show error
4. Try uploading very large file (>50MB) → should handle gracefully

## Expected File Structure in MongoDB

After testing, your MongoDB should have:

### Users Collection
```javascript
{
  _id: ObjectId,
  name: "Admin User",
  email: "admin@test.com",
  password: "hashed_password",
  role: "admin",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  filename: "1234567890-testfile.pdf",
  originalName: "testfile.pdf",
  path: "/path/to/uploads/1234567890-testfile.pdf",
  size: 12345,
  fileType: "pdf",
  uploader: ObjectId (reference to User),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## Troubleshooting

### Backend Issues
- Check backend terminal for errors
- Verify MongoDB is running: `mongosh` or `mongo`
- Check `.env` file has correct values
- Restart backend: `npm run dev` in backend folder

### Frontend Issues
- Check browser console for errors
- Verify backend is running on port 5000
- Clear browser cache and localStorage
- Restart frontend: `npm run dev` in frontend folder

### File Upload Issues
- Check `backend/uploads/` directory exists
- Verify file size is under 50MB
- Check backend logs for Multer errors
- Ensure logged in as Admin or Editor

## Success Criteria

✅ All three user roles can register and login
✅ Viewer cannot upload or delete files
✅ Editor can upload and delete own files
✅ Admin can delete any file and manage roles
✅ File upload/download works end-to-end
✅ Search and filtering work correctly
✅ Grid and table views display properly
✅ Role changes in Members modal take effect
✅ Authentication redirects work correctly
✅ Error messages display for invalid actions

## Next Steps

After testing, you can:
1. Add more file type support
2. Implement favorites functionality
3. Add trash/recycle bin feature
4. Implement file sharing links
5. Add file preview functionality
6. Implement pagination for large file lists
7. Add user profile editing
8. Implement email invitations
9. Add activity logs
10. Deploy to production
