# Security Specification - Vidyarthi-Bus

## 1. Data Invariants
- A `CrowdReport` must belong to an existing `Route`.
- `status` must be one of: `empty`, `seated`, `full`.
- `timestamp` must be the server time.
- `userId` must match the authenticated user.
- Reports are immutable once created.
- Reports older than 15 minutes are considered stale by the client.

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **Status Spoofing**: `{ "status": "overloaded" }` -> REJECTED (enum check).
2. **Identity Spoofing**: User A reporting as User B -> REJECTED (`userId` check).
3. **Time Spoofing**: Reporting a status with a 10-hour old timestamp -> REJECTED (`request.time` check).
4. **Route Orphan**: Reporting for a route that doesn't exist -> REJECTED (`exists()` check).
5. **Ghost Fields**: Adding `isVerified: true` to a report -> REJECTED (`affectedKeys().size()` check).
6. **Large Payload**: Injecting a 1MB string into the crowd status -> REJECTED (`.size()` check).
7. **Cross-Route Attack**: Updating a report belonging to another route -> REJECTED (Immutable check).
8. **PII Leak**: Reading all reports from all users globally -> REJECTED (List query check).
9. **Anonymous Spam**: Reporting without being signed in -> REJECTED (`auth != null`).
10. **ID Poisoning**: Using a 500-char route ID -> REJECTED (`isValidId()` check).
11. **Negative Count**: Attempting to decrement a report count via direct update -> REJECTED (Immutable check).
12. **Future Timestamp**: Setting `timestamp` to tomorrow -> REJECTED (`request.time` check).

## 3. Implementation Plan
- `isValidReport()` helper for structural integrity.
- `allow create`: requires authentication, valid route, and strictly defined keys.
- `allow read`: anyone can read routes and reports (for historical transparency and current status).
- `allow update/delete`: DENIED (reports are append-only).
