import json
import re
import sys


def parse_start_id(start_id):
    """Extracts the prefix, numeric value, and padding width from an ID like 'cake-0473'."""
    match = re.match(r"^(.*?)(\d+)$", start_id)
    if not match:
        raise ValueError(
            f"Invalid ID format: '{start_id}'. Must end with numbers (e.g., 'cake-0473')."
        )
    prefix = match.group(1)
    num_str = match.group(2)
    return prefix, int(num_str), len(num_str)


def process_json(input_file, output_file, start_id):
    prefix, start_num, width = parse_start_id(start_id)

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated_data = []
    for index, item in enumerate(data):
        # Create a copy without the 'additional' field
        new_item = {k: v for k, v in item.items() if k != "additional"}

        # Generate incremented ID maintaining original zero-padding
        current_num = start_num + index
        new_item["id"] = f"{prefix}{current_num:0{width}d}"

        updated_data.append(new_item)

    # Write transformed array to new JSON file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)

    print(
        f"Successfully processed {len(updated_data)} items saved to '{output_file}'."
    )


if __name__ == "__main__":
    # Default starting ID if none provided in terminal
    start_id_param = sys.argv[1] if len(sys.argv) > 1 else "cake-0473"
    process_json("data.json", "output.json", start_id_param)