# WorkForce Pro: API Route Structure

All endpoints are hosted as Next.js Route Handlers. They enforce multi-tenancy by extracting user session contexts from Auth.js middleware.

---

## 1. Authentication Endpoints

* **`POST /api/auth/register`**
  * **Description:** Register a new Tenant (Contractor Company) and the initial Contractor (Admin) account.
  * **Request Body:**
    ```json
    {
      "companyName": "Alpha Construction Ltd",
      "adminName": "John Doe",
      "email": "john@alphaconstruction.com",
      "password": "SecurePassword123"
    }
    ```
  * **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Tenant and administrator registered successfully."
    }
    ```

---

## 2. Worker Management API

* **`GET /api/workers`**
  * **Description:** Retrieve list of workers. Supplying `search` filters by name/role. Supplying `status` filters by active/inactive.
  * **Query Parameters:** `search`, `status`, `page`, `limit`
  * **Response (200 OK):**
    ```json
    {
      "workers": [
        {
          "_id": "603d...12",
          "name": "Ramesh Kumar",
          "photo": "https://res.cloudinary.com/...",
          "mobileNumber": "+919876543210",
          "role": "Mason",
          "dailyWage": 650,
          "status": "active"
        }
      ],
      "pagination": { "total": 24, "pages": 3, "currentPage": 1 }
    }
    ```

* **`POST /api/workers`**
  * **Description:** Add a new worker to the tenant database.
  * **Request Body:**
    ```json
    {
      "name": "Ramesh Kumar",
      "photo": "https://res.cloudinary.com/...",
      "mobileNumber": "9876543210",
      "address": "12, Central Street, Sector 4, Bangalore",
      "role": "Mason",
      "dailyWage": 650,
      "aadhaarNumber": "1234-5678-9012",
      "emergencyContact": {
        "name": "Sita Devi",
        "relationship": "Spouse",
        "phone": "9876543211"
      }
    }
    ```
  * **Response (201 Created):**
    ```json
    {
      "success": true,
      "workerId": "603d...12"
    }
    ```

* **`PUT /api/workers/[id]`**
  * **Description:** Update worker profile.
  * **Response (200 OK):** `{ "success": true }`

* **`DELETE /api/workers/[id]`**
  * **Description:** Soft-delete or archive a worker by marking them `inactive` or removing records if no ledger transactions exist.
  * **Response (200 OK / 400 Bad Request):** `{ "success": true }`

---

## 3. Attendance API

* **`POST /api/attendance`**
  * **Description:** Save daily attendance log for multiple workers. (Bulk one-click save).
  * **Request Body:**
    ```json
    {
      "date": "2026-06-13T00:00:00.000Z",
      "projectId": "603c...01",
      "records": [
        { "workerId": "603d...12", "status": "present", "notes": "On time" },
        { "workerId": "603d...13", "status": "half-day", "notes": "Left after lunch" },
        { "workerId": "603d...14", "status": "absent" }
      ]
    }
    ```
  * **Response (200 OK):**
    ```json
    {
      "success": true,
      "recordsUpdated": 3
    }
    ```

* **`GET /api/attendance`**
  * **Description:** Get attendance history by date range or specific worker.
  * **Query Parameters:** `startDate`, `endDate`, `workerId`, `projectId`

---

## 4. Advance Payment API

* **`POST /api/advances`**
  * **Description:** Issue advance money to a worker. This updates the ledger instantly.
  * **Request Body:**
    ```json
    {
      "workerId": "603d...12",
      "amount": 1500,
      "date": "2026-06-13T10:30:00.000Z",
      "notes": "Paid in cash for family medical emergency"
    }
    ```
  * **Response (201 Created):**
    ```json
    {
      "success": true,
      "advanceId": "603e...04",
      "newOutstandingBalance": -1500
    }
    ```

---

## 5. Payroll & Salary Settlements API

* **`GET /api/payroll/calculate`**
  * **Description:** Preview payroll numbers for a given period before making payments. Calculates days worked, gross wages, outstanding advances, and net pending salary.
  * **Query Parameters:** `workerId`, `periodStart`, `periodEnd`
  * **Response (200 OK):**
    ```json
    {
      "workerId": "603d...12",
      "dailyWage": 650,
      "presentDays": 12,
      "halfDays": 2,
      "daysWorked": 13,
      "grossEarnings": 8450,
      "outstandingAdvance": 1500,
      "pendingSalary": 6950
    }
    ```

* **`POST /api/payroll/settle`**
  * **Description:** Settle outstanding wages, deduct advances, write payment ledger transaction.
  * **Request Body:**
    ```json
    {
      "workerId": "603d...12",
      "periodStart": "2026-06-01T00:00:00.000Z",
      "periodEnd": "2026-06-13T00:00:00.000Z",
      "grossEarnings": 8450,
      "advanceDeductions": 1500,
      "netAmountPaid": 6950,
      "paymentMethod": "UPI",
      "transactionReference": "UTR1290382903"
    }
    ```
  * **Response (200 OK):**
    ```json
    {
      "success": true,
      "payrollId": "603f...99"
    }
    ```

---

## 6. Project & Expense Management API

* **`POST /api/projects`**
  * **Description:** Create a new project.
  * **Response (201 Created):** `{ "success": true, "projectId": "..." }`

* **`POST /api/expenses`**
  * **Description:** Add operational or project expense.
  * **Request Body:**
    ```json
    {
      "projectId": "603c...01",
      "category": "Material",
      "amount": 28400,
      "date": "2026-06-13T00:00:00.000Z",
      "notes": "Cement bags delivery (40 bags)",
      "receiptUrl": "https://res.cloudinary.com/..."
    }
    ```
  * **Response (201 Created):** `{ "success": true, "expenseId": "..." }`

* **`GET /api/projects/[id]/profitability`**
  * **Description:** Compute real-time profit for a project.
  * **Response (200 OK):**
    ```json
    {
      "projectId": "603c...01",
      "projectName": "Downtown Residency",
      "projectValue": 2500000,
      "costs": {
        "laborCost": 128400,
        "materialCost": 850000,
        "transportCost": 42000,
        "foodCost": 12000,
        "equipmentCost": 95000,
        "miscellaneousCost": 22000,
        "totalCost": 1149400
      },
      "netProfit": 1350600,
      "profitMarginPercentage": 54.02
    }
    ```

---

## 7. PDF Report Generation API

* **`GET /api/reports`**
  * **Description:** Generates custom downloadable PDF reports dynamically.
  * **Query Parameters:** `type` (attendance | payroll | advance | expense | project-profit), `startDate`, `endDate`, `projectId`, `workerId`
  * **Response:** Returns `application/pdf` binary stream for standard browser saving or printing.
