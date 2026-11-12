import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_sections_mapped.json', 'r', encoding='utf-8') as f:
    sections = json.load(f)

for s in sections[:5]:
    print(f"=== {s['feature']} ===")
    for line in s['lines'][:6]:
        print("  ", line)
    print("...")
