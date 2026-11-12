import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_queries_detail.json', 'r', encoding='utf-8') as f:
    details = json.load(f)

print(f"Total in sds_queries_detail: {len(details)}")
for i, item in enumerate(details):
    print(f"[{i+1:02d}] {item.get('use_case')} - {item.get('title')} | Range: {item.get('query_start')} to {item.get('query_end')}")
