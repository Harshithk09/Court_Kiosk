# Deploy verification — what is actually live?

Git `main` is not production until Render (backend) and Vercel (frontend) are redeployed.

## Quick probes (run after every deploy)

```bash
# Backend fingerprint (new builds expose git_sha + kiosk_key_required)
curl -s https://court-kiosk.onrender.com/api/health | jq .

# Queue must NOT include user_name / user_email / phone_number on public /api/queue
curl -s https://court-kiosk.onrender.com/api/queue | jq '.queue[0] // .'

# Frontend content: triage should have CHRO (not CRO); DVTiming should mention "resources allow"
curl -s https://court-kiosk.vercel.app/data/restraining-order-triage.json | jq 'has("nodes") and (.nodes|has("CHRO"))'
curl -s https://court-kiosk.vercel.app/data/dv_flow_combined.json | jq -r '.nodes.DVTiming.text' | head -c 120; echo
```

Expected after security + flow commits are live:

- `/api/health` includes `git_sha` (not missing / not only `{"status":"OK"}`)
- Public queue keys: `queue_number`, `case_type`, `priority`, `timestamp`, `language`, `status` only
- FE triage: `"CHRO": true` equivalent; no `"CRO"` node
- FE DVTiming: not the old “before noon / same day” wording

## Render (backend) env — required for today’s fixes to be real

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Session signing (never use the code default in prod) |
| `ADMIN_PASSWORD` | Bootstrap admin if none exists (`ADMIN_USERNAME` / `ADMIN_EMAIL` optional) |
| `KIOSK_API_KEY` | Shared secret; when set, kiosk write/LLM routes require `X-Kiosk-Key` |
| `CORS_ORIGINS` | Comma-separated allowlist, e.g. `https://court-kiosk.vercel.app` |
| `OPENAI_API_KEY` | LLM |
| `RESEND_API_KEY` / `RESEND_FROM_*` / `FACILITATOR_EMAIL` | Email |
| `DATABASE_URL` | Postgres in production |

Auto: `RENDER_GIT_COMMIT` is set by Render and returned from `/api/health`.

## Vercel (frontend) env

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | `https://court-kiosk.onrender.com` |
| `REACT_APP_KIOSK_API_KEY` | Same value as Render `KIOSK_API_KEY` |

Redeploy both sides after setting secrets. Setting env alone does not update an already-built CRA bundle or a sleeping Render instance until it pulls new code.
