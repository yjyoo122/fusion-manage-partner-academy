# Fusion Manage partner academy (unofficial reference)

> [!WARNING]
> **This is an unofficial reference. It is not Autodesk material.**
> - It has not been reviewed, approved or endorsed by Autodesk. Do not present, cite or distribute it as official or Autodesk-backed material. The Autodesk logo and product names are used for identification only.
> - Do not use it as-is for real quotes, statements of work, proposals, contracts or customer commitments. Every number, template and clause is a reference only. Each one needs your own review, customer discovery and legal review.
> - **There is no guarantee of success.** Following this guide does not guarantee any project outcome. You use it at your own risk.
> - It is not legal, contractual or tax advice.

This is a self-contained, offline HTML training course for new implementation and service partners. It helps partners scope, sell, write SOWs, quote, implement, train, support and maintain Autodesk Fusion Manage projects.

The content was distilled from long-running enterprise project records. All customer names, person names, site names, contract numbers and monetary amounts were removed. Only patterns, structures and effort (in hours and days) remain. Effort figures are observed enterprise ranges, so validate them before use.

## Open it

Download `site/fm-partner-academy-ko.html` and open it in a modern browser (Edge, Chrome or Firefox). No server or internet connection is needed.

- **First visit:** you must acknowledge the reference-only notice before you can enter.
- **Saving progress:** progress, checklists, quiz answers, the estimator and builder inputs are stored in your browser's local storage. Use **진행 상황 저장** to save, and **내보내기 / 불러오기** (export/import) to move progress to another PC or browser.

## Languages

| Language | Status |
|---|---|
| Korean (`ko`) | Available |
| Japanese (`ja`) | Planned |
| English (`en`) | Planned |

## Structure

```
site/                      built single-file HTML (one per language)
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
```

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
