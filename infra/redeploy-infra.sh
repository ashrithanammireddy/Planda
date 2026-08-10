#!/usr/bin/env bash
set -e
REGION="us-east-1"
STACK="planda-backend"
TEMPLATE="infra/planda-backend.yaml"

echo "==> Deleting failed stack (ROLLBACK_COMPLETE)"
aws cloudformation delete-stack --stack-name "$STACK" --region "$REGION"
echo "==> Waiting for deletion..."
aws cloudformation wait stack-delete-complete --stack-name "$STACK" --region "$REGION"
echo "==> Stack deleted. Deploying fresh..."

aws cloudformation deploy \
  --template-file "$TEMPLATE" \
  --stack-name "$STACK" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "$REGION"

echo "==> Fetching stack outputs"
aws cloudformation describe-stacks \
  --stack-name "$STACK" \
  --region "$REGION" \
  --query "Stacks[0].Outputs" \
  --output json > infra/outputs.json

cat infra/outputs.json
echo ""
echo "DONE"
