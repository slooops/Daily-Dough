import json
import csv
from io import StringIO

json_data = """
[
    {
        "id": 1,
        "name": "Jack Sloop",
        "email": "jack.sloop@example.com"
    },
    {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane.doe@example.com"
    }
]
"""


def json_to_csv(json_string):
    """
    Converts a JSON string to a CSV string.
    """
    try:
        data = json.loads(json_string)
        if not data:
            return ""

        # We assume all objects in the list have the same keys
        headers = data[0].keys()

        # Use StringIO to handle the string as a file
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=headers)

        writer.writeheader()
        writer.writerows(data)

        return output.getvalue()
    except (json.JSONDecodeError, IndexError) as e:
        print(f"Error processing JSON: {e}")
        return ""


# Run the conversion
csv_output = json_to_csv(json_data)

# Print the CSV string to the console
print(csv_output)
