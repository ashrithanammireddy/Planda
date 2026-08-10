#!/usr/bin/env bash
set -e

BUCKET="planda-app-354918385601"
REGION="us-east-1"
ACCOUNT_ID="354918385601"
DIST_DIR="dist"

echo "==> [1/5] Block public S3 access"
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
  --region "$REGION"

echo "==> [2/5] Create CloudFront Origin Access Control"
OAC_ID=$(aws cloudfront create-origin-access-control \
  --origin-access-control-config \
    "Name=planda-oac,OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4,Description=Planda OAC" \
  --query 'OriginAccessControl.Id' --output text 2>/dev/null || \
  aws cloudfront list-origin-access-controls \
    --query "OriginAccessControlList.Items[?Name=='planda-oac'].Id | [0]" --output text)
echo "OAC ID: $OAC_ID"

echo "==> [3/5] Create CloudFront distribution"
CF_DIST=$(aws cloudfront create-distribution --distribution-config "{
  \"CallerReference\": \"planda-$(date +%s)\",
  \"Comment\": \"Planda App\",
  \"DefaultRootObject\": \"index.html\",
  \"Origins\": {
    \"Quantity\": 1,
    \"Items\": [{
      \"Id\": \"planda-s3\",
      \"DomainName\": \"${BUCKET}.s3.${REGION}.amazonaws.com\",
      \"S3OriginConfig\": {\"OriginAccessIdentity\": \"\"},
      \"OriginAccessControlId\": \"${OAC_ID}\"
    }]
  },
  \"DefaultCacheBehavior\": {
    \"TargetOriginId\": \"planda-s3\",
    \"ViewerProtocolPolicy\": \"redirect-to-https\",
    \"AllowedMethods\": {\"Quantity\": 2, \"Items\": [\"GET\", \"HEAD\"]},
    \"CachePolicyId\": \"658327ea-f89d-4fab-a63d-7e88639e58f6\",
    \"Compress\": true
  },
  \"CustomErrorResponses\": {
    \"Quantity\": 2,
    \"Items\": [
      {\"ErrorCode\": 403, \"ResponseCode\": \"200\", \"ResponsePagePath\": \"/index.html\", \"ErrorCachingMinTTL\": 0},
      {\"ErrorCode\": 404, \"ResponseCode\": \"200\", \"ResponsePagePath\": \"/index.html\", \"ErrorCachingMinTTL\": 0}
    ]
  },
  \"Enabled\": true,
  \"HttpVersion\": \"http2and3\",
  \"PriceClass\": \"PriceClass_100\"
}")

CF_ID=$(echo "$CF_DIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['Distribution']['Id'])")
CF_DOMAIN=$(echo "$CF_DIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['Distribution']['DomainName'])")
echo "CloudFront ID: $CF_ID"
echo "CloudFront Domain: $CF_DOMAIN"

echo "==> [4/5] Attach S3 bucket policy (allow CloudFront OAC)"
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"AllowCloudFrontOAC\",
    \"Effect\": \"Allow\",
    \"Principal\": {\"Service\": \"cloudfront.amazonaws.com\"},
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::${BUCKET}/*\",
    \"Condition\": {\"StringEquals\": {\"AWS:SourceArn\": \"arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${CF_ID}\"}}
  }]
}"

echo "==> [5/5] Upload build to S3"
aws s3 sync "$DIST_DIR/" "s3://${BUCKET}/" --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"
aws s3 cp "$DIST_DIR/index.html" "s3://${BUCKET}/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"

echo ""
echo "========================================="
echo "Planda is deploying!"
echo "URL: https://${CF_DOMAIN}"
echo "Note: CloudFront takes ~5-10 min to fully propagate."
echo "========================================="

# Save for reference
echo "CF_ID=$CF_ID" > .deploy-info
echo "CF_DOMAIN=$CF_DOMAIN" >> .deploy-info
echo "BUCKET=$BUCKET" >> .deploy-info
