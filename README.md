### E-Checkup Development Guide

*Final, comprehensive blueprint for frontend + backend teams*

---

## 1. Project Overview & User Journeys

A LIC case-management platform with three case types (VMER, Online, DC Visit). Key flows:

**Note:** VMER and Online cases follow identical workflows - both are consultation-based without physical visits.

1. **Authentication**

1. Login → OTP generation (`user-api/create_otp/`) → OTP verification (`user-api/check_otp/`) → Dashboard
2. Profile view/update (`user-api/me/`, `user-api/update_profile/`)
3. Logout (`user-api/logout/`)



2. **Case Lifecycle**

1. **Creation** (Manager/Asst Manager)

1. Page: `/case/create`
2. APIs:

1. `user-api/list_coordinators/` (GET)
2. `user-api/list_lic_agents/` (GET)
3. `user-api/list_diagnostic_centers/` (GET) - *New for DC cases*
4. `lic-hierarchy-api/list/` (GET)
5. `case-api/create_case/` (POST) - *Enhanced with case_type validation*
6. `case-api/get_case_type_requirements/` (GET) - *New: type-specific requirements*






2. **Assignment Notification**: `case-api/send_assignment_notification/` (POST)
3. **Scheduling** (Tele Caller)

1. Page: `/case/{id}/schedule`
2. APIs:

1. `case-api/get_appointment/` (GET)
2. `case-api/create_appointment/` (POST) - *Enhanced for case type handling*
3. `case-api/reschedule_appointment/` (PATCH)
4. `case-api/send_schedule_notification/` (POST)
5. `case-api/get_available_slots/` (GET) - *New: type-specific slot availability*






4. **Upload & Documentation** (Coordinator/DC)

1. Page: `/case/{id}/upload`
2. APIs:

1. `case-api/upload_file/` (POST) - *Enhanced with type-specific validation*
2. `case-api/list_uploads/` (GET)
3. `case-api/categorize_document/` (POST) - *New: auto-categorization*
4. `case-api/validate_upload_requirements/` (GET) - *New: check completion*






5. **Status & History**

1. Page: `/case/{id}`
2. APIs:

1. `case-api/get_case/` (GET) - *Enhanced with case type details*
2. `case-api/get_history/` (GET)
3. `case-api/update_status/` (PATCH) - *Enhanced with type-specific validations*
4. `case-api/send_status_notification/` (POST)
5. `case-api/get_case_summary/` (GET) - *New: comprehensive case overview*






6. **Closure**: final status → `sent_to_lic` or `closed`



3. **Finance & Invoicing**

1. **Invoices List** (Admin/Finance)

1. Page: `/finance/invoices`
2. APIs:

1. `finance-api/list_invoices/` (GET)
2. `finance-api/generate_invoice/` (POST) - *Enhanced for DC payouts*
3. `finance-api/update_invoice_status/` (PATCH)
4. `finance-api/download_invoice/` (GET)
5. `finance-api/calculate_dc_payout/` (POST) - *New: DC-specific calculations*
6. `finance-api/process_bulk_payments/` (POST) - *New: bulk payment processing*









4. **Reporting**

1. Page: `/reports`
2. APIs:

1. `report-api/case_summary/` (GET) - *Enhanced with case type breakdown*
2. `report-api/lic_wise/` (GET)
3. `report-api/turnaround_time/` (GET) - *Enhanced with type-specific metrics*
4. `report-api/finance_summary/` (GET)
5. `report-api/case_type_analytics/` (GET) - *New: VMER vs Online vs DC metrics*
6. `report-api/dc_performance/` (GET) - *New: DC-wise performance tracking*








---

## 2. Full Application Flow (By User Role)

### 1. **Admin / HOD**

- Login → Dashboard
- User Management
- View All Cases (all types)
- View Reports & Analytics (type-wise breakdown)
- Generate & Track Invoices (including DC payouts)
- View Audit Logs


### 2. **Manager / Assistant Manager**

- Login → Dashboard
- Create Case (VMER / Online / DC Visit)
- Assign Coordinator
- Track Cases (type-specific views)


### 3. **Coordinator**

- Login → Dashboard
- View Assigned Cases (filtered by type)
- Track Status
- Upload Reports/Documents (type-specific requirements)
- Mark Case as Sent to LIC


