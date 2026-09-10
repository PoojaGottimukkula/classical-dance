#!/bin/bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 git@github.com:username/repo.git  OR https://github.com/username/repo.git"
  exit 1
fi

REMOTE_URL="$1"

if [ ! -d .git ]; then
  git init
fi
git add .
git commit -m "Initial commit: Classical Dance Tutor" || true
git branch -M main || true
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
echo "Pushing to $REMOTE_URL (you may be prompted for credentials)..."
git push -u origin main

echo "Done. Now connect the repository in Vercel or run ./vercel-deploy.sh if you have the Vercel CLI installed."
