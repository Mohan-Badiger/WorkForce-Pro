# WorkForce Pro: Dashboard & Screen Wireframes

This document provides ASCII wireframes and design architectures for the main UI components of **WorkForce Pro**. The application features a clean, professional, card-based interface similar to modern ERPs (Zoho, Monday.com, Tally).

---

## 1. Application Layout (Professional Sidebar)

All screens (except authentication) share a responsive layout containing a persistent sidebar on desktop and a top collapsible drawer on mobile.

```
+-----------------------------------------------------------------------------+
|  [W] WorkForce Pro  |  Active Project: Downtown Residency v | Profile (Adm) |
+---------------------+---------------------------------------+---------------+
| (Nav)               |                                                       |
| [o] Dashboard       |  Dashboard / Overview                                 |
| [o] Workers         |  +-------------------------------------------------+  |
| [o] Attendance      |  | Total Workers  | Present Today  | Active Projects |  |
| [o] Payroll         |  |      42        |      38        |        3        |  |
| [o] Advances        |  +-------------------------------------------------+  |
| [o] Expenses        |                                                       |
| [o] Projects        |  +-----------------------+ +-----------------------+  |
| [o] Reports         |  | Weekly Wage Trend     | | Revenue vs Expenses   |  |
|                     |  |  (Recharts AreaChart) | | (Recharts BarChart)   |  |
| [o] Settings        |  |                       | |                       |  |
|                     |  +-----------------------+ +-----------------------+  |
|                     |                                                       |
| [<-] Log Out        |  Pending Payroll: Rs. 42,800  [Settle Salaries Button]|
+---------------------+-------------------------------------------------------+
```

---

## 2. Worker Management & Profile view

Provides search, filters, and list views. Clicking on any worker triggers the details drawer or profile view containing the transaction passbook.

```
+-----------------------------------------------------------------------------+
| Workers / Profiles                                     [+ Add New Worker]   |
+-----------------------------------------------------------------------------+
| [ Search worker...     ]  Filter: [ Role: All v ]  Status: [ Active v ]     |
+-----------------------------------------------------------------------------+
| Name            | Role        | Daily Wage | Attendance % | Ledger Balance  |
+-----------------+-------------+------------+--------------+-----------------+
| Ramesh Kumar    | Mason       | Rs. 650    | 94%          | Rs. +4,550 (Owe)|
| Suresh Singh    | Carpenter   | Rs. 700    | 88%          | Rs. -1,200 (Adv)|
| Amit Sharma     | Helper      | Rs. 450    | 100%         | Rs. 0           |
+-----------------------------------------------------------------------------+

             [ Worker Details Drawer - Ramesh Kumar ]
+-----------------------------------------------------------------------------+
| [Photo] Ramesh Kumar                                                        |
| Role: Mason | Wage: Rs. 650/day | Phone: 9876543210                         |
+-----------------------------------------------------------------------------+
| STATS:                                                                      |
| Total Worked: 24 Days | Total Earnings: Rs. 15,600 | Advances: Rs. 1,500    |
| Total Paid: Rs. 9,550 | Outstanding Balance: Rs. +4,550 (Owed to Worker)    |
+-----------------------------------------------------------------------------+
| PASSBOOK LEDGER:                                                            |
| Date        | Transaction Description       | Credit   | Debit   | Balance  |
| 2026-06-12  | Attendance Earnings (Mason)   | Rs. 650  | --      | Rs. 4550 |
| 2026-06-11  | Advance Payment (Cash)        | --       | Rs. 1000| Rs. 3900 |
| 2026-06-11  | Attendance Earnings (Mason)   | Rs. 650  | --      | Rs. 4900 |
+-----------------------------------------------------------------------------+
```

---

## 3. Daily Attendance Screen

Supervisors and Contractors can mark daily attendance. The system displays a list of active workers assigned to the selected project.

```
+-----------------------------------------------------------------------------+
| Daily Attendance Entry                                                      |
+-----------------------------------------------------------------------------+
| Select Project: [ Downtown Residency v ]  Date: [ 2026-06-13 v ]             |
+-----------------------------------------------------------------------------+
| Worker Name        | Role       | Daily Wage  | Attendance Status           |
+--------------------+------------+-------------+-----------------------------+
| Ramesh Kumar       | Mason      | Rs. 650     | (X) Present ( ) Absent ( ) H|
| Suresh Singh       | Carpenter  | Rs. 700     | ( ) Present (X) Absent ( ) H|
| Amit Sharma        | Helper     | Rs. 450     | (X) Present ( ) Absent ( ) H|
+--------------------+------------+-------------+-----------------------------+
| Notes: [ Logs entered by Supervisor Suresh...                             ] |
+-----------------------------------------------------------------------------+
|                                                   [ SAVE DAILY ATTENDANCE ] |
+-----------------------------------------------------------------------------+
```

---

## 4. Project Profitability Screen

This dashboard lets contractors review the financial performance of each individual project to check cost metrics instantly.

```
+-----------------------------------------------------------------------------+
| Project Metrics: Downtown Residency                     Status: [ Active  ] |
+-----------------------------------------------------------------------------+
| Contract Value: Rs. 2,500,000 | Total Costs: Rs. 1,149,400                  |
| NET PROFIT:     Rs. 1,350,600 | Margin: 54.02%                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|  COST DISTRIBUTION                                                          |
|  +-----------------------------------------------------------------------+  |
|  | [===========] Material Cost (74%) Rs. 850,000                         |  |
|  | [==] Labor/Worker Cost (11%) Rs. 128,400                              |  |
|  | [=] Equipment Hire (8%) Rs. 95,000                                    |  |
|  | [.] Transport & Fuel (4%) Rs. 42,000                                  |  |
|  | [.] Food & Miscellaneous (3%) Rs. 34,000                              |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
| [ Assign Workers ]  [ Add Project Expense ]  [ Download Profit Report (PDF) ]|
+-----------------------------------------------------------------------------+
```
These wireframe blueprints align with Tailwind CSS grid systems and Shadcn UI tables/cards to produce a high-fidelity visual layout.