### 4. **Tele Caller**

- Login → Dashboard
- View Unscheduled Cases (all types)
- Schedule VMER/Online/DC appointments
- Reschedule if needed
- Trigger Notifications


### 5. **DC (Diagnostic Center)**

- Login → Dashboard
- View Scheduled DC Visit Appointments
- Upload Reports Post Checkup
- Track Payout Status
- View Payment History


### 6. **LIC Users (Agent → HO)**

- Login → Dashboard
- View Cases as per hierarchy (all types)
- Track progress, view uploads
- Generate LIC-specific reports


### 7. **Shared/Common Flow**

- Login
- Profile Settings
- Notifications
- Logout


---

## 3. Django Apps & Models

### 3.1 userdetail App

**Purpose:** Authentication, OTP, user & LIC hierarchy management

**Models:**

- **User** (extends AbstractUser)
- **OTP**
- **LICHierarchy**
- **DiagnosticCenter** - *New: DC partner management*


**Key APIs:** `user-api/*`, `lic-hierarchy-api/list/`

### 3.2 case App

**Purpose:** Case records, stakeholders, scheduling, uploads, history, notifications

**Models:**

- **Case** - *Enhanced with case_type field and type-specific validations*
- **CaseStakeholder**
- **CaseAppointment** - *Enhanced with type-specific scheduling*
- **CaseUpload** - *Enhanced with document categorization*
- **CaseHistory**
- **NotificationLog**
- **DocumentCategory** - *New: categorize uploads by type*
- **CaseTypeRequirement** - *New: define requirements per case type*


**Key APIs:** `case-api/*`

### 3.3 finance App

**Purpose:** Invoice and payment management

**Models:**

- **Invoice** - *Enhanced with case type considerations*
- **InvoiceItem**
- **DCPayout** - *New: track DC payments*
- **PaymentTransaction** - *New: payment tracking*


**Key APIs:** `finance-api/*`

### 3.4 report App

**Purpose:** Aggregated data endpoints

**Key APIs:** `report-api/*` - *Enhanced with case type analytics*

### 3.5 frontend App

**Purpose:** Serve HTML templates; JS modules call APIs

**Templates & Views:** login, dashboard, case_create, case_detail, schedule, upload, invoices, reports, user_mgmt, profile, logout

### 3.6 common App

**Purpose:** Shared utilities

- **decorators.py**: authentication, exception handling
- **notification.py**: send_email/sms/push
- **constants.py**: enums (including CASE_TYPES)
- **utils.py**
- **validators.py** - *New: case type-specific validations*


---

## 4. Frontend Page + API Matrix (By Role)

### 4.1 Common Screens (7)

| Page | Path | APIs
|-----|-----|-----
| Login | `/login` | `user-api/is_logged_in/`, `user-api/create_otp/`, `user-api/check_otp/`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`
| Notifications Bell | Header widget | `case-api/unread_notifications/`
| Logout | `/logout` | `user-api/logout/`
| Dashboard Common | `/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `report-api/case_type_analytics/`
| Calendar Popup | shared modal | `case-api/get_appointment/`, `case-api/get_available_slots/`
| Error Modal | global | Display error from any API response


### 4.2 Admin Screens (10)

