# Firestore Security Specification

## 1. Data Invariants
- Every document in `/students/{studentId}` represents a 1st-grade student leaderboard profile with strict non-PII fields (`nickname`, `totalScore`, `bestSpeedScore`, `bestLineWaveCleared`, `totalStars`, `unlockedCount`, `gamesPlayed`, `lastMode`, `createdAt`, `updatedAt`, `classCode`).
- A student profile can only be created or updated when `classCode == '2026'` and all numeric counters stay within realistic bounds and never decrease `createdAt`.
- Every document in `/scoreLogs/{logId}` must reference an existing `/students/{studentId}` document via `exists(...)`, use `classCode == '2026'`, have `score` in `[0, 100000]`, and `createdAt == request.time`.
- Deletes are denied for all client writes to protect classroom score integrity.
- Unmatched collections (except `/test/connection` health-check read) are denied by the global catch-all rule.

## 2. Adversarial Test Payloads ("Dirty Dozen")
1. Missing `classCode` on `/students/stu_1` create -> `PERMISSION_DENIED`
2. Wrong `classCode: "9999"` on `/students/stu_1` create -> `PERMISSION_DENIED`
3. Shadow ghost field `isAdmin: true` on `/students/stu_1` create -> `PERMISSION_DENIED`
4. Oversized `nickname` (> 20 chars) on `/students/stu_1` -> `PERMISSION_DENIED`
5. Invalid document ID `../../admin` on `/students/{studentId}` -> `PERMISSION_DENIED`
6. Negative `totalScore: -500` on `/students/stu_1` -> `PERMISSION_DENIED`
7. Client-forged `createdAt` timestamp != `request.time` -> `PERMISSION_DENIED`
8. Mutating `createdAt` or `nickname` during `/students/stu_1` update -> `PERMISSION_DENIED`
9. Deleting `/students/stu_1` -> `PERMISSION_DENIED`
10. Creating `/scoreLogs/log_1` with non-existent `studentId` -> `PERMISSION_DENIED`
11. Creating `/scoreLogs/log_1` with invalid `mode: "hack"` -> `PERMISSION_DENIED`
12. Updating or deleting `/scoreLogs/log_1` -> `PERMISSION_DENIED`
