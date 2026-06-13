# WorkForce Pro: Role-Based Permission System

WorkForce Pro implements a strict Role-Based Access Control (RBAC) structure. It ensures data isolation, secure mutations, and client-side view-trimming.

---

## 1. Permission Matrix

Below is the exhaustive mapping of system roles to specific functional capabilities:

| Module | Action | Admin / Contractor | Accountant | Supervisor |
| :--- | :--- | :---: | :---: | :---: |
| **Workers** | Create Worker | ✅ | ❌ | ❌ |
| | Edit Worker Profile | ✅ | ❌ | ❌ |
| | View Worker Profiles | ✅ | ✅ | ✅ |
| | Delete Worker | ✅ | ❌ | ❌ |
| **Attendance** | Mark Daily Attendance | ✅ | ❌ | ✅ |
| | View Attendance Logs | ✅ | ✅ | ✅ |
| | Edit Historical Logs | ✅ | ❌ | ❌ |
| **Advances** | Issue Advance Payment | ✅ | ❌ | ❌ |
| | View Advance Logs | ✅ | ✅ | ❌ |
| **Payroll** | View Pay Runs / Forecast | ✅ | ✅ | ❌ |
| | Process Salary Settlement | ✅ | ✅ | ❌ |
| | Edit / Delete Settlements | ✅ | ❌ | ❌ |
| **Projects** | Create / Edit Projects | ✅ | ❌ | ❌ |
| | View Project Finance Metrics| ✅ | ✅ | ❌ |
| | Assign Workers to Projects | ✅ | ❌ | ❌ |
| **Expenses** | Log Expenses | ✅ | ✅ | ❌ |
| | Edit / Delete Expenses | ✅ | ✅ | ❌ |
| **Reports** | Download Financial Reports | ✅ | ✅ | ❌ |
| | Download Attendance Reports| ✅ | ✅ | ✅ |

---

## 2. Next.js Route Guards (Edge Middleware)

The application intercepts routing decisions in Next.js middleware by querying the user session object before loading pages.

```javascript
// middleware.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // 1. Redirect unauthenticated users to login
  if (!isLoggedIn && nextUrl.pathname !== "/login" && nextUrl.pathname !== "/register") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. Prevent Supervisors from viewing payroll or expenses
  if (isLoggedIn && userRole === "supervisor") {
    const isProhibitedPath = 
      nextUrl.pathname.startsWith("/payroll") || 
      nextUrl.pathname.startsWith("/expenses") ||
      nextUrl.pathname.startsWith("/projects/finance");
      
    if (isProhibitedPath) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // 3. Prevent Accountants from doing administrative actions
  if (isLoggedIn && userRole === "accountant") {
    const isProhibitedPath = 
      nextUrl.pathname.startsWith("/settings/billing") ||
      (nextUrl.pathname.startsWith("/workers") && nextUrl.searchParams.get("action") === "create");
      
    if (isProhibitedPath) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 3. Server Actions & API Guards

Since client-side routing checks can be bypassed, all backend mutation gates must explicitly evaluate authorization.

### Server Action Guard Example
```javascript
// app/actions/workerActions.js
"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import Worker from "@/models/Worker";

export async function createWorker(formData) {
  // 1. Get authenticated session
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized access. Please log in.");
  }

  // 2. Validate Role (Must be contractor/admin to create workers)
  if (session.user.role !== "contractor") {
    throw new Error("Forbidden. Only contractors can create new workers.");
  }

  // 3. Fetch Tenant ID from session
  const tenantId = session.user.tenantId;

  await dbConnect();

  // 4. Create worker scoped strictly to Contractor's Tenant
  const newWorker = await Worker.create({
    ...formData,
    tenantId,
  });

  return { success: true, id: newWorker._id.toString() };
}
```
Using this multi-layered approach, WorkForce Pro prevents security escalation, ensuring high compliance and trust.
