# VELOOP Rewards – Giveaway Platform

A complete, premium, and trustworthy full-stack giveaway platform designed to securely handle user participations, entry fees, and winner announcements.

## 🌟 Project Overview
The VELOOP Rewards Giveaway Platform is designed to provide a highly engaging, transparent, and secure experience for users to participate in exclusive giveaways. It features a React-based frontend providing a sleek, "fintech-inspired" aesthetic and a robust Node.js backend focused on transactional integrity, idempotency, and fraud prevention.

## 💡 Giveaway Concept
Users can browse active, upcoming, and past giveaways. Each giveaway offers premium physical or digital prizes (e.g., iPhone 15 Pro, Amazon Gift Cards). To join, users must spend a specified entry fee in virtual currencies (`VEs`, `SVEs`, or `Tokens`). The system securely deducts this balance atomically while recording their participation.

## ✨ Features
- **Complete Giveaway Lifecycle:** Seamlessly transition between Upcoming, Active, and Ended states.
- **Premium UI/UX:** Responsive design, tailored animations, and a custom `ThemedLoader` to elevate the user experience.
- **Atomic Balance Deductions:** MongoDB sessions ensure participation and balance deductions are completed securely or rolled back safely.
- **Fraud & Security Layer:** Real-time analysis of device fingerprints and request patterns to prevent abuse.
- **Dynamic Prize Claims:** Secure, backend-verified physical and digital prize claim flows restricted strictly to actual winners.

## 🔄 Giveaway States
1. **Upcoming:** Giveaways scheduled for the future. Users can preview prizes but cannot join.
2. **Active:** Giveaways currently open for participation. Countdowns reflect real remaining time.
3. **Ended:** The entry period has closed. The backend finalizes winners, and the UI shifts to winner reveals.
4. **Archived:** Historical giveaways whose winners have been successfully processed and moved to the "Previous Winners" history.

## 🔀 Technical Architecture, Validation & Workflow Diagram

Below is the complete end-to-end technical architecture, security validation pipeline, transaction processing engine, and database persistence flow for the VELOOP Rewards platform:

```mermaid
flowchart TD
    subgraph FrontendLayer["1. Frontend Presentation Layer (React 19 + Vite)"]
        direction TB
        F1["User & Admin UI Interfaces"]
        F2["React Router Navigation"]
        F3["AuthContext (JWT Session State)"]
        F4["Protected Route Guards"]
        F5["Bootstrap CSS & Framer Motion Animations"]
        F1 --> F2 --> F3 --> F4 --> F5
    end

    subgraph AuthSecurity["3. Authentication & Security Middleware"]
        direction TB
        S1["Register & Login Endpoints"]
        S2["bcrypt Password Hashing"]
        S3["JWT Token Issue (30d Expiry)"]
        S4["Bearer Token Validation (authMiddleware)"]
        S5["Role-Based Access Control (adminMiddleware)"]
        S6["CORS & Rate Limiting"]
        S1 --> S2 --> S3 --> S4 --> S5 --> S6
    end

    subgraph BackendLayer["2. Backend Core Services & Express Controllers"]
        direction TB
        B1["Node.js & Express.js REST Engine"]
        B2["Controllers (auth, giveaway, participation, winner, claim, admin)"]
        B3["Services (giveawayService, cronRunner)"]
        B4["Global Error Middleware & Custom Handlers"]
        B1 --> B2 --> B3 --> B4
    end

    subgraph JoinValidation["4. Giveaway Join & Transaction Flow"]
        direction TB
        V1["Validate Giveaway ID & Active Status"]
        V2["Check Start Date & Expiry Countdown"]
        V3["Validate Idempotency-Key Header"]
        V4["Check User Wallet Balance (VEs/SVEs/Tokens)"]
        V5["Prevent Duplicate Entry (Compound Index)"]
        V6["ACID Session Transaction: Deduct Balance & Save Participation"]
        V1 --> V2 --> V3 --> V4 --> V5 --> V6
    end

    subgraph AdminFinalization["5. Admin Finalization & Winner Selection Flow"]
        direction TB
        A1["Verify Admin Role (User.role === 'admin')"]
        A2["Check Giveaway Exists & Has Expired"]
        A3["Check Already Finalized (Prevent Duplicate Finalize)"]
        A4["Random Winner Selection (Fisher-Yates Shuffle)"]
        A5["Update Giveaway Status to Archived"]
        A6["Create Winner Records (pending_claim) & Audit Log"]
        A1 --> A2 --> A3 --> A4 --> A5 --> A6
    end

    subgraph PrizeClaimFlow["7. Prize Claim Verification Flow"]
        direction TB
        C1["Verify Logged-in User Winner Record"]
        C2["Validate Required Fields (Physical Address / Digital Email)"]
        C3["Prevent Duplicate Claim (status === 'claimed')"]
        C4["Save PrizeClaim Record & Update Winner Status"]
        C1 --> C2 --> C3 --> C4
    end

    subgraph DatabaseLayer["6. Database Persistence Layer (MongoDB & Mongoose)"]
        direction TB
        DB1[("Users Collection (balances, role, avatar)")]
        DB2[("Giveaways Collection (prizes, status)")]
        DB3[("Participations Collection (unique index)")]
        DB4[("Winners Collection (status: pending_claim/claimed)")]
        DB5[("PrizeClaims Collection")]
        DB6[("AuditLogs & FraudEvents Collections")]
        DB7[("IdempotencyKeys Collection (24h TTL)")]
    end

    subgraph TestingSuite["8. Testing & Reliability Suite"]
        direction TB
        T1["Automated API Integration Tests"]
        T2["End-to-End System Tests (testFullSystemE2E.js)"]
        T3["Idempotency & Concurrency Tests (testIdempotency.js)"]
        T4["Protected Route & Auth Error Responses"]
        T1 --> T2 --> T3 --> T4
    end

    %% Layer Connections
    FrontendLayer ==>|"HTTP REST Calls / Auth Bearer Token"| AuthSecurity
    AuthSecurity ==>|"Authenticated Request Context"| BackendLayer
    BackendLayer -->|"Join Request"| JoinValidation
    BackendLayer -->|"Finalize Request"| AdminFinalization
    BackendLayer -->|"Claim Request"| PrizeClaimFlow

    JoinValidation ==>|"ACID Transaction Sessions"| DatabaseLayer
    AdminFinalization ==>|"Winner & Audit Persistence"| DatabaseLayer
    PrizeClaimFlow ==>|"Fulfillment Persistence"| DatabaseLayer
    DatabaseLayer <===>|"Verification & State Assertion"| TestingSuite
```

