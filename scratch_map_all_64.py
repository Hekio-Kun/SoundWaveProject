import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_sections_mapped.json', 'r', encoding='utf-8') as f:
    sds_sections = json.load(f)

for s in sds_sections:
    feat = s['feature']
    num = s['section_num']
    lines = s['lines']
    # Show first 2 non-empty lines
    sample = " // ".join([l.strip() for l in lines[:3] if l.strip()])[:100]
    print(f"[{num:02d}] {feat:<35} | {len(lines):<2} lines | {sample}")
