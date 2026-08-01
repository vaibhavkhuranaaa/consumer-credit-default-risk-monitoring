# Consumer Credit Default Risk & Portfolio Monitoring

Status: deployment implementation prepared; public provisioning is blocked pending M6 approval. This is an evidence-led retrospective benchmark workflow.

## Project

- Decision owner: define in `PROJECT.md`.
- Data boundary: UCI Default of Credit Card Clients, CC BY 4.0, downloaded only after recorded approval. No direct identifiers. Demographic fields are excluded from model inputs and may be used only in a documented fairness audit.
- First demo: Load a checksum-pinned dataset release, run time-safe baseline and challenger models, review calibration, threshold trade-offs, fairness diagnostics, data-quality controls, and an aggregate portfolio-risk queue.

Read `AGENTS.md` and `.project/` before contributing.

## Run locally

```bash
uv sync
uv run python scripts/run_evaluation.py
uv run python scripts/build_release.py --revision <immutable-git-sha>
```

The deployed architecture uses Cloudflare Pages/Functions and Neon Postgres, serving aggregate retrospective evidence only. It does not make individual credit decisions and never exposes raw account rows. See `docs/DEPLOYMENT.md` for the approval-gated release procedure.