| Page | Path | APIs
|-----|-----|-----
| Admin Dashboard | `/admin/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `report-api/finance_summary/`, `report-api/case_type_analytics/`
| User Management | `/admin/users` | `user-api/list_users/`, `user-api/create_user/`, `user-api/update_user/`, `lic-hierarchy-api/list/`
| DC Management | `/admin/diagnostic_centers` | `user-api/list_diagnostic_centers/`, `user-api/create_dc/`, `user-api/update_dc/`
| Case Overview | `/admin/cases` | `case-api/list_cases/?all=true`, `case-api/get_case_type_requirements/`
| Case Detail (Admin) | `/admin/case/{id}` | `case-api/get_case/`, `case-api/get_history/`, `case-api/list_uploads/`, `case-api/get_appointment/`, `case-api/get_case_summary/`
| Invoice Management | `/admin/invoices` | `finance-api/list_invoices/`, `finance-api/download_invoice/`, `finance-api/update_invoice_status/`, `finance-api/calculate_dc_payout/`
| Reports Dashboard | `/admin/reports` | `report-api/case_summary/`, `report-api/lic_wise/`, `report-api/turnaround_time/`, `report-api/case_type_analytics/`, `report-api/dc_performance/`
| Audit Logs | `/admin/audit_logs` | `case-api/get_history/?module=audit`
| System Settings | `/admin/settings` | `common-api/list_notification_templates/`, `common-api/update_template/`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


### 4.3 HOD Screens (9)

| Page | Path | APIs
|-----|-----|-----
| HOD Dashboard | `/hod/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `report-api/case_type_analytics/`
| Department Cases | `/hod/cases` | `case-api/list_cases/?department=true`, `case-api/get_case_type_requirements/`
| Case Detail (HOD) | `/hod/case/{id}` | `case-api/get_case/`, `case-api/get_history/`, `case-api/list_uploads/`, `case-api/get_case_summary/`
| Team Performance | `/hod/team` | `user-api/list_team_members/`, `report-api/team_performance/`
| Department Reports | `/hod/reports` | `report-api/case_summary/`, `report-api/turnaround_time/`, `report-api/case_type_analytics/`
| Invoice Overview | `/hod/invoices` | `finance-api/list_invoices/?department=true`
| Case Assignment | `/hod/assignments` | `case-api/list_unassigned/`, `case-api/assign_case/`
| Quality Review | `/hod/quality` | `case-api/list_for_review/`, `case-api/approve_case/`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


### 4.4 Manager Screens (10)

| Page | Path | APIs
|-----|-----|-----
| Manager Dashboard | `/manager/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `report-api/case_type_analytics/`
| Create Case | `/manager/case/create` | `user-api/list_coordinators/`, `user-api/list_lic_agents/`, `user-api/list_diagnostic_centers/`, `lic-hierarchy-api/list/`, `case-api/create_case/`, `case-api/get_case_type_requirements/`
| My Cases | `/manager/cases` | `case-api/list_cases/?created_by=me`, `case-api/get_case_type_requirements/`
| Case Detail | `/manager/case/{id}` | `case-api/get_case/`, `case-api/get_history/`, `case-api/list_uploads/`, `case-api/get_case_summary/`
| Case Assignment | `/manager/assign` | `case-api/list_unassigned/`, `case-api/assign_case/`, `user-api/list_coordinators/`
| Team Cases | `/manager/team_cases` | `case-api/list_cases/?team=true`
| Performance Reports | `/manager/reports` | `report-api/case_summary/`, `report-api/turnaround_time/`, `report-api/case_type_analytics/`
| Case Templates | `/manager/templates` | `case-api/list_templates/`, `case-api/create_template/`
| Bulk Operations | `/manager/bulk` | `case-api/bulk_assign/`, `case-api/bulk_update_status/`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


### 4.5 Assistant Manager Screens (10)

| Page | Path | APIs
|-----|-----|-----
| Asst Manager Dashboard | `/asst_manager/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `report-api/case_type_analytics/`
| Create Case | `/asst_manager/case/create` | `user-api/list_coordinators/`, `user-api/list_lic_agents/`, `user-api/list_diagnostic_centers/`, `lic-hierarchy-api/list/`, `case-api/create_case/`, `case-api/get_case_type_requirements/`
| My Cases | `/asst_manager/cases` | `case-api/list_cases/?created_by=me`, `case-api/get_case_type_requirements/`
| Case Detail | `/asst_manager/case/{id}` | `case-api/get_case/`, `case-api/get_history/`, `case-api/list_uploads/`, `case-api/get_case_summary/`
| Case Assignment | `/asst_manager/assign` | `case-api/list_unassigned/`, `case-api/assign_case/`, `user-api/list_coordinators/`
| Support Cases | `/asst_manager/support` | `case-api/list_cases/?support=true`
| Daily Reports | `/asst_manager/reports` | `report-api/case_summary/`, `report-api/turnaround_time/`, `report-api/case_type_analytics/`
| Case Review | `/asst_manager/review` | `case-api/list_for_review/`, `case-api/review_case/`
| Quick Actions | `/asst_manager/quick` | `case-api/quick_assign/`, `case-api/quick_update/`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


### 4.6 Coordinator Screens (11)

