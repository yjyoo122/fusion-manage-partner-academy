"""Build self-contained HTML per language.
python tools/build.py ko [ja en] [--out DIR] [--pages] [--date YYYY-MM-DD]
--pages: language links point to ../<lang>/ (GitHub Pages layout)."""
import os, sys, json, base64, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'site')
ARGS = sys.argv[1:]
PAGES = '--pages' in ARGS
def opt(name, default=None):
    if name in ARGS:
        i = ARGS.index(name); v = ARGS[i + 1]; del ARGS[i:i + 2]; return v
    return default
OUT = opt('--out', OUT)
DATE = opt('--date', datetime.date.today().isoformat())
if PAGES: ARGS.remove('--pages')
VERSION = open(os.path.join(ROOT, 'VERSION'), encoding='utf-8').read().strip() if os.path.exists(os.path.join(ROOT, 'VERSION')) else '0'
LOGO = os.path.join(ROOT, 'src', 'assets', 'autodesk-logo-primary-rgb-white.svg')
os.makedirs(OUT, exist_ok=True)

def rd(p):
    return open(p, encoding='utf-8').read()

def load(lang):
    d = json.load(open(os.path.join(SRC, 'content', lang + '.json'), encoding='utf-8'))
    shared = os.path.join(SRC, 'content', lang + '.estimator.json')
    if os.path.exists(shared):
        d['estimator'] = json.load(open(shared, encoding='utf-8'))
    bld = os.path.join(SRC, 'content', lang + '.builder.json')
    if os.path.exists(bld):
        d['builder'] = json.load(open(bld, encoding='utf-8'))
    extra = os.path.join(SRC, 'content', lang + '.modules')
    if os.path.isdir(extra):
        mods = []
        for fn in sorted(os.listdir(extra)):
            if fn.endswith('.json'):
                mods.append(json.load(open(os.path.join(extra, fn), encoding='utf-8')))
        d['modules'] = mods
    return d

def build(lang):
    d = load(lang)
    m = d['meta']
    m['version'] = VERSION; m['date'] = DATE
    langs = []
    for l in m['langs']:
        href = f'../{l["code"]}/' if PAGES else l['file']
        if l['code'] == lang:
            langs.append(f'<a class="cur" href="{href}">{html.escape(l["label"])}</a>')
        elif os.path.exists(os.path.join(SRC, 'content', l['code'] + '.json')):
            langs.append(f'<a href="{href}">{html.escape(l["label"])}</a>')
        else:
            langs.append(f'<span class="na" title="{html.escape(m.get("soon", ""))}">{html.escape(l["label"])}</span>')
    t = rd(os.path.join(SRC, 'template.html'))
    data = json.dumps(d, ensure_ascii=False).replace('</', '<\\/')
    rep = {
        '{{LANG}}': lang, '{{TITLE}}': html.escape(m['title']), '{{PRODUCT}}': html.escape(m['product']),
        '{{SUBTITLE}}': html.escape(m['subtitle']), '{{SEARCH}}': html.escape(d['ui']['search']),
        '{{SAVE}}': html.escape(d['ui']['save']), '{{AUTOSAVE}}': html.escape(d['ui']['autosave']),
        '{{EXPORT}}': html.escape(d['ui']['export']), '{{IMPORT}}': html.escape(d['ui']['import']),
        '{{EXPHINT}}': html.escape(d['ui']['exportHint']), '{{BUILDER}}': html.escape(d['ui']['builderLink']),
        '{{LANGS}}': ''.join(langs), '{{VERSION}}': html.escape(d['ui'].get('versionLabel', 'v{v}').replace('{v}', VERSION).replace('{d}', DATE)), '{{CSS}}': rd(os.path.join(SRC, 'app.css')),
        '{{LOGO}}': base64.b64encode(open(LOGO, 'rb').read()).decode(),
    }
    for k, v in rep.items():
        t = t.replace(k, v)
    t = t.replace('{{DATA}}', data).replace('{{JS}}', rd(os.path.join(SRC, 'app.js')))
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'index.html' if PAGES else m['file'])
    open(out, 'w', encoding='utf-8').write(t)
    print('built', out, len(t) // 1024, 'KB,', len(d['modules']), 'modules')

for lang in (ARGS or ['ko']):
    build(lang)
