# Admin Dashboard Improvements

## Summary of Changes

This document outlines the improvements made to the Admin Dashboard, including enhanced security, better case information display, and fixed email/SMS routing.

## 1. Admin Account Whitelist (Security Enhancement)

### Overview
The admin dashboard is now restricted to a whitelist of authorized users. Only specific admin accounts can access the dashboard and perform administrative actions.

### Configuration

To configure the admin whitelist, set environment variables:

```bash
# Whitelist by username (comma-separated)
export ADMIN_WHITELIST="admin,supervisor,facilitator1"

# Whitelist by email (comma-separated)
export ADMIN_WHITELIST_EMAILS="admin@court.gov,supervisor@court.gov"
```

### How It Works

- The `@AuthService.require_admin_whitelist()` decorator is applied to all admin endpoints
- Users must be authenticated AND be in the whitelist to access admin features
- Access attempts by non-whitelisted users are logged in the audit log
- If no whitelist is configured, all authenticated admin users can access (backward compatible)

### Protected Endpoints

The following endpoints now require whitelist access:
- `/api/admin/queue` - Get queue data
- `/api/admin/call-next` - Call next case
- `/api/admin/complete-case` - Complete a case

## 2. Enhanced Case Information Display

### Overview
When an admin calls a number, they now receive comprehensive case information immediately, allowing them to help clients more effectively.

### Information Displayed

When calling next, admins now see:

1. **Case Type Information** (Prominently Displayed)
   - Case type name
   - Description
   - Estimated duration
   - Required forms

2. **User Information**
   - Name
   - Email
   - Phone number
   - Language preference

3. **Case Details**
   - Documents needed
   - Conversation summary
   - Current step/node
   - Wait time

4. **Actions**
   - View full summary
   - Send email
   - Complete case

### Backend Changes

The `/api/admin/call-next` endpoint now returns:
- Complete case type information from the database
- Parsed documents_needed (handles both JSON strings and arrays)
- Calculated wait time
- All case metadata

### Frontend Changes

The AdminDashboard component now:
- Displays case information in a 3-column layout
- Shows case type information prominently in a highlighted box
- Provides quick access to all case details
- Shows a notification when calling next with case type information

## 3. Email Routing Fixes

### Overview
Fixed routing issues with email service to ensure emails are sent correctly from the admin dashboard.

### Changes

1. **New Endpoint**: `/api/send-comprehensive-email`
   - Main endpoint for sending comprehensive case emails
   - Handles multiple data formats (email field, case_data object, etc.)
   - Properly routes to EmailService

2. **Email Service Integration**
   - All email requests now properly route through EmailService
   - Handles both legacy and new data formats
   - Includes proper error handling and logging

### Email Data Format

The endpoint accepts data in multiple formats:

```javascript
// Format 1: Direct fields
{
  email: "user@example.com",
  user_name: "John Doe",
  case_type: "DVRO",
  queue_number: "A001",
  forms: ["DV-100", "DV-109"],
  summary: "Case summary text"
}

// Format 2: Nested case_data
{
  email: "user@example.com",
  case_data: {
    user_name: "John Doe",
    case_type: "DVRO",
    queue_number: "A001",
    forms: ["DV-100", "DV-109"],
    summary: "Case summary text"
  }
}
```

## 4. SMS Routing

### Current Status
SMS functionality is handled via `/api/sms/send-queue-number` endpoint. This is currently a mock endpoint for development. In production, this should be connected to a real SMS service (Twilio, etc.).

## Testing

### Test Admin Whitelist

1. Create a test admin user:
```python
from utils.auth_service import AuthService
AuthService.create_user('testadmin', 'test@court.gov', 'password123', 'admin')
```

2. Set whitelist:
```bash
export ADMIN_WHITELIST="testadmin"
```

3. Try to access admin dashboard - should work
4. Try with different username - should be denied

### Test Case Information Display

1. Add a case to the queue
2. Log in as admin
3. Click "Call Next Number"
4. Verify that comprehensive case information is displayed
5. Check that case type information is prominently shown

### Test Email Routing

1. Select a case with an email address
2. Click "Send Email"
3. Verify email is sent successfully
4. Check email service logs for proper routing

## Migration Notes

### For Existing Deployments

1. **Admin Whitelist**: If you want to restrict access, set the environment variables. If not set, all authenticated admins can still access (backward compatible).

2. **Email Endpoints**: The new `/api/send-comprehensive-email` endpoint is the primary endpoint. The old `/api/email/send-case-summary` endpoint still works for backward compatibility.

3. **Database**: No database migrations required. All changes are backward compatible.

## Security Considerations

1. **Whitelist Management**: Keep the whitelist secure. Consider using a secrets management system for production.

2. **Audit Logging**: All access attempts (including denied ones) are logged in the audit log for security monitoring.

3. **Session Management**: Admin sessions expire after 8 hours. Users must re-authenticate.

## Future Enhancements

1. **SMS Integration**: Connect to real SMS service (Twilio, etc.)
2. **Role-Based Permissions**: More granular permissions beyond admin whitelist
3. **Case Type Templates**: Pre-configured case type information for faster setup
4. **Real-time Updates**: WebSocket support for real-time queue updates

