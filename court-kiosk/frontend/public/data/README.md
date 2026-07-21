# Flow JSON — source of truth

**Only edit files under `frontend/public/data/`.**  
CRA copies `public/` → `build/` on deploy. Nothing under `src/data/` is loaded for restraining-order / DV / CHRO flows.

## Live (routed) files

| File | Loaded by | Route |
|------|-----------|--------|
| `restraining-order-triage.json` | `RestrainingOrderTriagePage.jsx` | `/restraining-order` |
| `dv_flow_combined.json` | `DVROPage.jsx`, `KioskMode.jsx` | `/dvro`, `/kiosk` |
| `civil-harassment-flow.json` | `CHROPage.jsx` | `/chro` |
| `elder-abuse-flow.json` | `ElderAbusePage.jsx` | `/elder-abuse` |
| `gvro-flow.json` | `GVROPage.jsx` | `/gvro` |
| `workplace-violence-flow.json` | `WorkplaceViolencePage.jsx` | `/workplace-violence` |
| `divorce_flow.json` | `DivorceFlowRunner.jsx` | `/divorce-flow` |
| `other-family-law-flow.json` | `OtherFamilyLawPage.jsx` | `/other` |

## Not live (do not edit for production copy)

| File | Why |
|------|-----|
| `Restraining-order.json` | Megamerge archive. `RestrainingOrderPage.jsx` fetches it but is **not routed** in `App.js`. Prefer per-type files above. |
| `build/data/*` | Build artifact only; never commit; rebuild after public edits. |

## Rules

1. One legal fix → one live file (the table above).  
2. Do not reintroduce copies under `src/data/`.  
3. After deploy, verify live content (e.g. triage has `CHRO` not `CRO`; DVTiming text matches `public/data`).
