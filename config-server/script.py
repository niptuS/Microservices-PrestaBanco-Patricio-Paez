import json

with open("dependency-check-report.json", "r") as file:
  data = json.load(file)
if "cvssv4" in data:
  del data["cvssv4"]
with open("dependency-check-report.json", "w") as file:
              json.dump(data, file, indent=4)