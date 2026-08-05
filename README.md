# Consumer Credit Default Risk & Portfolio Monitoring

Status: a full-record academic analyst workspace is built locally. The currently deployed site remains the prior aggregate-only showcase until a separately verified deployment replaces it.

## Project

- Decision owner: credit-risk analyst exploring licensed academic source records; no automated decision is made.
- Data boundary: UCI Default of Credit Card Clients, CC BY 4.0. The full licensed source rows are authorized for the read-only analyst workspace; demographic fields remain excluded from model inputs and recommendations.
- First demo: Generate the full source-record artifact, search and filter all 30,000 rows, inspect each record, then review the separate model-evaluation evidence.

Read `AGENTS.md` and `.project/` before contributing.

## Run locally

```bash
uv sync
uv run python scripts/run_evaluation.py
uv run python scripts/build_release.py --revision <immutable-git-sha>
uv run python scripts/build_public_dataset.py
```

Before an approved deployment, follow [the pre-release checklist](docs/RELEASE-CHECKLIST.md): the local gate and a green GitHub Actions quality run for the same SHA are both mandatory.

The local workspace serves the full approved UCI source artifact and does not make individual credit decisions. See `docs/DEPLOYMENT.md` for the current release procedure and `docs/NEXT-MILESTONE-PLAN.md` for the approved roadmap.
