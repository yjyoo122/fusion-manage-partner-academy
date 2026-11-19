"""Generate docs/index.html (GitHub Pages landing page).
python tools/landing.py [--date YYYY-MM-DD]"""
import os, sys, json, base64, html, datetime, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'docs')
REPO = 'https://github.com/yjyoo122/fusion-manage-partner-academy'
LOGO = os.path.join(ROOT, 'src', 'assets', 'autodesk-logo-primary-rgb-white.svg')
args = sys.argv[1:]
DATE = args[args.index('--date') + 1] if '--date' in args else datetime.date.today().isoformat()
VERSION = open(os.path.join(ROOT, 'VERSION'), encoding='utf-8').read().strip()
ko = json.load(open(os.path.join(ROOT, 'src', 'content', 'ko.json'), encoding='utf-8'))
L, DS = ko['landing'], ko['meta']['disclaimer']
e = html.escape

def md(s):
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', e(s))

langs = []
for l in ko['meta']['langs']:
    if os.path.exists(os.path.join(DOCS, l['code'], 'index.html')):
        langs.append(f'<a class="go" href="{l["code"]}/">{e(l["label"])} →</a>')
    else:
        langs.append(f'<span class="na">{e(l["label"])} · {e(L["soon"])}</span>')

arch = []
ad = os.path.join(DOCS, 'archive')
if os.path.isdir(ad):
    for v in sorted(os.listdir(ad), key=lambda x: int(re.sub(r'\D', '', x) or 0), reverse=True):
        for l in ko['meta']['langs']:
            if os.path.exists(os.path.join(ad, v, l['code'], 'index.html')):
                arch.append(f'<a href="archive/{v}/{l["code"]}/">{e(v)} · {e(l["label"])}</a>')

title_html = e(L['title'])
dt = e(DS['title']).replace('*', '')
page = f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(L["title"])} · v{e(VERSION)}</title>
<meta name="robots" content="noindex">
<style>
:root{{--k:#000;--w:#fff;--y:#FFFF00;--ws:#F5F5F0;--sl:#666;--sl2:#C9C9C9;--d:#D34621}}
*{{box-sizing:border-box}}body{{margin:0;font-family:"Artifakt Element","Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",Arial,sans-serif;color:var(--k);background:var(--w);line-height:1.6;word-break:keep-all}}
.top{{background:var(--k);color:var(--w);padding:40px 64px 48px}}
.top img{{width:160px;display:block}}
.top .k{{margin-top:40px;font-size:13px;letter-spacing:.08em;color:var(--sl2)}}
.top h1{{font-family:"Artifakt Legend","Artifakt Element","Noto Sans KR","Malgun Gothic",Arial,sans-serif;font-size:48px;line-height:56px;margin:8px 0 12px}}
.top p{{margin:0;color:#E8E8E8;font-size:18px}}
.ver{{display:inline-block;margin-top:20px;color:var(--y);font-weight:700}}
.warn{{background:var(--y);color:var(--k);padding:12px 64px;font-weight:700;font-size:14px}}
main{{padding:40px 64px;max-width:1040px}}
.go{{display:inline-block;background:var(--k);color:var(--w);text-decoration:none;font-weight:700;font-size:20px;padding:16px 28px;border-radius:4px;margin:0 12px 12px 0}}
.go:hover{{background:#222}}
.na{{display:inline-block;padding:16px 20px;border:1px dashed var(--sl2);color:var(--sl);border-radius:4px;margin:0 12px 12px 0}}
.how{{color:var(--sl);margin:4px 0 32px}}
.disc{{border:2px solid var(--k);border-radius:0 24px 0 0;padding:24px 28px;margin:8px 0 32px}}
.disc h2{{margin:0 0 12px;font-size:22px}}.disc ol{{margin:0;padding-left:22px}}.disc li{{margin-bottom:8px}}
h3{{font-size:16px;margin:24px 0 8px}}
.links a{{color:var(--k)}} .arch a{{display:inline-block;margin:0 16px 6px 0;color:var(--k)}}
footer{{padding:24px 64px 48px;color:var(--sl);font-size:12px;max-width:1040px}}
@media(max-width:800px){{.top,.warn,main,footer{{padding-left:24px;padding-right:24px}}.top h1{{font-size:34px;line-height:42px}}}}
</style></head><body>
<header class="top"><img alt="Autodesk" src="data:image/svg+xml;base64,{base64.b64encode(open(LOGO, "rb").read()).decode()}">
<div class="k">UNOFFICIAL REFERENCE · 비공식 참고 자료</div><h1>{title_html}</h1><p>{e(L["sub"])}</p>
<span class="ver">{e(L["latest"])}: v{e(VERSION)} · {e(DATE)}</span></header>
<div class="warn">⚠ {e(DS["banner"])}</div>
<main>
<div>{"".join(langs)}</div>
<p class="how">{e(L["how"])}</p>
<section class="disc"><h2>{dt}</h2><ol>{"".join("<li>" + md(t) + "</li>" for t in DS["items"])}</ol></section>
<h3>{e(L["changelog"])}</h3><p class="links"><a href="{REPO}/blob/main/CHANGELOG.md">CHANGELOG.md</a> · <a href="{REPO}/releases">Releases</a> · <a href="{REPO}">{e(L["repo"])}</a></p>
{('<h3>' + e(L["archive"]) + '</h3><p class="arch">' + "".join(arch) + '</p>') if arch else ''}
</main>
<footer>{e(ko["meta"]["legal"])}</footer>
</body></html>'''
os.makedirs(DOCS, exist_ok=True)
open(os.path.join(DOCS, 'index.html'), 'w', encoding='utf-8').write(page)
open(os.path.join(DOCS, '.nojekyll'), 'w').close()
print('landing v' + VERSION, 'langs:', len([x for x in langs if 'class="go"' in x]), 'archive:', len(arch))
