# Polyquine HyperTerminal integration (review candidate)

This feature provides a browser-local virtual filesystem and an on-demand HyperTerminal overlay. It does not replace the existing Command Palette, networking, or authorization mechanisms.

## Scope
- Browser localStorage VFS, protected top-level directories, path normalization, and JSON snapshot export.
- Commands: help, pwd, ls, cd, cat, mkdir, write, append, rm, logs, quine export, clear.
- No shell execution, no remote code execution, and no claims of EU AI Act certification or EuroHPC affiliation.
- No hidden network calls, automatic permission grants, or API credentials in the frontend.

## Integration points
- The App.tsx header-adjacent terminal button opens the overlay; existing views are unchanged.
- A future server-side command capability must require authentication, scoped actions, explicit approvals and audit receipts.
- A full self-reproducing quine and MHTML archival pipeline remain separate verification gates.

## ADAM status
DISCOVER and NORMALIZE: implemented in this branch.
VERIFY: pending CI/typecheck and browser smoke test.
PRODUCTION_VERIFIED: not claimed.
