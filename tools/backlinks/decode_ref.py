import json

with open('tools/backlinks/reference_publisher.py', 'r', encoding='utf-8') as f:
    first_line = f.readline().strip()

if first_line.startswith('"') and first_line.endswith('"'):
    decoded = json.loads(first_line)
else:
    # try parsing raw escape sequences
    decoded = first_line.encode('utf-8').decode('unicode_escape')

with open('tools/backlinks/clean_ref.py', 'w', encoding='utf-8') as f:
    f.write(decoded)

print("Saved clean_ref.py successfully, length:", len(decoded))
