# Phase 0b Backend Deployment Guide

## Prerequisites

- AWS account with S3 + Lambda access
- Vercel project connected to GitHub
- Neon PostgreSQL instance (via Supabase)
- Supabase project configured

## 1. Enable TimescaleDB on Neon

### Step 1a: Enable Extension
```bash
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

### Step 1b: Run Migration
```bash
# Connect to your Neon database
psql $DATABASE_URL -f lib/db/migrations/timeseries-migration.sql
```

**What it creates:**
- `telemetry_metrics` hypertable (partitioned by day)
- `telemetry_1m` continuous aggregate (1-minute buckets)
- Compression policies (auto-compress 30+ day data)
- Indexes for query performance

## 2. Configure AWS S3

### Step 2a: Create S3 Bucket
```bash
aws s3api create-bucket \
  --bucket motorsportsdata-device-imports \
  --region us-east-1
```

### Step 2b: Enable Event Notifications
```bash
aws s3api put-bucket-notification-configuration \
  --bucket motorsportsdata-device-imports \
  --notification-configuration '{
    "LambdaFunctionConfigurations": [{
      "LambdaFunctionArn": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:device-parser",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {"Key": {"FilterRules": [{"Name": "prefix", "Value": "uploads/"}]}}
    }]
  }'
```

### Step 2c: Add IAM Permissions
```bash
# Add to Lambda execution role
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::motorsportsdata-device-imports/*"
    }
  ]
}
```

## 3. Deploy Lambda Function

### Step 3a: Package Function
```bash
cd lib/lambda
npm install --production
zip -r device-parser.zip .
```

### Step 3b: Create Lambda Function
```bash
aws lambda create-function \
  --function-name device-parser \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler device-parser-handler.deviceParserHandler \
  --zip-file fileb://device-parser.zip \
  --environment Variables="{DATABASE_URL=$DATABASE_URL}"
```

### Step 3c: Grant S3 Permission
```bash
aws lambda add-permission \
  --function-name device-parser \
  --statement-id AllowS3 \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::motorsportsdata-device-imports
```

## 4. Set Environment Variables

Add to Vercel project settings:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=motorsportsdata-device-imports
DATABASE_URL=postgresql://<neon-url>
```

## 5. Enable WebSocket Streaming

### Step 5a: Deploy WebSocket API (Optional - Vercel Functions)
WebSockets are already built into `lib/websocket/telemetry-stream.ts`. 
For production, you can upgrade to Vercel's realtime features or use a dedicated service like Ably.

### Step 5b: Wire into Dashboard
```typescript
// In your dashboard component:
import { telemetryStreamManager } from '@/lib/websocket/telemetry-stream'

useEffect(() => {
  const unsubscribe = telemetryStreamManager.subscribe(
    sessionId,
    riderId,
    (message) => {
      console.log('Live metric:', message.data)
      setLiveMetrics(message.data)
    }
  )

  return unsubscribe
}, [sessionId, riderId])
```

## 6. Testing

### Test S3 Upload
```bash
aws s3 cp test-telemetry.csv s3://motorsportsdata-device-imports/uploads/
# Lambda should trigger automatically
```

### Test TimescaleDB Queries
```bash
psql $DATABASE_URL -c "
  SELECT time_bucket('1 minute', timestamp) as time_window, 
         AVG(heart_rate) as hr_avg, 
         COUNT(*) as sample_count
  FROM telemetry_metrics
  GROUP BY time_window
  ORDER BY time_window DESC LIMIT 10;
"
```

### Test API Endpoints
```bash
curl "https://motorsportsdata.io/api/telemetry/metrics?sessionId=demo&riderId=rider-1&startTime=2026-07-01T00:00:00Z&endTime=2026-07-10T23:59:59Z"
```

## 7. Monitor & Maintain

### Check TimescaleDB Stats
```bash
psql $DATABASE_URL -c "
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Monitor Lambda Executions
```bash
aws cloudwatch tail /aws/lambda/device-parser --follow
```

### Monitor S3 Costs
```bash
aws ce get-cost-and-usage \
  --time-period Start=2026-07-01,End=2026-07-31 \
  --granularity DAILY \
  --metrics "BlendedCost" \
  --filter file://filter.json \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 8. Scale Considerations

- **TimescaleDB**: Auto-partitions by day. Compression kicks in at 30 days → 90% storage savings
- **Lambda**: Async timeout set to 900s. For longer parsing, use SQS queues
- **S3**: Use lifecycle policies to archive old files to Glacier after 90 days

## Next Steps

1. ✓ Enable TimescaleDB (1 SQL command)
2. ✓ Configure S3 bucket
3. ✓ Deploy Lambda function
4. ✓ Set environment variables
5. ✓ Test end-to-end
6. ✓ Monitor live metrics

**Estimated time: 30 minutes**

