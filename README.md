# prabhupooja-seller-2026

PrabhuPooja Seller Dashboard Frontend Application.

## Environments & API Configuration

This project supports two environment configurations:

### 1. Local Development (`.env.development`)
- **Port:** `3003`
- **API URL:** `http://localhost:3002/api/v1`
- **Socket URL:** `ws://localhost:3002`

### 2. Live Production (`.env.production`)
- **Port:** `3003`
- **API URL:** `https://api.prabhupooja.com/api/v1`
- **Socket URL:** `https://api.prabhupooja.com`

---

## Getting Started

### Installation
```bash
cd Seller-frontend
npm install
```

### Running Locally (Development Mode)
```bash
npm run dev
# or from root:
npm run dev
```
Runs the app in development mode on [http://localhost:3003](http://localhost:3003).

### Building for Production (Live Mode)
```bash
npm run build
# or from root:
npm run build
```
Builds the app for production to the `Seller-frontend/build` folder with live API endpoints configured.
