# Consumer Credit Default Risk & Portfolio Monitoring

Status: a governed academic analyst workspace is built locally. The currently deployed site remains the prior full-record explorer until a separately approved and verified deployment replaces it.

## Project

- Decision owner: credit-risk analyst exploring licensed academic source records; no automated decision is made.
- Data boundary: UCI Default of Credit Card Clients, CC BY 4.0. The public artifact contains non-demographic research fields; demographics remain local and are used only in the aggregate fairness audit.
- First demo: Generate the governed 30,000-row artifact, explore historical cohorts, simulate review capacity, inspect model evidence, and exercise the fail-closed availability state.

Read `AGENTS.md` and `.project/` before contributing.

## Run locally

```bash
uv sync
uv run python scripts/run_evaluation.py
uv run python scripts/build_release.py --revision <immutable-git-sha>
uv run python scripts/build_public_dataset.py
```

Before an approved deployment, follow [the pre-release checklist](docs/RELEASE-CHECKLIST.md): the local gate and a green GitHub Actions quality run for the same SHA are both mandatory.

The local workspace serves the approved non-demographic UCI research artifact and does not make individual credit decisions. See `docs/DEPLOYMENT.md` for the current release procedure and `docs/NEXT-MILESTONE-PLAN.md` for the approved roadmap.
