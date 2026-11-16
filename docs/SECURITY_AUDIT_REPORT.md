# CampusPrint Security Audit & Hardening Report

**Audit Target**: CampusPrint Web Application, Backend API, and Windows Print Agent  
**Auditor**: Senior Cybersecurity & Systems Architect  
**Date**: November 2026  
**Status**: VERIFIED & HARDENED

---

## 1. Executive Summary

CampusPrint handles sensitive student documents (assignments, ID proofs, thesis documents), financial transactions (Razorpay payments), administrative controls (pricing and revenue), and local hardware interaction (Windows printing). 

A comprehensive security assessment was conducted across all layers:
1. API Credentials & Environment Variables
2. Authentication & Authorization (RBAC)
3. Input Validation, File Upload & MIME Magic Inspection
4. Price Tampering & Payment Verification
5. Customer Data Isolation
6. Windows Print Agent Hardware Security

---

## 2. Issues Discovered, Severity, and Implemented Fixes

### Finding 1: Potential Client-Side Price Tampering
- **Severity**: HIGH
- **Vulnerability**: If the backend trusted physical sheet counts or item subtotals sent by the customer's browser, an attacker could manipulate the payload to print 100 color pages for ₹1.
- **Fix Implemented**: The backend `pricingEngine.js` completely ignores any prices or sheet counts sent by the client. It queries MongoDB for the verified document page count, parses the selected page ranges, computes the duplex physical sheets ceiling formula, applies official active rates from `ShopSettings`, and validates the final payable amount before creating the Razorpay order.

### Finding 2: Unverified Payment Confirmation Vulnerability
- **Severity**: CRITICAL
- **Vulnerability**: Relying on frontend payment callbacks could allow malicious users to spoof payment success and trigger unauthorized printing.
- **Fix Implemented**: Server-side verification is mandatory. Payment records require cryptographic HMAC SHA-256 signature verification matching `razorpay_order_id` + `razorpay_payment_id` against the secret key. Unpaid or unverified orders never enter the printing queue (`printingStatus` remains `WAITING_FOR_PAYMENT`). Payment verification is idempotent to prevent double-charging or duplicate print triggers.

### Finding 3: File Upload Arbitrary Execution & Public Document Exposure
- **Severity**: HIGH
- **Vulnerability**: Uploading untrusted files might introduce web shells or malicious executables, while storing uploads in public directories allows anyone to download other students' documents.
- **Fix Implemented**:
  1. Private Storage: Files are stored in an unexposed `uploads` directory outside the web server root.
  2. Whitelist Validation: Only `.pdf`, `.jpg`, `.jpeg`, and `.png` extensions and matching MIME types are accepted.
  3. PDF Magic Bytes Inspection: `pdfService.js` reads file headers (`%PDF`) and validates internal structure using `pdf-lib` before saving. Invalid or corrupted files are immediately unlinked from disk.
  4. Stream Authentication: Files are only served through authenticated preview/download endpoints with session token or admin checks.

### Finding 4: Cross-Customer Data Exposure (IDOR)
- **Severity**: MEDIUM
- **Vulnerability**: An attacker guessing sequential order IDs could inspect other students' print jobs or personal phone numbers.
- **Fix Implemented**:
  1. High-Entropy Order IDs: Orders use random alphanumeric suffixes (`XR<YYYYMMDD><RANDOM>`).
  2. Multi-Factor Verification: Tracking endpoints require matching the customer's registered 10-digit mobile number or possessing the private session token issued during checkout.

### Finding 5: Denial of Service & Brute-Force Attacks
- **Severity**: MEDIUM
- **Vulnerability**: Malicious actors spamming login endpoints or flooding file upload endpoints.
- **Fix Implemented**: Configured multi-tier rate limiting using `express-rate-limit`:
  - Login attempts limited to 10 requests / 15 minutes.
  - Document uploads limited to 40 requests / 10 minutes.
  - Global API requests limited to 200 requests / 15 minutes.
  - HTTP headers hardened with `helmet` and strict CORS policy.

### Finding 6: Local Windows Print Agent Command Injection
- **Severity**: HIGH
- **Vulnerability**: If an attacker could inject shell arguments into the Windows printing command, arbitrary code could execute on the shopkeeper's computer.
- **Fix Implemented**:
  - The Print Agent strictly authenticates all requests using a pre-shared `x-agent-api-key`.
  - Downloaded document filenames are sanitized and generated locally.
  - PowerShell arguments are strictly escaped and wrapped in quotes.
  - Hardware simulation mode (`--simulate`) provides an isolated environment for safe verification without touching the local print spooler.

---

## 3. Summary of Hardened Components

| Component | Protection Mechanism | Status |
|---|---|:---:|
| Environment Secrets | Stored in `.env`, gitignored, placeholder `.env.example` provided | PASSED |
| Passwords | Hashed using bcrypt with 10 salt rounds | PASSED |
| Session Security | JWT tokens signed with 24-hour expiration | PASSED |
| Price Calculation | Server-side mathematical validation | PASSED |
| Razorpay Verification | HMAC SHA-256 cryptographic signature verification | PASSED |
| Document Storage | Private unexposed directory with randomized filenames | PASSED |
| Duplicate Protection | Memory guard + DB state lock preventing double printing | PASSED |

---

## 4. Remaining Operational Risks & Best Practices

1. **Physical Security**: The shopkeeper's PC at the campus Xerox shop must be password-protected to prevent unauthorized physical access.
2. **Key Rotation**: When deploying to production with live bank credentials, rotate the default `JWT_SECRET` and `PRINT_AGENT_API_KEY` to unique high-entropy strings.
3. **Database Backups**: Schedule automated daily backups for the MongoDB database on campus servers or use MongoDB Atlas managed backups.
