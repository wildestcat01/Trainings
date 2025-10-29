# Training Management Admin Panel - Setup Instructions

This is a comprehensive admin panel for managing corporate training programs with a simplified module structure, employee management with CSV upload, batch assignments, and detailed reporting.

## Features

### 1. Training Modules Management
- Simple, flat structure with Module Name, Designation, and Sub-Module Title
- Select from existing modules or create new ones
- Designation dropdown populated from active employees
- File upload support (PDF, PPT, DOC)
- Search and filter by module name, designation, and sub-module
- Sorted by creation date (newest first)

### 2. Employee Management
- CSV bulk upload with template download
- Individual employee CRUD operations
- Active/Deactivate user status
- Search and filter capabilities
- View individual training progress and profiles
- Fields: Employee ID, Name, Email, Phone, Designation, Department, DOJ, Location

### 3. Batch Management
- Create and manage training batches
- Add/remove employees with advanced filters (designation, department, location)
- Assign training modules to batches
- Save as draft or publish batches
- Publishing pushes batch details to enrolled users
- Deactivate/archive batches

### 4. Reports & Analytics
- Batch-level reports with completion metrics
- Employee-level reports with individual progress
- Dashboard with key statistics
- Export reports to CSV
- Progress tracking: Not Started, In Progress, Completed
- Average completion percentages

## Database Setup

### Step 1: Run the New Simplified Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: hddicrovxlqlwdoncdrn
3. Navigate to SQL Editor
4. Open the migration file: `supabase/migrations/simplified_training_schema.sql`
5. Copy all the SQL content
6. Paste it into the SQL Editor
7. Click "Run" to execute the migration

**IMPORTANT:** This migration will:
- Drop old tables if they exist
- Create new simplified schema
- Insert sample data (10 employees + 24 training modules)

### Step 2: Create Your Admin Account

1. After the migration is complete, the app is already running
2. Open the application in your browser
3. Click "Don't have an account? Sign up"
4. Create your admin account with email and password
5. You'll be automatically signed in to the admin panel

### Step 3: Explore Sample Data

The migration includes pre-populated sample data:

**10 Sample Employees:**
- Various designations: CXO, Director, Manager, Senior Executive, Executive
- Different departments: Executive, Sales, Operations, Marketing, HR, etc.
- Multiple locations across the US

**24 Sample Training Modules across 5 categories:**
- Soft Communications (7 modules)
- POSH (5 modules)
- CRM Mastery (4 modules)
- Sales Excellence (4 modules)
- Digital Marketing (4 modules)

## Using the Admin Panel

### Training Modules

**Adding a New Module:**
1. Click "Add Training Module"
2. Choose to "Add New Module" or "Select Existing" (if modules already exist)
3. Select designation from dropdown (loaded from active employees)
4. Enter sub-module title
5. Upload content file (PDF, PPT, DOC)
6. Click "Add Module"

**Module Structure:**
- **Module Name**: Category (e.g., "Soft Communications", "POSH", "CRM Mastery")
- **Designation**: Target role (e.g., "CXO", "Manager", "Executive")
- **Sub-Module Title**: Specific topic (e.g., "Executive Presence and Leadership Communication")
- **Content File**: Training material with file name display

**Filtering:**
- Search box: Find modules by name or sub-module title
- Module dropdown: Filter by module category
- Designation dropdown: Filter by target designation

### Employee Management

**CSV Upload Format:**
```csv
Employee ID,Employee Name,Phone Number,Email Id,Designation,Department,DOJ,Location
EMP001,John Doe,9876543210,john@example.com,Manager,Sales,2024-01-01,New York
```

**Operations:**
1. Download Template - Get sample CSV file
2. Upload CSV - Bulk import employees
3. Add Employee - Manual entry
4. Edit - Update employee details
5. Toggle Status - Activate/Deactivate
6. Training Profile - View progress
7. Delete - Remove employee

### Batch Management

**Creating a Batch:**
1. Click "Create Batch"
2. Enter Batch Title and Description
3. Click "Create & Continue"
4. Click "Manage" on the batch card

**Managing Batch:**
1. **Employees Tab**:
   - Filter by Designation, Department, Location
   - Search employees by name
   - Check employees to add them
   - Uncheck to remove them

2. **Modules Tab**:
   - Browse all training modules
   - Shows: Sub-Module Title, Module Name, Designation
   - Check modules to assign them
   - Uncheck to remove them

3. **Publishing**:
   - Draft batches are not visible to employees
   - Click the Send icon to publish
   - Published batches appear with green badge
   - Click again to unpublish

### Reports

**Batch Level Report:**
- All published batches
- Employee and module counts
- Completion metrics (Completed, In Progress, Not Started)
- Average progress with visual progress bar

**Employee Level Report:**
- All active employees
- Assigned batch count
- Module completion tracking
- Individual progress percentages

**Export:**
- Click "Export CSV" to download
- Choose between batch or employee report
- Opens in Excel/spreadsheet software

## Sample Data Overview

### Employee Distribution:
- 2 CXOs
- 2 Directors
- 3 Managers
- 2 Senior Executives
- 1 Executive

### Training Module Distribution:
- Each module targets specific designations
- Mix of PDF and PPTX content types
- Real-world training topics
- Hierarchical categorization

## Data Structure

### Simplified Schema:
```
training_modules
├── module_name (e.g., "Soft Communications")
├── designation (e.g., "CXO")
├── sub_module_title (e.g., "Executive Presence")
├── content_file (PDF, PPT, DOC)
└── created_at

employees
├── employee_id
├── name, email, phone
├── designation, department
├── location, date_of_joining
└── is_active

batches
├── title, description
├── is_published, is_active
└── published_at

batch_employees (junction table)
├── batch_id → batches
└── employee_id → employees

batch_modules (junction table)
├── batch_id → batches
└── module_id → training_modules

employee_progress
├── employee_id → employees
├── batch_id → batches
├── module_id → training_modules
├── status (not_started, in_progress, completed)
└── progress_percentage
```

## Environment Variables

Already configured in `.env`:
```
VITE_SUPABASE_URL=https://hddicrovxlqlwdoncdrn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom slate theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Icons**: Lucide React
- **File Uploads**: Local handling with URL storage

## Security Features

- Row Level Security (RLS) enabled on all tables
- Authenticated user policies
- Secure password authentication
- Protected API endpoints
- Data validation on all forms
- Cascade deletes for data integrity

## Workflow Example

1. **Admin signs in**
2. **Adds training modules** (or uses sample data)
3. **Imports employees via CSV** (or uses sample data)
4. **Creates a batch** (e.g., "Q1 2024 Leadership Training")
5. **Adds employees** to batch (filtered by designation: "Manager")
6. **Assigns modules** to batch (e.g., "Team Communication", "Feedback Techniques")
7. **Publishes batch** - employees can now access training
8. **Views reports** to track completion and progress

## Troubleshooting

**Issue:** No training modules showing
- **Solution:** Run the simplified migration to insert sample data

**Issue:** Designations dropdown is empty when adding modules
- **Solution:** Add employees first (they provide the designation options)

**Issue:** Can't publish batch
- **Solution:** Ensure both employees and modules are assigned to the batch

**Issue:** Authentication errors
- **Solution:** Verify Supabase credentials in `.env` file

## Support

For issues:
1. Check browser console for errors
2. Verify migration ran successfully in Supabase
3. Ensure sample data was inserted
4. Check authentication is working

## Next Steps

After setup:
1. Explore the sample data
2. Create your first custom training module
3. Import your organization's employees
4. Create and publish a batch
5. Monitor progress through reports
