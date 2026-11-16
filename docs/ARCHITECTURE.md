# CampusPrint System Architecture

CampusPrint is an automated smart printing and Xerox management system engineered specifically for single campus print centers.

---

## 1. High-Level System Flow

```
+-----------------------------------------------------------------------------------+
|                                STUDENT BROWSER                                    |
|   1. Upload PDF / Image Documents -> 2. Select Duplex/Color/Copies -> 3. Pay UPI  |
+------------------------------------------+----------------------------------------+
                                           | HTTP (REST) & WebSockets
                                           v
+-----------------------------------------------------------------------------------+
|                             CAMPUSPRINT BACKEND (NODE.JS)                         |
|   - Multer Private Storage: Documents stored outside public web directory         |
|   - Pricing Engine: Server-side re-calculation (Single vs Double Physical Sheets) |
|   - Razorpay Integration: HMAC SHA256 Signature Verification                      |
|   - Print Queue Dispatch: Socket.IO events to local print agents                  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                 MONGODB DATABASE                                  |
|   - User & Roles: Admin / Shopkeeper authentication                               |
|   - Orders & Print Jobs: Status state machine & idempotency checks                |
|   - Documents: Metadata, validated page counts & MIME types                       |
|   - Shop Settings: Dynamic per-sheet rates (B&W/Color, Simplex/Duplex)            |
+------------------------------------------+----------------------------------------+
                                           | Authenticated API Key / WebSockets
                                           v
+-----------------------------------------------------------------------------------+
|                        WINDOWS PRINT AGENT (LOCAL PC AT XEROX SHOP)               |
|   - Authenticates via `x-agent-api-key`                                           |
|   - Securely downloads documents via stream endpoint                              |
|   - Extracts custom page ranges with pdf-lib                                      |
|   - Dispatches to Windows Print Spooler (or Simulation Mode)                      |
|   - Reports real-time status: PRINTING -> PRINTED -> READY_FOR_COLLECTION         |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                          PHYSICAL CONNECTED PRINTER                               |
|   - High-Speed Duplex Laser Printer (e.g. HP / Canon / Xerox WorkCentre)          |
|   - Physical printed sheets collected by student at SAC counter                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Order & Print Status State Machine

```
   [ Customer Checkout ]
             |
             v
   WAITING_FOR_PAYMENT (Unpaid orders cannot print)
             |
   [ Razorpay Payment Verified via HMAC SHA256 ]
             v
           PAID
             |
             v
          QUEUED (Job entered in print queue)
             |
             v
         PRINTING (Agent starts processing pages)
             |
             +------------------------------+
             |                              |
             v                              v
          PRINTED (Success)               FAILED (Error)
             |                              |
             v                              v
     READY FOR COLLECTION             Admin Notified
             |                        Retry Option Available
             v
         COLLECTED
```

---

## 3. Physical Sheet Calculation Algorithm

A common point of failure in printing software is charging per document page instead of per physical paper sheet. CampusPrint uses strict mathematical sheet calculations:

### Single-Sided Printing:
$$\text{Physical Sheets} = \text{Selected Pages} \times \text{Copies}$$

### Double-Sided (Duplex) Printing:
$$\text{Physical Sheets} = \lceil \frac{\text{Selected Pages}}{2} \rceil \times \text{Copies}$$

### Final Amount Validation:
$$\text{Item Total} = \text{Physical Sheets} \times \text{Configured Price per Sheet}$$
$$\text{Grand Total} = \sum \text{Item Totals}$$

*Note: The backend always independently recalculates and validates all amounts prior to Razorpay order creation and payment verification. Frontend estimates are never trusted.*
