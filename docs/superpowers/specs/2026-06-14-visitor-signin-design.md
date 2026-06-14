# Visitor Sign In Design Spec

**Date:** 2026-06-14  
**Author:** Antigravity AI  
**Status:** Approved  

---

## 1. Requirements & User Experience

Wayne wants to allow visitors to log into the WaterWorks plumbing website. A "Sign In" CTA will be added to the navigation bar.

### User Flow
1. **Trigger:** A visitor clicks the "Sign In" button in the sticky header or the mobile navigation sheet.
2. **Authentication Options:** A modal popup appears, offering:
   - **Google Sign In:** Opens a mock Google Login popup. Users select or input a test name/email to instantly log in.
   - **Email Sign In:** Users enter their email and click "Send Verification Code".
3. **Email OTP Delivery (Resend):** The backend generates a 6-digit verification code, stores it in memory, and emails it to the user using the Resend API.
4. **Verification:** The modal transitions to a verification form. Once the user types the code and clicks "Verify", they are logged in.
5. **Logged In State:** The header updates to show "Hi, [Name]" and a "Log out" button.
6. **Persistence:** The session is saved in the browser's `localStorage` and remains active after refreshing the page.

---

## 2. Architecture & File Structure

### File Mapping
* **`public/mock-google-login.html`** [NEW]: Mimics Google's login interface and uses `window.opener.postMessage` to send auth payloads.
* **`src/components/VisitorAuthModal.jsx`** [NEW]: React component for the `<dialog>` visitor authentication portal.
* **`src/components/Shared.jsx`** [MODIFY]: Add "Sign In" button and logged-in visitor indicator to the `Header` component.
* **`src/App.jsx`** [MODIFY]: Add persistent visitor authentication state, window event listeners for Google sign-in message passing, and modal rendering.
* **`server.js`** [MODIFY]: Add visitor endpoints: send OTP (via Resend), verify OTP, Google login callback, and `me` check.
* **`src/styles.css`** [MODIFY]: Add modal, overlay, Google button, and divider styling.
* **`.env`** [MODIFY]: Add `RESEND_API_KEY` definition.
* **`.gitignore`** [MODIFY]: Add `.env` to prevent committing the API key.

---

## 3. API & Backend Design (`server.js`)

We will introduce a simple in-memory session and OTP store in `server.js`:
- `visitorOtps` (`Map`): email -> `{ code, expiresAt }`
- `visitorSessions` (`Map`): token -> `{ email, name, provider }`

### Endpoints

#### `POST /api/visitor/send-code`
- **Body:** `{ "email": "..." }`
- **Behavior:**
  1. Validates email format.
  2. Generates a random 6-digit string code.
  3. Saves it to `visitorOtps` with a 10-minute expiry.
  4. Sends an email using the Resend API:
     - Endpoint: `POST https://api.resend.com/emails`
     - Header: `Authorization: Bearer <process.env.RESEND_API_KEY>`
     - Payload:
       ```json
       {
         "from": "WaterWorks <onboarding@resend.dev>",
         "to": email,
         "subject": "Your WaterWorks Verification Code",
         "html": "<p>Your WaterWorks login code is: <strong>CODE</strong></p>"
       }
       ```
  5. *Development Helper:* Always print the code to the backend terminal log (`console.log`) in case the API key is unconfigured or a sandbox address restriction blocks delivery.
- **Response:** `200 OK` on success.

#### `POST /api/visitor/verify-code`
- **Body:** `{ "email": "...", "code": "..." }`
- **Behavior:**
  1. Retrieves the record from `visitorOtps`.
  2. Verifies code matches and is not expired.
  3. Generates a session token: `visitor-token-<randomString>-<timestamp>`.
  4. Stores the session in `visitorSessions`.
  5. Clears the verified OTP.
- **Response:** `200 OK` with `{ "token": "...", "user": { "email": "...", "name": "..." } }`.

#### `POST /api/visitor/google`
- **Body:** `{ "email": "...", "name": "..." }`
- **Behavior:**
  1. Validates details.
  2. Generates a session token.
  3. Stores it in `visitorSessions`.
- **Response:** `200 OK` with `{ "token": "...", "user": { "email": "...", "name": "..." } }`.

#### `GET /api/visitor/me`
- **Header:** `Authorization: Bearer <token>`
- **Behavior:**
  1. Validates token against `visitorSessions`.
- **Response:** `200 OK` with `{ "email": "...", "name": "..." }` if valid, otherwise `401 Unauthorized`.

---

## 4. Frontend Component Design

### Header Button & Indicator
The `Header` component in `Shared.jsx` will render:
```jsx
{visitor ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 14, fontWeight: 600 }}>Hi, {visitor.name}</span>
    <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }} onClick={onLogout}>
      Log Out
    </button>
  </div>
) : (
  <button className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 14.5 }} onClick={onOpenAuth}>
    Sign In
  </button>
)}
```

### Popup Modal Dialog Flow
- **Closed state:** HTML5 `<dialog>` is closed.
- **Active state:** `<dialog>` is opened using `dialog.showModal()`.
- **Google Sign In Button:** Triggers `window.open('/mock-google-login.html', 'GoogleLogin', 'width=500,height=600')`.
- **Verification States:**
  - **State 1:** Email input field -> clicks "Send Code" -> loading spinner -> transitions to state 2.
  - **State 2:** Code input field -> enters code -> clicks "Verify" -> success checks -> closes dialog.

---

## 5. Verification Plan

- **API Unit Tests:** Add a test file `visitor-auth.test.js` verifying that OTP generation, Resend requests (mocked/simulated), verification, and Google endpoints work as designed.
- **Manual Flow:** 
  1. Verify the "Sign In" button is clickable in desktop and mobile layouts.
  2. Test mock Google Sign-In: ensure the popup opens, shows accounts, returns user data, and updates the header.
  3. Test Email Sign-In with Resend: verify that the email is sent, code is shown in the terminal console, verification completes successfully, and a session token is set in `localStorage`.
