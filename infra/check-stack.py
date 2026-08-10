import subprocess, json

result = subprocess.run(
    ["aws", "cloudformation", "list-stacks",
     "--region", "us-east-1",
     "--stack-status-filter",
     "CREATE_COMPLETE", "UPDATE_COMPLETE", "CREATE_IN_PROGRESS",
     "DELETE_IN_PROGRESS", "DELETE_COMPLETE", "ROLLBACK_COMPLETE",
     "--output", "json"],
    capture_output=True, text=True
)
data = json.loads(result.stdout)
for s in data.get("StackSummaries", []):
    if "planda" in s["StackName"]:
        print(s["StackName"], "->", s["StackStatus"])
