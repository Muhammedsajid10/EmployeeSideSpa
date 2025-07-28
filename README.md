# Employee SPA Frontend

This is the frontend application for the Employee Management System.

## Deployment to Render

### Prerequisites
- Your backend should be deployed at: `https://spabackend-0tko.onrender.com`
- API configuration in `src/utils/api.js` should point to the deployed backend

### Deploy to Render

1. **Create a new Git repository for the frontend:**
   ```bash
   git init
   git add .
   git commit -m "Initial frontend commit"
   ```

2. **Push to GitHub:**
   - Create a new repository on GitHub
   - Push your code to the repository

3. **Deploy on Render:**
   - Go to [Render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `spa-frontend` (or your preferred name)
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free tier is sufficient

4. **Environment Variables** (if needed):
   - No environment variables required as API URL is hardcoded

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### API Configuration

The frontend is configured to connect to the deployed backend at:
`https://spabackend-0tko.onrender.com/api/v1`

If you need to change this, update the `BASE_URL` in `src/utils/api.js`.

## Features

- Employee login and authentication
- Employee dashboard
- Schedule management
- Attendance tracking
- Performance metrics

## Technologies Used

- React 19
- Vite
- Lucide React (icons)
- CSS for styling+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
