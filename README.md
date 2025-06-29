# PersonaCart

PersonaCart is a modern, family-oriented e-commerce MVP inspired by OTT profile systems. Each family member can have a personalized profile with preferences (sizes, personal care, etc.), making shopping easier and more tailored for everyone.

## Features
- **Family Profiles:** Create and manage individual profiles for each family member.
- **Personalized Product Recommendations:** Products are filtered and recommended based on active profile preferences.
- **Profile-Based Cart:** Add products to cart per user profile.
- **Secure Authentication:** Login with Firebase Authentication (email/password & Google).
- **Modern UI:** Responsive React frontend with Tailwind CSS, dark/light mode, and glassmorphism design.
- **Persistent Backend:** Node.js + Express backend with PostgreSQL (via Supabase) for data storage.

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Firebase Authentication
- **Deployment:** Vercel (frontend), Render (backend)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/KSaiNikhilesh/PersonaCart.git
cd PersonaCart/sparkathon/family-profiles
```

### 2. Setup Environment Variables

#### Frontend (`/src/.env`)
```
REACT_APP_API_URL=<your-backend-url>
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

#### Backend (`/server/.env`)
```
DATABASE_URL=<your-supabase-postgres-connection-string>
FIREBASE_TYPE=...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=...
FIREBASE_TOKEN_URI=...
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=...
FIREBASE_CLIENT_X509_CERT_URL=...
FIREBASE_UNIVERSE_DOMAIN=...
```

### 3. Install Dependencies
#### Frontend
```bash
npm install
```
#### Backend
```bash
cd server
npm install
```

### 4. Run Locally
#### Backend
```bash
cd server
npm start
```
#### Frontend
```bash
cd ..
npm start
```

### 5. Deployment
- **Frontend:** Deploy to Vercel. Set environment variables in the Vercel dashboard.
- **Backend:** Deploy to Render. Set environment variables in the Render dashboard.

## Folder Structure
```
family-profiles/
  ├── public/           # Static assets
  ├── src/              # React frontend
  ├── server/           # Node.js + Express backend
  ├── package.json      # Frontend dependencies
  └── README.md         # Project documentation
```

## Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](../LICENSE)
