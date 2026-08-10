import subprocess, json, sys

result = subprocess.run(
    ["aws", "cloudformation", "describe-stack-events",
     "--stack-name", "planda-backend",
     "--region", "us-east-1",
     "--output", "json"],
    capture_output=True, text=True
)
data = json.loads(result.stdout)
for e in data.get("StackEvents", []):
    status = e.get("ResourceStatus", "")
    if "FAIL" in status or "ROLLBACK" in status:
        print(f"{e.get('LogicalResourceId')} | {status} | {e.get('ResourceStatusReason','')}")
