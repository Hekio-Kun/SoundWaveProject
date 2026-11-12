import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_sections_mapped.json', 'r', encoding='utf-8') as f:
    sds_sections = json.load(f)

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_v2_payloads.json', 'r', encoding='utf-8') as f:
    payloads = json.load(f)

unmatched_doc = []
for s in sds_sections:
    feat = s['feature']
    if feat not in payloads:
        unmatched_doc.append(feat)

unmatched_payload = []
doc_feats = [s['feature'] for s in sds_sections]
for p in payloads:
    if p not in doc_feats:
        unmatched_payload.append(p)

print(f"Unmatched in Doc: {unmatched_doc}")
print(f"Unmatched in Payloads: {unmatched_payload}")
if not unmatched_doc and not unmatched_payload:
    print("PERFECT 100% 1-TO-1 MATCH!")
