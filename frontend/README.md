# AmiiboDB Frontend

React + Material UI frontend for the AmiiboDB application.

## Quick Start

```bash
npm install
npm start
```

The app runs on **http://localhost:3000**.

## Environment

Create a `.env` file in the project root to point at your backend:

```
REACT_APP_API_URL=http://localhost:3001/api
```

## Project Structure

```
src/
├── components/
│   ├── AmiiboCard.jsx      # Card with favorite/owned/wanted toggles
│   ├── CategoryChips.jsx   # Horizontal scrollable series filter (logged-in only)
│   ├── Header.jsx          # Sticky top bar — Login/Signup when guest
│   ├── ProtectedRoute.jsx  # Redirects unauthenticated users to /login
│   └── SearchBar.jsx       # Reusable search input
├── context/
│   └── AuthContext.jsx     # Auth state + collection cache + optimistic updates
├── pages/
│   ├── Landing.jsx         # Browse all Amiibos (amiiboapi.com)
│   ├── Login.jsx           # Sign-in form
│   ├── Signup.jsx          # Registration form with validation
│   ├── Favorites.jsx       # My Collection — tabbed Favorites / Owned / Wanted
│   └── Profile.jsx         # User info + collection stats + change password
├── services/
│   └── api.js              # Axios wrappers for amiiboapi.com + your backend
└── App.jsx                 # Theme + Router + layouts
```

## Backend Contract

The frontend expects these endpoints on your backend:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | `{ username, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET  | `/api/auth/me` | Returns current user (requires Bearer token) |
| PUT  | `/api/auth/profile` | Update username/email |
| PUT  | `/api/auth/password` | `{ currentPassword, newPassword }` |
| GET  | `/api/collection` | Returns `[{ head, tail, status }]` |
| POST | `/api/collection` | `{ head, tail, status }` — add status |
| DELETE | `/api/collection` | `{ head, tail, status }` — remove status |

**`status`** is one of: `"favorite"`, `"owned"`, `"wanted"`

**`head` / `tail`** are the Amiibo identifiers from amiiboapi.com (e.g. `"01010000"` / `"00040002"`).

## Amiibo Identifiers

Each Amiibo from the API has `head` and `tail` hex strings that uniquely identify it.
These are stored in your DB as the composite key for user collection entries.
