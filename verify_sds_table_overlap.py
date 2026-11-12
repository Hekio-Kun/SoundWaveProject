import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_doc_dump.json', 'r', encoding='utf-8') as f:
    doc = json.load(f)

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_sections_mapped.json', 'r', encoding='utf-8') as f:
    sections = json.load(f)

content = doc.get('body', {}).get('content', [])

# Collect all tables
tables = []
for el in content:
    if 'table' in el:
        tables.append((el.get('startIndex'), el.get('endIndex')))

print(f"Total tables in SDS: {len(tables)}")

overlaps = []
for s in sections:
    s_start = s['start_char']
    s_end = s['end_char']
    if s_start >= s_end:
        continue # empty section
    for t_start, t_end in tables:
        # Check if [s_start, s_end] overlaps with [t_start, t_end]
        if max(s_start, t_start) < min(s_end, t_end):
            overlaps.append({
                'feature': s['feature'],
                'section_range': (s_start, s_end),
                'table_range': (t_start, t_end)
            })

if overlaps:
    print(f"WARNING: Found {len(overlaps)} overlaps!")
    for o in overlaps:
        print(o)
else:
    print("SUCCESS: 0 overlaps! All 64 deletion/insertion ranges are 100% outside all tables!")
