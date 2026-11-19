"""Validate module JSON files for a language: python validate.py ko"""
import os, sys, json, re

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'content')
lang = sys.argv[1] if len(sys.argv) > 1 else 'ko'
mdir = os.path.join(ROOT, lang + '.modules')
TYPES = {'sec', 'lead', 'p', 'h', 'list', 'table', 'callout', 'steps', 'stats', 'bars', 'gantt', 'flow', 'tiles', 'checklist', 'details', 'template', 'raci', 'quiz', 'estimator', 'builder'}
errs, warns = [], []
mods, ids, ckids = [], set(), set()
for fn in sorted(os.listdir(mdir)):
    if not fn.endswith('.json'):
        continue
    try:
        m = json.load(open(os.path.join(mdir, fn), encoding='utf-8'))
    except Exception as e:
        errs.append(f'{fn}: JSON error {e}'); continue
    mods.append((fn, m))
    for k in ('id', 'num', 'group', 'title', 'short', 'goal', 'blocks'):
        if k not in m:
            errs.append(f'{fn}: missing {k}')
    if m.get('id') in ids:
        errs.append(f'{fn}: duplicate id {m.get("id")}')
    ids.add(m.get('id'))
    if m.get('title', '').count('*') not in (0, 2):
        warns.append(f'{fn}: title asterisks {m.get("title")}')
    if len(m.get('short', '')) > 14:
        warns.append(f'{fn}: short label long ({len(m["short"])})')

links = []
def walk(fn, blocks, path='blocks'):
    for i, b in enumerate(blocks):
        t = b.get('t')
        p = f'{path}[{i}]'
        if t not in TYPES:
            errs.append(f'{fn} {p}: unknown type {t}'); continue
        s = json.dumps(b, ensure_ascii=False)
        links.extend((fn, x) for x in re.findall(r'\[\[([\w-]+)\|', s))
        if t == 'table':
            n = len(b.get('head', []))
            for r in b.get('rows', []):
                if len(r) != n:
                    errs.append(f'{fn} {p}: row has {len(r)} cells, head {n}: {str(r)[:60]}')
        if t == 'quiz':
            for q in b.get('items', []):
                if not (0 <= q.get('answer', -1) < len(q.get('options', []))):
                    errs.append(f'{fn} {p}: quiz answer out of range: {q.get("q", "")[:40]}')
        if t == 'gantt':
            n = len(b.get('cols', []))
            for r in b.get('rows', []):
                if r.get('start', 0) + r.get('len', 1) > n or r.get('len', 1) < 1:
                    errs.append(f'{fn} {p}: gantt bar out of range: {r.get("label")}')
        if t == 'bars':
            if sum(1 for x in b.get('items', []) if x.get('hi')) > 1:
                warns.append(f'{fn} {p}: more than one hi bar')
            if any(not isinstance(x.get('value'), (int, float)) for x in b.get('items', [])):
                errs.append(f'{fn} {p}: bar value not numeric')
        if t == 'checklist':
            if b.get('id') in ckids:
                errs.append(f'{fn} {p}: duplicate checklist id {b.get("id")}')
            ckids.add(b.get('id'))
        if t == 'raci':
            n = len(b.get('roles', []))
            for r in b.get('rows', []):
                if len(r) != n + 1:
                    errs.append(f'{fn} {p}: raci row width {len(r)} vs roles {n}+1')
        if t == 'stats' and len(b.get('items', [])) > 5:
            warns.append(f'{fn} {p}: stats > 5 items')
        if t == 'details':
            for j, d in enumerate(b.get('items', [])):
                walk(fn, d.get('blocks', []), f'{p}.items[{j}]')

for fn, m in mods:
    walk(fn, m.get('blocks', []))
    if not any(b.get('t') == 'quiz' for b in m.get('blocks', [])):
        warns.append(f'{fn}: no quiz')
for fn, l in links:
    if l not in ids:
        warns.append(f'{fn}: link to missing module [[{l}]]')
print(f'{len(mods)} modules: {", ".join(m["id"] for _, m in mods)}')
for e in errs: print('ERROR', e)
for w in warns: print('warn ', w)
print('OK' if not errs else f'{len(errs)} errors')
