# 🔥 Critical Network Issue Diagnosis

## Problem
Server starts successfully but ALL HTTP connections are reset immediately with `ECONNRESET`. This happens even with the most minimal Express server possible.

## Evidence
1. ✅ Server starts and binds to port 4000
2. ✅ Port 4000 is listening (confirmed via `netstat`)
3. ❌ Server NEVER receives requests (no logs when requests are made)
4. ❌ Connection is reset at OS/network layer BEFORE reaching Node.js

## Root Cause
This is **NOT a code issue**. This is a Windows system-level networking problem, most likely:

1. **Antivirus/Security Software** blocking localhost connections
2. **Windows Firewall** blocking Node.js
3. **Windows Defender** real-time protection interfering
4. **Network adapter/driver** issue
5. **VPN/Proxy** software interfering

## Immediate Workarounds

### Option 1: Try Different Port
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Use port 3000 instead
# Edit backend/.env:
PORT=3000

# Restart backend
npm run dev
```

### Option 2: Disable Real-Time Protection (Temporarily)
```powershell
# Run PowerShell as Administrator
Set-MpPreference -DisableRealtimeMonitoring $true

# Try starting server again
npm run dev

# Re-enable after testing
Set-MpPreference -DisableRealtimeMonitoring $false
```

### Option 3: Add Firewall Exception
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### Option 4: Reset Network Stack
```powershell
# Run Command Prompt as Administrator
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /renew
ipconfig /flushdns

# Restart computer
```

### Option 5: Use WSL2 (Recommended Long-term)
If you have WSL2 installed:
```bash
# In WSL2
cd /mnt/d/Github/OOPshop/backend
npm run dev
```

## Quick Test to Confirm Issue
Run this in PowerShell to test if it's system-wide:
```powershell
# Start a simple Python HTTP server (if Python installed)
python -m http.server 8000

# Or try Node's http-server
npx http-server -p 8000

# Then test in browser: http://localhost:8000
```

If these also fail with connection reset, it's definitely a system issue.

## What to Check

### 1. Check Antivirus Software
- Norton, McAfee, Avast, AVG, etc.
- Look for "Web Shield" or "Real-Time Protection"
- Add Node.js to exceptions

### 2. Check Windows Firewall
```powershell
Get-NetFirewallProfile | Select-Object Name, Enabled
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Node*"}
```

### 3. Check for Port Conflicts
```powershell
netstat -ano | findstr :4000
# If multiple PIDs, kill them all
```

### 4. Check VPN/Proxy
- Disable any VPN clients
- Check Windows Proxy settings
- Disable any corporate network security tools

## For Development Right Now

**TEMPORARY FIX**: Use the minimal server on a different port:

1. Stop all Node processes
2. Use `minimal-ipv4.js` on port 3001:
   ```javascript
   const PORT = 3001;
   ```
3. Update frontend to use port 3001
4. Test if that works

## If Nothing Works

Contact your IT department or check:
1. Corporate security policies
2. Network administrator settings
3. Managed antivirus configurations

---

**Bottom Line**: The backend code is correct. This is a Windows networking/security issue blocking localhost HTTP connections.
