# SPA Management — Employee Dashboard

React-based employee portal for a multi-role spa booking and management platform.

> **Project context:** This is the employee-facing frontend of a larger team project. The platform also has a customer booking application, an admin panel, and a shared Node.js/Express/MongoDB backend. Features and availability depend on the connected backend.

## Overview

The employee dashboard gives spa staff access to their work-related information and actions, including schedules, attendance, and performance information. The frontend communicates with a shared REST API.

## Features and API integration

The current API configuration in `src/utils/api.js` defines endpoints for:

| Area | API integration |
| --- | --- |
| Authentication | Login, logout, current user, signup, password recovery |
| Schedule | Employee's own schedule |
| Attendance | View attendance, check in, check out, mark absent |
| Feedback and performance | Employee ratings and performance |
| Booking data | Booking API |
| Catalog | Services and categories |

The presence of a configured endpoint does not independently confirm every screen or workflow has been end-to-end tested.

## Tech stack

- React 19 and React DOM
- Vite 7
- JavaScript and CSS
- Tailwind CSS 4
- Lucide React and React Icons
- REST API integration using `fetch`

## Related application

- **Backend:** [SPA Management Backend API](https://github.com/Muhammedsajid10/spaBackend)
- **Customer app and admin panel:** Separate repositories within the wider SPA Management project

## Local development

**Requirements:** Node.js and npm, and a compatible running backend.

```bash
git clone https://github.com/Muhammedsajid10/EmployeeSideSpa.git
cd EmployeeSideSpa
npm install
npm run dev
```

Other available scripts:

```bash
npm run build
npm run preview
npm run lint
```

The repository also provides `npm start`, which starts the included `serve.js` server. For Vite development, use `npm run dev`.

## API configuration

The current backend base URL is configured directly in `src/utils/api.js`, rather than through a Vite environment variable. Update that setting to point to a compatible backend for your environment.

**Environment variables:** The frontend does not currently require a `.env` file for the API URL because the URL is hardcoded. Moving the URL to a `VITE_API_BASE_URL` variable would be a useful future improvement, but this README does not claim that variable is already implemented.

Never place API secrets or private signing keys in frontend `VITE_*` variables; they are exposed in the client bundle.

## Engineering highlights

- Integrating a React employee dashboard with a role-based backend
- Handling authenticated API requests and employee-specific endpoints
- Connecting schedule, attendance, ratings, and performance workflows
- Maintaining a separate employee experience within a multi-application platform

## Project status and notes

This repository is one component of the larger SPA Management platform. It should not be described as a standalone production service without verifying the backend, environment configuration, and end-to-end flows.

For production deployment, review API configuration, access controls, error states, and backend availability.
