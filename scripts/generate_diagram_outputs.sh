#!/bin/bash
# Support running from both repository root and scripts directory
if [ -d "Design Documents" ]; then
    BASE_DIR="."
else
    BASE_DIR=".."
fi

# Use puppeteer config in CI environment, otherwise run normally
if [ "$CI" = "true" ]; then
    PUPPETEER_CONFIG="-p $BASE_DIR/puppeteer-config.json"
else
    PUPPETEER_CONFIG=""
fi

mkdir -p "$BASE_DIR/Design Documents/diagrams/generated"
for file in "$BASE_DIR/Design Documents/diagrams"/*.mmd; do
	if [ -f "$file" ]; then
		filename=$(basename "$file" .mmd)
		mmdc -i "$file" -o "$BASE_DIR/Design Documents/diagrams/generated/${filename}.svg" $PUPPETEER_CONFIG
		mmdc -i "$file" -o "$BASE_DIR/Design Documents/diagrams/generated/${filename}.png" -s 4 $PUPPETEER_CONFIG
	fi
done

echo "Diagram generation complete"
