# Docker Setup Guide - Beat Link Dashboard

## Current Working Setup ✅

### Requirements
- **Rancher Desktop** installed on Windows 11 (replaces Docker Desktop)
- **Beat Link Trigger** (or backend) running on Windows host on port 17081
- **WSL 2.6.2+** (updated)

### Architecture
```
Windows Host (192.168.1.x)
├── Beat Link Backend (port 17081) ← Accesses CDJs via Pro DJ Link
└── Rancher Desktop
    └── Frontend Container (port 8080)
        └── Proxies to → host.docker.internal:17081
```

## Why This Setup?

**Pro DJ Link multicast limitation:**
- CDJs use UDP multicast for device discovery
- Docker bridge networks can't access multicast traffic from physical network
- **Solution:** Run backend on Windows host (has direct network access), containerize only frontend

## Running the Dashboard

### 1. Start Backend on Windows Host
```bash
# Navigate to backend directory
cd api-server

# Start backend (adjust path as needed)
java -jar target/uberjar/beat-link-api-standalone.jar 17081

# Or use your start script:
# start-backend-host.bat
```

### 2. Start Frontend Container (Windows PowerShell/CMD)
```bash
cd c:\Users\adam\development\beat-link-dashboard

# Start with Rancher Desktop
docker-compose -f docker-compose.frontend-only.yml up --build
```

### 3. Access Dashboard
Open browser: `http://localhost:8080`

## Important Notes

### ✅ DO:
- Run `docker` and `docker-compose` commands from **Windows** (not WSL2)
- Use Rancher Desktop's Docker (v2.40.3)
- Keep backend running on Windows host before starting container

### ❌ DON'T:
- Don't run `sudo docker-compose` inside WSL2 (old v1.29.2 has bugs)
- Don't try to containerize the backend (can't access CDJs)
- Don't use Docker Desktop (port forwarding issues on Windows)

## Troubleshooting

### "ContainerConfig" Error
- This happens when using old docker-compose v1.29.2 in WSL2
- **Solution:** Use Rancher Desktop from Windows instead

### Frontend can't reach backend
- Check backend is running: `curl http://localhost:17081/params.json`
- Restart container: `docker-compose -f docker-compose.frontend-only.yml restart`

### Port already in use
- Check what's using port 8080: `netstat -ano | findstr :8080`
- Change port in `.env` file: `PORT=6060`

### Container shows but port timeouts
- This was the Docker Desktop issue - fixed by switching to Rancher Desktop
- Rancher Desktop has proper port forwarding on Windows

## Configuration Files

### .env
```env
PORT=8080
BACKEND_PORT=17081
BACKEND_HOST=host.docker.internal
```

### docker-compose.frontend-only.yml
For frontend-only setup (recommended)

### docker-compose.yml
For full stack (doesn't work - backend can't see CDJs)

## Network Research Notes

Attempted solutions for containerized backend:
- ❌ Bridge network - no multicast support
- ❌ MacVLAN - not supported on Windows
- ❌ Host network mode - limited support on Windows
- ⚠️ IPVLAN - potentially could work but complex
- ⚠️ UDP relay (socat/smcroute) - could proxy multicast but adds complexity

**Conclusion:** Current host backend + container frontend is the most reliable solution.