| Page | Path | APIs
|-----|-----|-----
| Coordinator Dashboard | `/coordinator/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `case-api/list_cases/?assigned_to=me&status=active`
| Assigned Cases | `/coordinator/cases` | `case-api/list_cases/?assigned_to=me`, `case-api/get_case_type_requirements/`
| Case Detail | `/coordinator/case/{id}` | `case-api/get_case/`, `case-api/get_history/`, `case-api/list_uploads/`, `case-api/get_case_summary/`
| Upload Documents | `/coordinator/case/{id}/upload` | `case-api/upload_file/`, `case-api/list_uploads/`, `case-api/categorize_document/`, `case-api/validate_upload_requirements/`
| Case Status Update | `/coordinator/case/{id}/status` | `case-api/update_status/`, `case-api/send_status_notification/`
| Document Management | `/coordinator/documents` | `case-api/list_uploads/?coordinator=me`, `case-api/categorize_document/`
| Pending Tasks | `/coordinator/tasks` | `case-api/list_pending_tasks/`, `case-api/complete_task/`
| Case History | `/coordinator/case/{id}/history` | `case-api/get_history/`, `case-api/add_note/`
| Send to LIC | `/coordinator/case/{id}/send_lic` | `case-api/send_to_lic/`, `case-api/validate_completion/`
| My Performance | `/coordinator/performance` | `report-api/coordinator_performance/`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


### 4.7 Tele Caller Screens (11)

| Page | Path | APIs
|-----|-----|-----
| Tele Caller Dashboard | `/tele_caller/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `case-api/list_cases/?status=unscheduled`
| Unscheduled Cases | `/tele_caller/unscheduled` | `case-api/list_cases/?status=unscheduled`, `case-api/get_case_type_requirements/`
| Schedule Appointment | `/tele_caller/case/{id}/schedule` | `case-api/get_appointment/`, `case-api/create_appointment/`, `case-api/get_available_slots/`
| Scheduled Cases | `/tele_caller/scheduled` | `case-api/list_cases/?status=scheduled`
| Reschedule | `/tele_caller/case/{id}/reschedule` | `case-api/reschedule_appointment/`, `case-api/get_available_slots/`
| Call Log | `/tele_caller/call_log` | `case-api/list_call_logs/`, `case-api/add_call_log/`
| Calendar View | `/tele_caller/calendar` | `case-api/get_appointment/`, `case-api/get_available_slots/`
| Send Notifications | `/tele_caller/notifications` | `case-api/send_schedule_notification/`, `case-api/send_reminder/`
| Case Communication | `/tele_caller/case/{id}/communicate` | `case-api/get_communication_history/`, `case-api/add_communication/`
| Daily Schedule | `/tele_caller/daily` | `case-api/get_daily_schedule/`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


### 4.8 DC (Diagnostic Center) Screens (11)

