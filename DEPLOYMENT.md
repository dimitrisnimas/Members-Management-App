# Deployment Guide for Members App

This guide outlines the steps to deploy the Members application using **Neon.tech** (Database), **Render** (Backend), and **Netlify** (Frontend).

## 1. Database Deployment (Neon.tech)

1.  **Create a Project**:
    *   Log in to [Neon.tech](https://neon.tech).
    *   Create a new project (e.g., `sepam-members`).
    *   Choose the region closest to your users (e.g., `aws-eu-central-1` for Frankfurt).

2.  **Get Connection String**:
    *   On the dashboard, find the **Connection Details**.
    *   Copy the **Connection String** (Postgres URL). It looks like: `postgres://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`.

3.  **Run Migrations**:
    *   You need to run the SQL migration script (`backend/migrations/001_initial_schema.sql`) against this new database.
    *   You can use a tool like **pgAdmin**, **DBeaver**, or the **Neon SQL Editor** in their dashboard.
    *   Copy the content of `001_initial_schema.sql` and execute it to create the tables.

## 2. Backend Deployment (Render)

1.  **Create a Web Service**:
    *   Log in to [Render](https://render.com).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

2.  **Configure Service**:
    *   **Name**: `sepam-members-backend`
    *   **Root Directory**: `backend` (Important!)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Plan**: Free

3.  **Environment Variables**:
    *   Scroll down to **Environment Variables** and add the following:
        *   `NODE_ENV`: `production`
        *   `PORT`: `10000` (Render default)
        *   `DATABASE_URL`: (Paste your Neon.tech connection string here)
        *   `JWT_SECRET`: (Generate a strong random string)
        *   `FRONTEND_URL`: (Leave empty for now, update after deploying frontend)
        *   `EMAIL_USER`: (Your Gmail address)
        *   `EMAIL_PASS`: (Your Gmail App Password)
        *   `STRIPE_SECRET_KEY`: (Your Stripe Secret Key, optional for now)

4.  **Deploy**:
    *   Click **Create Web Service**.
    *   Wait for the deployment to finish.
    *   Copy the **Service URL** (e.g., `https://sepam-members-backend.onrender.com`).

## 3. Frontend Deployment (Netlify)

1.  **Create a New Site**:
    *   Log in to [Netlify](https://netlify.com).
    *   Click **Add new site** -> **Import from Git**.
    *   Connect your GitHub repository.

2.  **Configure Build**:
    *   **Base directory**: `frontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `frontend/dist`

3.  **Environment Variables**:
    *   Click **Show advanced** -> **New Variable**.
    *   Key: `VITE_API_URL`
    *   Value: (Paste your Render Backend URL, e.g., `https://sepam-members-backend.onrender.com/api`)
    *   **Important**: Ensure you append `/api` to the URL if your backend routes are prefixed with it (which they are).

4.  **Deploy**:
    *   Click **Deploy site**.
    *   Wait for the build to complete.
    *   Copy your new **Site URL** (e.g., `https://sepam-members.netlify.app`).

## 4. Final Configuration

1.  **Update Backend CORS**:
    *   Go back to your **Render** dashboard.
    *   Update the `FRONTEND_URL` environment variable with your new Netlify Site URL (no trailing slash).
    *   Render will automatically redeploy.

2.  **Verify**:
    *   Open your Netlify URL.
    *   Try to register a new user.
    *   Check if the data appears in your database.
    *   Check if emails are sent (if configured).

## Troubleshooting

*   **CORS Errors**: Ensure `FRONTEND_URL` in Render matches your Netlify URL exactly (protocol `https://` and no trailing slash).
*   **Database Connection**: Ensure your Neon.tech database is active and the connection string is correct in Render.
*   **Email Failures**: Ensure you are using an **App Password** for Gmail, not your regular password.
