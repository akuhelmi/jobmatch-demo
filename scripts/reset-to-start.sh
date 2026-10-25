#!/usr/bin/env bash
# Demo reset (ATH-11 P6): put main's FILES back to the `demo-start` tag with ONE new commit.
# History is never rewritten (no force push). Pushing that commit is a normal push to main,
# which redeploys the start version. Run in the main checkout:  scripts/reset-to-start.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
TAG="${1:-demo-start}"

[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "switch to main first"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "the working tree has changes: commit or stash them first"; exit 1; }
git fetch -q origin 2>/dev/null && git merge -q --ff-only origin/main 2>/dev/null || true

if git diff --quiet "$TAG" HEAD; then
  echo "main already matches $TAG: nothing to reset"; exit 0
fi
git restore --source="$TAG" --staged --worktree -- :/
git commit -q -m "chore: reset demo to start ($TAG)"
echo "reset commit: $(git log -1 --format='%h %s')"
echo "next: push main (via /ship, a Go card) so CI redeploys the start version"