| Page | Path | APIs
|-----|-----|-----
| DC Dashboard | `/dc/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `case-api/list_cases/?dc=me&status=scheduled`
| Scheduled Appointments | `/dc/appointments` | `case-api/list_cases/?dc=me&status=scheduled`
| Case Detail | `/dc/case/{id}` | `case-api/get_case/`, `case-api/get_history/`, `case-api/list_uploads/`, `case-api/get_case_summary/`
| Upload Reports | `/dc/case/{id}/upload` | `case-api/upload_file/`, `case-api/list_uploads/`, `case-api/categorize_document/`, `case-api/validate_upload_requirements/`
| Completed Cases | `/dc/completed` | `case-api/list_cases/?dc=me&status=completed`
| Payment Status | `/dc/payments` | `finance-api/list_invoices/?dc=me`, `finance-api/calculate_dc_payout/`
| Payment History | `/dc/payment_history` | `finance-api/list_payments/?dc=me`
| Case Calendar | `/dc/calendar` | `case-api/get_appointment/?dc=me`
| Update Availability | `/dc/availability` | `user-api/update_dc_availability/`
| Performance Stats | `/dc/performance` | `report-api/dc_performance/?dc=me`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


### 4.9 LIC Users Screens (11) - Agent to HO

| Page | Path | APIs
|-----|-----|-----
| LIC Dashboard | `/lic/dashboard` | `user-api/me/`, `case-api/dashboard_summary/`, `lic-hierarchy-api/get_hierarchy/`
| My Cases | `/lic/cases` | `case-api/list_cases/?lic_hierarchy=me`, `case-api/get_case_type_requirements/`
| Case Detail | `/lic/case/{id}` | `case-api/get_case/`, `case-api/get_history/`, `case-api/list_uploads/`, `case-api/get_case_summary/`
| Hierarchy Cases | `/lic/hierarchy_cases` | `case-api/list_cases/?lic_hierarchy=subordinates`
| Case Progress | `/lic/case/{id}/progress` | `case-api/get_case/`, `case-api/get_history/`
| Download Documents | `/lic/case/{id}/documents` | `case-api/list_uploads/`, `case-api/download_document/`
| LIC Reports | `/lic/reports` | `report-api/lic_wise/`, `report-api/case_type_analytics/?lic=me`
| Case Search | `/lic/search` | `case-api/search_cases/`
| Notifications | `/lic/notifications` | `case-api/list_notifications/?lic=me`
| Agent Performance | `/lic/agent_performance` | `report-api/agent_performance/?hierarchy=me`
| Profile | `/profile` | `user-api/me/`, `user-api/update_profile/`


---

## 5. Case Type Specific Workflows

### 5.1 VMER Cases

- **Creation**: Standard case creation with VMER type selection
- **Scheduling**: Tele caller schedules consultation appointment
- **Execution**: Coordinator conducts consultation (external to app)
- **Upload**: Coordinator uploads consultation report/notes
- **Closure**: Mark as sent to LIC


### 5.2 Online Cases

- **Creation**: Standard case creation with Online type selection
- **Scheduling**: Tele caller schedules online consultation
- **Execution**: Coordinator conducts online consultation (external to app)
- **Upload**: Coordinator uploads consultation report/notes
- **Closure**: Mark as sent to LIC


### 5.3 DC Visit Cases

- **Creation**: Standard case creation with DC type selection + DC assignment
- **Scheduling**: Tele caller schedules DC appointment
- **Execution**: Policy holder visits DC for checkup
- **Upload**: DC uploads medical reports
- **Payment**: DC payout processing
- **Closure**: Mark as sent to LIC


---

## 6. Enhanced Models Structure

### 6.1 Case Model Updates

```python
class Case(models.Model):
    CASE_TYPES = [
        ('vmer', 'VMER'),
        ('online', 'Online'),
        ('dc-visit', 'DC Visit'),
    ]
    
    case_type = models.CharField(max_length=20, choices=CASE_TYPES)
    diagnostic_center = models.ForeignKey('userdetail.DiagnosticCenter', null=True, blank=True)
    # ... existing fields
```

### 6.2 New Models

```python
class DiagnosticCenter(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)

class DocumentCategory(models.Model):
    name = models.CharField(max_length=100)
    case_type = models.CharField(max_length=20, choices=Case.CASE_TYPES)
    is_required = models.BooleanField(default=False)

class CaseTypeRequirement(models.Model):
    case_type = models.CharField(max_length=20, choices=Case.CASE_TYPES)
    requirement_name = models.CharField(max_length=100)
    is_mandatory = models.BooleanField(default=True)
    description = models.TextField()

class DCPayout(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    diagnostic_center = models.ForeignKey(DiagnosticCenter, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='pending')
    processed_date = models.DateTimeField(null=True, blank=True)
```

---

## 7. Edge Cases & Permissions

- OTP expiry (10min), max 3 attempts
- Scheduling: block past dates, no overlap, case type-specific validation
- Uploads: type/size validation, case type-specific requirements
- Role-based access via `@check_authentication(role=...)`
- Case type-specific permissions (DC users only see DC cases)
- Consistent API response schema
- Document categorization validation
- DC payout calculation validation


---

## 8. Development Roadmap

1. **Sprint 1**: `userdetail` + auth flows + DiagnosticCenter model
2. **Sprint 2**: `case` CRUD + case types + uploads + type-specific validations
3. **Sprint 3**: Enhanced scheduling + document categorization + history logs
4. **Sprint 4**: `finance` invoices + DC payout system
5. **Sprint 5**: `report` dashboards + case type analytics
6. **Sprint 6**: Frontend integration + type-specific UI + styling


---

*Keep this document updated as the single source-of-truth throughout the project lifecycle.*