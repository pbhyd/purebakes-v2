import json
import os
import subprocess

# Name of your JSON file
JSON_FILENAME = "data.json"


def convert_images():
    if not os.path.exists(JSON_FILENAME):
        print(f"Error: {JSON_FILENAME} not found.")
        return

    with open(JSON_FILENAME, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        raw_id = item.get("id", "")
        image_field = item.get("image", "")

        if not raw_id or not image_field:
            continue

        # Replace 1024.jpg (and leading hyphen if present) with .png
        input_image = raw_id.replace("-1024.jpg", ".png").replace(
            "1024.jpg", ".png"
        )

        # Replace target directory path with local directory path
        output_image = image_field.replace("/assets/images/cakes/", "./")

        # Skip conversion if the source PNG file does not exist locally
        if not os.path.exists(input_image):
            print(f"Skipping {input_image}: File not found.")
            continue

        # Construct and run the cwebp command
        command = ["cwebp", "-q", "80", input_image, "-o", output_image]

        print(f"Converting: {input_image} -> {output_image}")
        try:
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to convert {input_image}: {e}")
        except FileNotFoundError:
            print(
                "Error: 'cwebp' command not found. Ensure WebP tools are installed."
            )
            break


if __name__ == "__main__":
    convert_images()