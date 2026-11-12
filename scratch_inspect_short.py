import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_sections_mapped.json', 'r', encoding='utf-8') as f:
    sds_sections = json.load(f)

print(f"Total sections: {len(sds_sections)}")

# Let's inspect sections that had 0 lines or very few lines
for s in sds_sections:
    if s['num_lines'] < 5:
        print(f"Few lines: [{s['section_num']:02d}] {s['feature']} -> {s['num_lines']} lines: {s['lines']}")
