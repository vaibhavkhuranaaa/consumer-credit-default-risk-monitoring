# Handoff

## Next action

The deployment implementation is ready for M6 approval. Build a local aggregate release with `uv run python scripts/run_evaluation.py` followed by `uv run python scripts/build_release.py --revision <immutable-git-sha>`.

## Safety boundary

Do not initialize a remote repository, deploy, or make a credit decision claim. Keep raw data local, ignored by Git, and out of public artifacts.
