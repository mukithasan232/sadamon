# Shadamon

A full-stack monorepo application consisting of a modern web frontend, a powerful admin dashboard, and a scalable Node.js backend.

## 🏗 Project Structure

This repository is structured as a monorepo containing three main workspaces:

- **/shadamon-Frontend**: The public-facing Next.js web application.
- **/shadamon-Admin**: The Next.js admin control panel.
- **/shadamon-Backend**: The Node.js REST API backend.

## 🚀 Tech Stack

- **Frontend & Admin**: [Next.js](https://nextjs.org/) (React), Tailwind CSS, TypeScript
- **Backend**: [Node.js](https://nodejs.org/), Express.js
- **Tooling**: npm workspaces, `concurrently` for running all dev servers together.

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mukithasan232/sadamon.git
   cd sadamon
   ```

2. Install dependencies for all workspaces at once:
   ```bash
   npm run install:all
   ```

### Running Locally

You can start all three applications (Frontend, Admin, and Backend) simultaneously from the root directory:

```bash
npm run dev
```

*Note: As configured in `package.json`, this will run the backend, frontend, and the admin panel (specifically mapping the admin panel to port `3001`).*

## 🌐 Deployment

This project is optimized for deployment on modern platforms like **Vercel** and **Render**. 

**Important for Deployment:** Since this is a monorepo, when configuring your deployment (whether it's the frontend, backend, or admin panel), make sure to specify the appropriate **Root Directory** (e.g., `shadamon-Frontend`) in your hosting provider's dashboard so it builds the correct application.

## 📄 License

This project is licensed under the MIT License.
