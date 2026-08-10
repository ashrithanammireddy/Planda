#!/usr/bin/env bash
set -e
BUCKET="planda-app-354918385601"
CF_ID="EKH9EWMWD06M1"
DIST="dist"

echo "==> Syncing assets (immutable cache)..."
aws s3 sync "$DIST/" "s3://${BUCKET}/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

echo "==> Uploading index.html (no-cache)..."
aws s3 cp "$DIST/index.html" "s3://${BUCKET}/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"

echo "==> Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id "$CF_ID" \
  --paths "/*" \
  --output json | python3 -c "import sys,json; d=json.load(sys.stdin); print('Invalidation:', d['Invalidation']['Id'], '|', d['Invalidation']['Status'])"

echo ""
echo "Done! https://d1i1jwj5ohdhy5.cloudfront.net"