## 🏆 Winner System & Prize Claim System
- **Winner Selection:** Processed securely on the backend. Only the exact configured number of winners per prize (e.g., 1 for an iPhone, 5 for AirPods) are selected.
- **Prize Claim System:** When a user logs in and is detected as a winner, they are presented with a "Claim Prize" modal. 
  - **Physical Prizes:** Requires Full Name, Phone, Address, City, State, and PIN.
  - **Digital/Gift Cards:** Requires only an Email Address.
  - *Security:* The backend absolutely ignores client-provided prize types and verifies the required fields strictly against the authoritative database record.

## 🛠️ Technology Stack
- **Frontend:** React.js, Vite, Bootstrap, CSS Modules, Framer Motion, Lucide React
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Security:** JSON Web Tokens (JWT), Express-Rate-Limit, Crypto (Device Fingerprinting)

## 📂 Folder & Component Architecture

### Frontend Architecture
- `src/components/`: Modular UI elements (`GiveawayHero`, `PrizeCard`, `WinnerSlider`, `ThemedLoader`, `PrizeClaimModal`).
- `src/pages/`: Main views (`GiveawayHome`, `GiveawayDetails`, `GiveawayWinners`).
- `src/services/api.js`: Centralized API communication layer.
- `src/data/giveawayConfig.js`: Base UI configurations and fallback structures.

### Backend Architecture
- `src/controllers/`: Core business logic (`giveawayController`, `participationController`, `winnerController`, `claimController`).
- `src/models/`: MongoDB Schemas ensuring strict data types and unique constraints.
- `src/middleware/`: Request interceptors (`authMiddleware`, `fraudMiddleware`, `rateLimitMiddleware`).
- `src/routes/`: Express endpoints mapping to controllers.

## 📱 Responsive Design & Animations
The UI is fully responsive from `320px` to `1920px+`. 
- **Mobile:** Stacking layouts, horizontal scrollable prize cards, and touch-friendly tabs.
- **Desktop:** Expansive grid compositions and detailed winner sliders.
- **Animations:** Subtle interactions using Framer Motion (hover states, modal reveals, and continuous horizontal winner marquee) engineered to feel "rewarding" without resembling a casino/gambling platform.

## 🔒 Security & Fraud Protection
- **Idempotency & Race Conditions:** Backend employs compound unique DB indexes (`userId` + `giveawayId`) and MongoDB transactions. 
- **Device Fingerprinting:** `fraudMiddleware` hashes IP and User-Agent to detect and flag multi-account abuse attempts from a single device.
- **Untrusted Frontend:** The backend never trusts the frontend for `amount`, `currency`, `prizeType`, or `userId`. All values are resolved via authoritative DB queries.

## 🗄️ Database Models
- `Giveaway`: Configuration, lifecycle dates, and prize definitions.
- `Prize`: Nested within `Giveaway`, defining entry costs, currencies, and win limits.
- `GiveawayParticipation`: Immutable record of a user joining a giveaway.
- `GiveawayEntryTransaction`: Financial audit trail of the currency deduction (`PENDING`, `SUCCESS`, `FAILED`).
- `GiveawayWinner`: Record of selected winners.
- `PrizeClaim`: Fulfillment details securely submitted by verified winners.
- `FraudEvent` & `AuditLog`: Action tracking for administrative transparency.

## 🚀 Installation & Development

### Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
4. `npm run dev` (or `npm start`)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Production Build
1. Inside `frontend`, run `npm run build` to generate the production `/dist` folder.

## 🧪 Testing
- **Frontend States:** Test UI by toggling mock authentication states in `AuthContext` to simulate Visitor, Participant, Winner, and Non-Winner.
- **Backend Flow:** Use tools like Postman to hit `/api/giveaways/:id/join`. 
  - Test *Insufficient Balance* (should reject).
  - Test *Duplicate Join* (should reject with 400).
  - Test *Claim Submission* (requires manually seeding a `GiveawayWinner` record matching the logged-in JWT user).

## 📡 API Documentation

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/giveaways/current` | No | Fetch active giveaways |
| GET | `/api/giveaways/:id` | No | Fetch details for a specific giveaway |
| GET | `/api/giveaways/:id/winners` | No | Get winners for a specific giveaway |
| GET | `/api/giveaways/previous/winners` | No | Get winners across all historical giveaways |
| GET | `/api/giveaways/:id/my-status` | Yes | Get the authenticated user's participation status |
| POST | `/api/giveaways/:id/join` | Yes | Deduct balance and record participation |
| POST | `/api/giveaways/:id/claim` | Yes | Submit physical or digital prize claim details |

## 🌐 Deployment
The frontend is optimized for deployment on Vercel or Netlify. The backend can be deployed on Heroku, Render, or any standard Node.js environment. Ensure proper `.env` variable configuration on the production servers.
