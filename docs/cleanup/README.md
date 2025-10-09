# Cleanup Utilities

## Purpose
This document tracks utilities and processes that keep the StandUpComedy App's datastore restricted to approved test accounts. It exists to make sure maintenance tasks stay safe and reproducible when pruning snapshot data.

## How to Run Cleanup
1. Ensure you are on the `cleanup/test-only-accounts` branch (or another maintenance branch).
2. Install dependencies with `npm install` if you have not already.
3. Execute `npm run cleanup:testdata` to prune the snapshot to the approved whitelist.
4. Review the generated report at `docs/cleanup/cleanup-report.md` for details on what was removed.
5. Optionally reseed the datastore using the project seed script when instructed.
