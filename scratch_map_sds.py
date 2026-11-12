import json

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_doc_dump.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

content = data.get('body', {}).get('content', [])

sections = []
for idx, el in enumerate(content):
    p = el.get('paragraph')
    if not p:
        continue
    text = ''.join([pe.get('textRun', {}).get('content', '') for pe in p.get('elements', [])]).strip()
    
    if text in ('d. Database Queries', 'd. Database queries', 'Database Queries', 'Database queries'):
        start_char = el.get('endIndex')
        header_idx = idx
        
        # Find preceding feature header (looking backwards up to 60 elements)
        feature_name = "Unknown"
        for b in range(idx - 1, max(0, idx - 80), -1):
            bp = content[b].get('paragraph')
            if not bp:
                continue
            btext = ''.join([pe.get('textRun', {}).get('content', '') for pe in bp.get('elements', [])]).strip()
            # Look for e.g. "1.1 Login", "1.2 Register", "7.1 Create Playlist", etc.
            if len(btext) > 3 and btext[0].isdigit() and ('.' in btext[:5]) and not any(kw in btext for kw in ['SELECT', 'FROM', 'WHERE', 'JOIN']):
                # verify it's a heading-like feature
                if any(btext.startswith(f"{m}.") for m in range(1, 25)):
                    feature_name = btext
                    break
        
        # Look ahead for boundary
        last_sql_idx = idx
        for j in range(idx + 1, min(idx + 60, len(content))):
            jel = content[j]
            table = jel.get('table')
            if table:
                break
            jp = jel.get('paragraph')
            if not jp:
                continue
            jtext = ''.join([pe.get('textRun', {}).get('content', '') for pe in jp.get('elements', [])]).strip()
            
            is_boundary = False
            if len(jtext) > 2 and jtext[0].isdigit() and ('.' in jtext[:4]):
                if not any(kw in jtext for kw in ['SELECT', 'UPDATE', 'INSERT', 'DELETE', 'Query', 'Increment', 'Load', 'Check', 'Retrieve', 'Find', 'Count', 'Save', 'Create', 'Validate', 'Reset', 'Clear', 'Soft-delete']):
                    is_boundary = True
            if jtext.startswith('a. Class Diagram') or jtext.startswith('b. Class Specifications') or jtext.startswith('c. Sequence Diagram'):
                is_boundary = True
            if any(jtext.startswith(prefix) for prefix in ['USE CASE', 'III.', 'IV.', 'Record of Changes']):
                is_boundary = True
                
            if is_boundary:
                break
            else:
                if jtext:
                    last_sql_idx = j
                    
        end_char = content[last_sql_idx].get('endIndex') if last_sql_idx > idx else start_char
        
        sql_lines = []
        for k in range(idx + 1, last_sql_idx + 1):
            kp = content[k].get('paragraph')
            if kp:
                kt = ''.join([pe.get('textRun', {}).get('content', '') for pe in kp.get('elements', [])]).strip()
                if kt:
                    sql_lines.append(kt)
                    
        sections.append({
            'section_num': len(sections) + 1,
            'header_idx': header_idx,
            'feature': feature_name,
            'start_char': start_char,
            'end_char': end_char,
            'num_lines': len(sql_lines),
            'sample': sql_lines[0] if sql_lines else 'EMPTY',
            'lines': sql_lines
        })

with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_sections_mapped.json', 'w', encoding='utf-8') as f:
    json.dump(sections, f, indent=2, ensure_ascii=False)

print(f"Total sections mapped: {len(sections)}")
for s in sections:
    print(f"[{s['section_num']:02d}] {s['feature']} | Range [{s['start_char']}, {s['end_char']}] | {s['num_lines']} lines")
