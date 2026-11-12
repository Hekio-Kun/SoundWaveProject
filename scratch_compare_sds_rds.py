import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_sections_mapped.json', 'r', encoding='utf-8') as f:
    sds_sections = json.load(f)

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\v2_queries_dict.json', 'r', encoding='utf-8') as f:
    rds_queries = json.load(f)

print(f"SDS has {len(sds_sections)} sections.")
print(f"RDS has {len(rds_queries)} query keys.")

for s in sds_sections:
    feat = s['feature']
    num = s['section_num']
    lines = s['lines']
    # Check what kind of content currently exists
    print(f"[{num:02d}] {feat} ({len(lines)} lines)")
