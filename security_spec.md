# Security Spec

## Data Invariants
- Programs: Only admins can create/update/delete. Anyone can read.
- Donations: Anyone can create. Only admins can update/delete. Anyone can read.
- News: Only admins can create/update/delete. Anyone can read.
- Ustadz: Only admins can create/update/delete. Anyone can read.
- Prayers: Anyone can create. Anyone can update (to ameen). Anyone can read.
- BankAccounts: Only admins can create/update/delete. Anyone can read.
- Notifications: Only admins can create/update/delete. Anyone can read.

Since this app doesn't have an admin system built into Firebase Auth yet (the admin dashboard is currently a visual toggle without auth), we will implement a basic admin check using an `admins` collection, and allow public reads for all.

## Dirty Dozen Payloads
1. Create program without admin role
2. Update program without admin role
3. Delete program without admin role
4. Create donation missing fields
5. Update donation as non-admin
6. Create news as non-admin
7. Create ustadz as non-admin
8. Create prayer missing fields
9. Add 1MB string to prayer name
10. Update prayer ameen with wrong type
11. Create bank account as non-admin
12. Create notification as non-admin
