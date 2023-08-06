import json

# Open the json file and load the data
with open('gods.json') as f:
    data = json.load(f)

# Extract the IDs and store them in a list
ids = [item['id'] for item in data]

# Save the IDs into a new JSON file
with open('godids.json', 'w') as f:
    json.dump(ids, f)