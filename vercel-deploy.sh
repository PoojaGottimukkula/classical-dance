#!/bin/bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

echo "This will deploy the project to Vercel. If this is the first deploy you'll be prompted to login."
echo "Make sure you've replaced the backend placeholder in vercel.json or set the API_BASE environment variable in Vercel after deploy."

vercel --prod
