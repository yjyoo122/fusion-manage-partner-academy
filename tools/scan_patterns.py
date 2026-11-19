"""Pre-publish privacy gate.

Usage: python tools/scan_patterns.py src site [--denylist path/to/denylist.txt]

Always checks: currency amounts, email addresses, opportunity/contract-like numbers,
tenant URLs. Optionally checks a LOCAL denylist of names (one term per line). The
denylist must never be committed; keep it outside the repo or in a .gitignored path.
Exit code 1 if anything is found.
"""
import os, re, sys

PATTERNS = {
    'currency': re.compile(r'([£$€¥₩]\s?\d[\d,.]*(?![\d,.]*[\'"<])\s?[kKmM]?|\b\d[\d,.]*\s?(GBP|USD|EUR|JPY|KRW|INR|AUD)\b|\b(GBP|USD|EUR|JPY|KRW|INR|AUD)\s?\d)'),
    'email': re.compile(r'[\w.+-]+@[\w-]+\.[\w.]+'),
    'opp/contract no.': re.compile(r'\bACT-\d+|\b[A-Z]{2}\d{2}[A-Z]{3}\d{3}\b|\bPO\s?#?\d{5,}'),
    'tenant url': re.compile(r'\b[\w-]+\.autodeskplm360\.net|\bplm360\b', re.I),
}

args = sys.argv[1:]
deny = []
if '--denylist' in args:
    i = args.index('--denylist')
    deny = [t for t in open(args[i + 1], encoding='utf-8').read().splitlines() if t.strip()]
    del args[i:i + 2]
rx_deny = re.compile('(?<![\\w-])(' + '|'.join(map(re.escape, sorted(deny, key=len, reverse=True))) + ')(?![\\w-])') if deny else None

files = []
for a in args:
    for dp, _, fns in os.walk(a) if os.path.isdir(a) else [(os.path.dirname(a), None, [os.path.basename(a)])]:
        files += [os.path.join(dp, f) for f in fns if f.endswith(('.md', '.html', '.json', '.js', '.txt', '.css', '.py'))]
total = 0
for f in files:
    for n, line in enumerate(open(f, encoding='utf-8', errors='replace'), 1):
        hits = [(k, m.group(0)) for k, rx in PATTERNS.items() for m in rx.finditer(line)]
        if rx_deny:
            hits += [('denylist', m.group(1)) for m in rx_deny.finditer(line)]
        for k, v in hits:
            total += 1
            print(f'{f}:{n} [{k}] {v}')
print('TOTAL HITS', total)
sys.exit(1 if total else 0)
