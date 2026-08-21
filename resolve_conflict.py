import re

with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find conflict markers
pattern = r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> agent/biyanlu-translate'
m = re.search(pattern, content, re.DOTALL)

if not m:
    print("No conflict found!")
    exit(1)

head_part = m.group(1)  # yangqihoulu array: "  ],\n  yangqihoulu: [\n    ...\n  ],"
branch_part = m.group(2)  # new biyanlu entries + "  ]"

# head_part starts with "  ]," (closing biyanlu) then yangqihoulu
# branch_part is the new entries (with leading newline) ending with "  ]"

# We want: new entries + "  ]," + yangqihoulu
# branch_part has the new entries, but ends with "  ]" (no comma)
# head_part starts with "  ]," then "yangqihoulu: [..."

# Extract yangqihoulu from head_part (everything after the first "  ],")
head_lines = head_part.split('\n')
# First line is "  ]," - that's the closing of biyanlu
# Rest is yangqihoulu array
yangqi_lines = head_lines[1:]  # skip "  ],"

# branch_part: new entries, ends with "  ]"
# We need: branch entries + "  ]," + yangqihoulu
branch_entries = branch_part.strip()
if branch_entries.endswith(']'):
    branch_entries = branch_entries[:-1].rstrip() + '\n  ],'

# Combine
replacement = branch_entries + '\n' + '\n'.join(yangqi_lines)

# Replace conflict
content = content[:m.start()] + replacement + content[m.end():]

with open('lib/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Conflict resolved!")
print(f"Head part lines: {len(head_lines)}")
print(f"Branch entries length: {len(branch_entries)}")
