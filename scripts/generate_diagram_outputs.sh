#!/bin/bash
mkdir -p ../"Design Documents"/diagrams/generated
for file in ../"Design Documents"/diagrams/*.mmd; do
	if [ -f "$file" ]; then
		filename=$(basename "$file" .mmd)
		mmdc -i "$file" -o "../Design Documents/diagrams/generated/${filename}.svg"
		mmdc -i "$file" -o "../Design Documents/diagrams/generated/${filename}.png" -s 4
	fi
done

echo "Diagram generation complete"
