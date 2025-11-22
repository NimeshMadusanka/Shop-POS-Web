# POS Stock Management System - Frontend

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

- **REACT_APP_BE_URL**: Backend API URL (default: http://localhost:5000)
- **REACT_APP_HOST_API_KEY**: API key for backend authentication (if required)
- **REACT_APP_FIREBASE_***: Firebase configuration (if using Firebase)
- **REACT_APP_AWS_COGNITO_***: AWS Cognito configuration (if using AWS Cognito)

### 3. Run the Application

**Development mode:**
```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:3000`

**Build for production:**
```bash
npm run build
# or
yarn build
```

## Important Notes

- Never commit `.env` file to version control
- All `.env*` files are automatically ignored by git
- The `.env.example` file shows the required variables without sensitive values
- React requires the `REACT_APP_` prefix for environment variables to be accessible in the browser

## Project Structure

- `/src` - Source code
- `/public` - Public assets
- `/build` - Production build output (generated)

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run linter
