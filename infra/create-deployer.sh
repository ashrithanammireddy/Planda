#!/usr/bin/env bash
# Usage: bash infra/create-deployer.sh <username>
# Example: bash infra/create-deployer.sh alice
set -e

USERNAME="${1:-planda-deployer}"
POLICY_NAME="PlandaDeployerPolicy"
REGION="us-east-1"

echo "==> Creating IAM user: $USERNAME"
aws iam create-user --user-name "$USERNAME"

echo "==> Creating IAM policy: $POLICY_NAME"
POLICY_ARN=$(aws iam create-policy \
  --policy-name "$POLICY_NAME" \
  --policy-document file://infra/deployer-policy.json \
  --query "Policy.Arn" \
  --output text)
echo "Policy ARN: $POLICY_ARN"

echo "==> Attaching policy to user"
aws iam attach-user-policy \
  --user-name "$USERNAME" \
  --policy-arn "$POLICY_ARN"

echo "==> Creating access key"
KEYS=$(aws iam create-access-key \
  --user-name "$USERNAME" \
  --output json)

ACCESS_KEY=$(echo "$KEYS" | python3 -c "import sys,json; d=json.load(sys.stdin)['AccessKey']; print(d['AccessKeyId'])")
SECRET_KEY=$(echo "$KEYS" | python3 -c "import sys,json; d=json.load(sys.stdin)['AccessKey']; print(d['SecretAccessKey'])")

echo ""
echo "============================================="
echo "Deployer user created: $USERNAME"
echo "---------------------------------------------"
echo "AWS_ACCESS_KEY_ID:     $ACCESS_KEY"
echo "AWS_SECRET_ACCESS_KEY: $SECRET_KEY"
echo "AWS_DEFAULT_REGION:    $REGION"
echo "============================================="
echo ""
echo "Share these credentials securely (never via email/Slack)."
echo "The user can deploy with:"
echo "  cd Planda-main && npm run build && bash infra/redeploy-app.sh"
