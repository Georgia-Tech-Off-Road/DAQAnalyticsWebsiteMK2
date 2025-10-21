#!/bin/bash
# Support running from both repository root and scripts directory
if [ -d "Design Documents" ]; then
    BASE_DIR="."
else
    BASE_DIR=".."
fi

mkdir -p "$BASE_DIR/Design Documents/diagrams/generated"
for file in "$BASE_DIR/Design Documents/diagrams"/*.mmd; do
	if [ -f "$file" ]; then
		filename=$(basename "$file" .mmd)
		mmdc -i "$file" -o "$BASE_DIR/Design Documents/diagrams/generated/${filename}.svg"
		mmdc -i "$file" -o "$BASE_DIR/Design Documents/diagrams/generated/${filename}.png" -s 4
	fi
done

echo "Diagram generation complete"
