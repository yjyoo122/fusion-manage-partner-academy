# Fusion Manage partner academy (unofficial reference)

## 👉 [Open the guide: yjyoo122.github.io/fusion-manage-partner-academy](https://yjyoo122.github.io/fusion-manage-partner-academy/)

[![Open the guide](https://img.shields.io/badge/%F0%9F%91%89%20OPEN%20THE%20GUIDE-%ED%95%9C%EA%B5%AD%EC%96%B4-000000?style=for-the-badge&labelColor=FFFF00)](https://yjyoo122.github.io/fusion-manage-partner-academy/ko/)
[![Latest release](https://img.shields.io/github/v/release/yjyoo122/fusion-manage-partner-academy?label=version&style=for-the-badge)](https://github.com/yjyoo122/fusion-manage-partner-academy/releases)

| Language | Link |
|---|---|
| 한국어 (Korean) | **[Open →](https://yjyoo122.github.io/fusion-manage-partner-academy/ko/)** |
| 日本語 (Japanese) | Planned |
| English | Planned |

No install or sign-in. It opens in any modern browser. Older versions stay available from the landing page.

> [!WARNING]
> **This is an unofficial reference. It is not Autodesk material.**
> - It has not been reviewed, approved or endorsed by Autodesk. Do not present, cite or distribute it as official or Autodesk-backed material. The Autodesk logo and product names are used for identification only.
> - Do not use it as-is for real quotes, statements of work, proposals, contracts or customer commitments. Every number, template and clause is a reference only. Each one needs your own review, customer discovery and legal review.
> - **There is no guarantee of success.** Following this guide does not guarantee any project outcome. You use it at your own risk.
> - It is not legal, contractual or tax advice.

This is a self-contained, offline HTML training course for new implementation and service partners. It helps partners scope, sell, write SOWs, quote, implement, train, support and maintain Autodesk Fusion Manage projects.

The content was distilled from long-running enterprise project records. All customer names, person names, site names, contract numbers and monetary amounts were removed. Only patterns, structures and effort (in hours and days) remain. Effort figures are observed enterprise ranges, so validate them before use.

## Open it

- **Online:** use the link at the top. It always shows the latest version.
- **Offline:** download `site/fm-partner-academy-ko.html` and open it in a modern browser (Edge, Chrome or Firefox). No server or internet connection is needed.

- **First visit:** you must acknowledge the reference-only notice before you can enter.
- **Saving progress:** each person's progress, checklists, quiz answers, and estimator and builder inputs are saved in their own browser on their own device. Nothing is sent to a server, and nobody else can see it. When they come back on the same browser, a **이어서 학습하기** (resume) card returns them to the module and position where they stopped. Progress does **not** follow them to another device or browser, and it is lost in private or incognito windows or if browser data is cleared. Use **내보내기 / 불러오기** (export/import) to move it.

## Structure

```
VERSION                    current version (integer)
CHANGELOG.md               what changed per version
publish.ps1                bump, build, privacy check, commit, tag, push, release
docs/                      GitHub Pages site: index.html (landing), <lang>/ (latest), archive/vN/<lang>/
site/                      built single-file HTML for offline download
src/
  template.html            page shell
  app.css, app.js          rendering, estimator, SOW/quote builder, save/resume, disclaimer gate
  assets/                  logo used by the build
  content/
    <lang>.json            UI strings, disclaimer, navigation groups
    <lang>.estimator.json  28 line items with S/M/L hours
    <lang>.builder.json    8 scope templates for the SOW/quote builder
    <lang>.modules/        one JSON file per module (NN_id.json)
tools/
  build.py                 build site/fm-partner-academy-<lang>.html
  validate.py              check module JSON (block types, links, quizzes, Gantt bounds)
  scan_patterns.py         pre-publish privacy gate (currency, emails, contract-like numbers; optional local denylist)
  landing.py               generate docs/index.html
```

## Publish a new version

```
.\publish.ps1 -Notes "What changed"
```

The version bumps only when something under `src/` changed since the last release. The script builds every language, archives the version, regenerates the landing page and runs the privacy gate (it stops if anything is found). It then updates `CHANGELOG.md`, commits, tags `vN`, pushes and creates a GitHub release. GitHub Pages updates about a minute later.

## Build

Requires Python 3.10 or later. The build uses only the standard library.

```
python tools/validate.py ko
python tools/build.py ko
python tools/scan_patterns.py src site --denylist <path-outside-repo>/denylist.txt
```

Run the privacy scan before every push. It must print `TOTAL HITS 0`. Never commit the denylist, raw source extracts or analyst notes; `.gitignore` blocks the common paths.

## Trademarks

Autodesk, Fusion and Vault are registered trademarks or trademarks of Autodesk, Inc. in the USA and/or other countries. They are used here for identification only.
