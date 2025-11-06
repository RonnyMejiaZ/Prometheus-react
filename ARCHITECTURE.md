# Prometheus React - Architecture Guide

## Overview
This is a React + TypeScript application for property management (Prometheus). It uses a dark theme UI and communicates with a Java backend via REST API.

## Key Architecture Decisions

### 1. Authentication System
**Hybrid Approach: HTTP Sessions (Cookies) + localStorage**

- **Backend**: Uses HTTP sessions (cookies) for authentication
- **Frontend**: Stores user data in `localStorage` for quick access
- **Configuration**: All API requests include `withCredentials: true` to send cookies

**Why this approach?**
- Backend uses traditional servlet sessions
- localStorage provides quick access to user info without server calls
- Cookies are automatically sent/received by the browser

**Key Files:**
- `src/services/api.ts` - Authentication methods
- `src/App.tsx` - Route protection logic

### 2. Route Protection
**Three-layer protection system:**

1. **ProtectedRoute**: Redirects to `/login` if no user in localStorage
2. **PublicRoute**: Redirects to `/dashboard` if user is already authenticated
3. **AppLayout**: Wraps protected routes with Navigation + Header

**Why this structure?**
- Separates concerns: auth check vs layout rendering
- Prevents authenticated users from accessing login/register pages
- Keeps layout consistent across protected pages

### 3. API Service Pattern
**Centralized API service class:**

- Single `ApiService` instance exports all API methods
- Consistent error handling via interceptors
- All endpoints follow the same pattern: `ApiResponse<T>`

**Response Structure:**
```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
```

### 4. State Management
**Component-level state with React hooks:**

- Each component manages its own state
- No global state management library (Redux, Context API)
- Data fetching happens in `useEffect` hooks

**Pros:**
- Simple and straightforward
- No extra dependencies
- Easy to understand for React beginners

**Cons:**
- State not shared between components
- Potential prop drilling if needed later

### 5. Dashboard Statistics Calculation
**Client-side data processing:**

- Fetches all data (alquileres, pagos) at once
- Calculates statistics in the frontend
- Filters and aggregates data using JavaScript

**Performance Considerations:**
- For large datasets, this approach may be slow
- Consider backend aggregation for production

## Common Patterns

### CRUD Components
All entity components (Properties, Inquilinos, Alquileres, Pagos) follow the same pattern:

1. State management for list, loading, error, form
2. `loadData()` function to fetch from API
3. `handleSubmit()` for create/update
4. `handleDelete()` for deletion
5. Form validation and error handling

### Error Handling
- API errors are caught and displayed in UI
- Console logs for debugging (should be removed in production)
- User-friendly error messages

## File Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard with charts
│   ├── Login.tsx       # Authentication form
│   ├── Register.tsx    # User registration
│   ├── Properties.tsx  # Property CRUD
│   ├── Inquilinos.tsx  # Tenant CRUD
│   ├── Alquileres.tsx  # Rental CRUD
│   ├── Pagos.tsx       # Payment CRUD
│   ├── Navigation.tsx  # Sidebar navigation
│   └── Header.tsx      # Top header bar
├── services/
│   └── api.ts          # API service (all HTTP calls)
├── types/
│   └── index.ts        # TypeScript type definitions
└── App.tsx             # Main app with routing
```

## Potential Improvements

1. **Remove debug logs** - Many `console.log` statements should be removed
2. **Add error boundaries** - Catch React component errors
3. **Extract common logic** - DRY principle for CRUD operations
4. **Add loading states** - Better UX during API calls
5. **Type safety** - Some `any` types could be more specific
6. **Documentation** - Add JSDoc comments to functions
7. **Environment variables** - Move API baseURL to env file
8. **Error handling** - Centralize error handling logic

