with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the first dahuiyulu: [
first_idx = content.find('  dahuiyulu: [')
# Find the second one
second_idx = content.find('  dahuiyulu: [', first_idx + 1)

if second_idx == -1:
    print("No duplicate found")
    exit(0)

print(f"First dahuiyulu at char {first_idx}")
print(f"Second dahuiyulu at char {second_idx}")

# Find the end of the second dahuiyulu section (its closing ],)
# and the };
second_end = content.find('\n};', second_idx)
if second_end == -1:
    print("Can't find end")
    exit(1)

# Remove from the second dahuiyulu: [ to just before };
# Keep the };
# The pattern is:  ],\n\n  dahuiyulu: [\n  ...  ],\n\n};
# We want:  ],\n\n};

# Find the ],\n before the second dahuiyulu
before_second = content.rfind('  ],', 0, second_idx)
# The text between before_second+4 and second_end should be removed
# We keep everything up to and including '  ],\n' (first section's close)
# Then skip to '\n};'

# Actually, simpler: remove from second_idx to second_end (exclusive)
# But we need to keep \n};

new_content = content[:second_idx] + content[second_end:]

with open('lib/translations.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify
with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    verify = f.read()

count = verify.count('dahuiyulu:')
print(f"dahuiyulu occurrences: {count}")
print(f"File ends with: {verify[-50:]}")
