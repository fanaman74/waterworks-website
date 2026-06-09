# Waterworks CRM Backend Design Spec

**Date:** 2026-06-09  
**Author:** Antigravity AI  
**Status:** Approved  

---

## 1. Goal & Requirements
The goal is to implement a secure, lightweight Customer Relationship Management (CRM) admin portal for Wayne Pettit (the plumber) to manage client contact submissions (quotes/leads).

### Key Features
1. **API Server:** A lightweight backend using Node.js/Express.
2. **Database:** JSON-based local database (`db.json`) for persistence, easy data-entry inspection, and backups.
3. **Leads Capture:** Connect the existing public Contact form to the real API backend.
4. **CRM Portal:** A hidden administrative route in the React app (`#admin`) secured by a simple password login screen.
5. **Dashboard Features:**
   * View all incoming leads, ordered by date (newest first).
   * Search client details (Name, Email, Address, Message).
   * Filter leads by Status (All, New, Contacted, Quote Sent, Scheduled, Completed).
   * Detailed view for each client including click-to-call/email options.
   * Update lead Status and write/save internal admin Notes.
   * Permanent Delete/Archive button to clean up leads.

---

## 2. Architecture & File Structure

### File Mapping
* **`server.js`** [NEW]: Express API server.
* **`db.json`** [NEW]: JSON storage initialized with sample leads.
* **`src/pages/AdminCRM.jsx`** [NEW]: React component for Login + CRM Admin Dashboard.
* **`package.json`** [MODIFY]: Add dependencies (`express`, `cors`) and dev dependencies (`concurrently`), add/modify start scripts.
* **`vite.config.js`** [MODIFY]: Configure proxy server to forward `/api` requests to port 3001.
* **`src/App.jsx`** [MODIFY]: Add route matching for `#admin`.
* **`src/pages/InnerPages.jsx`** [MODIFY]: Connect the `Contact` component to submit POST requests to `/api/leads`.

---

## 3. API Specification & Security

### Authentication Flow
* Authentication uses a basic token verification protocol.
* **Default Password:** `admin123` (overrideable via `CRM_PASSWORD` environment variable).
* `POST /api/login` verifies the password and returns a session token. The server stores active tokens in memory.
* All admin endpoints require a header: `Authorization: Bearer <token>`.
* The frontend stores this token in `sessionStorage` (cleared on browser/tab close).

### Endpoints

#### `POST /api/login` (Public)
* **Description:** Verifies password and returns a session token.
* **Request:** `{ "password": "..." }`
* **Response (Success):** `200 OK` with `{ "token": "..." }`
* **Response (Error):** `401 Unauthorized` with `{ "error": "Invalid password" }`

#### `POST /api/leads` (Public)
* **Description:** Form submission from client contact page.
* **Request:** `{ "name": "...", "email": "...", "phone": "...", "address": "...", "message": "...", "serviceType": "..." }`
* **Action:** 
  1. Validates required fields (`name`, `email`).
  2. Generates a unique UUID/ID.
  3. Appends timestamp (`date: ISO String`), default `status: "New"`, and empty `notes: ""`.
  4. Appends to `db.json`.
* **Response:** `201 Created` with `{ "success": true, "lead": { ... } }`

#### `GET /api/leads` (Secured)
* **Description:** Returns all leads sorted by date (newest first).
* **Response:** `200 OK` with `[ { lead }, { lead } ]`

#### `PATCH /api/leads/:id` (Secured)
* **Description:** Updates status or notes for a lead.
* **Request:** `{ "status": "...", "notes": "..." }` (both optional)
* **Response:** `200 OK` with updated lead object.

#### `DELETE /api/leads/:id` (Secured)
* **Description:** Deletes a lead permanently.
* **Response:** `200 OK` with `{ "success": true }`

---

## 4. UI/UX Design (Frontend Admin Dashboard)

### Login View
A centered card styled in the active palette (e.g. Tide's fresh teals/blues) with a password input, submit button, and status indicator.

### Dashboard Layout
* **Header:** Title ("Waterworks CRM"), Lead stats counters (Total/New), and "Log Out" button.
* **Control Bar:** Text input for real-time search, status tabs/chips showing the count of leads in each stage.
* **Work Area (Two Columns on Desktop):**
  * **Left (Leads List):** Vertical scroll of matching leads.
    * Each card has: Name, Service type icon, Timestamp, and color-coded status badge:
      * `New` — Crimson Red / Coral
      * `Contacted` — Ocean Blue
      * `Quote Sent` — Deep Purple
      * `Scheduled` — Amber Orange
      * `Completed` — Emerald Green
  * **Right (Detail Panel):** Displays details of the selected lead:
    * Quick Contact Buttons (Phone and Email links).
    * Address and Message details.
    * Status dropdown allowing instant updates.
    * Notes text area with an auto-save / save notes action.
    * "Delete Lead" button with a confirmation popup.

---

## 5. Verification Plan
* **API Testing:** Verify all endpoints (login, GET, POST, PATCH, DELETE) using local HTTP tests.
* **Integration Testing:**
  1. Submit a lead from the Contact page and verify it appears in `db.json` and in the Admin CRM panel.
  2. Verify login protection restricts access and log out works.
  3. Verify searching, filtering, status updating, saving notes, and deleting leads.
