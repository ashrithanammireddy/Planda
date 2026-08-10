#!/usr/bin/env bash
set -e
REGION="us-east-1"
STACK="planda-backend"
TEMPLATE="infra/planda-backend.yaml"

echo "==> Deploying CloudFormation stack: $STACK"
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
  --output table

echo "==> Saving outputs to infra/outputs.json"
aws cloudformation describe-stacks \
  --stack-name "$STACK" \
  --region "$REGION" \
  --query "Stacks[0].Outputs" \
  --output json > infra/outputs.json

echo "DONE"
