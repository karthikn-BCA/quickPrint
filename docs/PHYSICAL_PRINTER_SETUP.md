# Physical Printer Configuration Guide for Shopkeepers

This guide explains how to connect your physical college Xerox printer (e.g. HP LaserJet, Canon imageRUNNER, Xerox WorkCentre, Epson EcoTank) to CampusPrint using the local Windows Print Agent.

---

## 1. Prerequisites

1. A Windows 10 or Windows 11 PC physically connected to the printer via USB or local LAN.
2. Official Windows printer drivers installed and configured as a named printer under **Windows Settings > Bluetooth & Devices > Printers & Scanners**.
3. Node.js (version 18 or newer) installed on the Windows PC.

---

## 2. Setting Up the Windows Print Agent

1. Open PowerShell or Command Prompt on the shopkeeper's PC:
   ```powershell
   cd c:\project\print-agent
   npm install
   ```

2. Configure `c:\project\print-agent\.env`:
   ```ini
   BACKEND_URL=http://localhost:5000   # Or your deployed cloud URL
   PRINT_AGENT_API_KEY=cp_agent_key_campusprint_secure_2026
   PRINTER_NAME="HP LaserJet Enterprise M507" # Exact name from Windows Printers list
   SIMULATION_MODE=false
   ```

3. Find the exact Windows printer name:
   Run the following in PowerShell:
   ```powershell
   Get-Printer | Select-Object Name, PortName, DriverName
   ```
   Copy the `Name` field into your `.env` `PRINTER_NAME`.

---

## 3. Running the Print Agent

### Option A: Testing with Hardware Simulation (No Paper Wasted)
```powershell
npm run simulate
```
This runs the full WebSocket connection, accepts paid jobs from students, verifies configurations, but simulates the mechanical printing delay without sending commands to your physical paper tray.

### Option B: Physical Printing Mode
```powershell
npm start
```
When `SIMULATION_MODE=false`, the agent dispatches verified print files directly to the Windows Spooler with duplex and copy options.

---

## 4. Automatic Startup with Windows (Daemon Mode)

To ensure the Print Agent automatically starts whenever the shopkeeper turns on the PC:

1. Create a shortcut of a batch file `start-agent.bat`:
   ```bat
   @echo off
   cd /d "C:\project\print-agent"
   npm start
   ```
2. Press `Win + R`, type `shell:startup`, and press Enter.
3. Paste the shortcut into the Windows Startup folder.
