# Contributing to pdfppt-export

Thank you for your interest in contributing to **pdfppt-export**!  
Contributions of all kinds are welcome — code, documentation, bug reports, ideas, and feedback.

This project is actively evolving, and community input helps improve stability, features, and real-world usability.

---

## 📌 Project Overview

This repository contains:

- **`pdf-ppt-export-react/`**  
  The core React library published to npm.

- **`demo/`**  
  A live demo and reference implementation used to test real dashboards.

- **`Assets/`**  
  Images and branding used in documentation.

Most changes should be made **with the demo in mind**, as it’s the fastest way to validate export behavior.

---

## 🧭 Ways to Contribute

You can help by:

- Reporting bugs or edge cases  
- Improving documentation or examples  
- Fixing issues labeled `good first issue`  
- Improving PPT layout or export accuracy  
- Adding chart support or improving metadata handling  
- Optimizing performance for large dashboards  
- Testing across browsers and screen sizes  

No contribution is too small.

---

## 🐞 Reporting Bugs

Before opening an issue:

1. Make sure you are using the **latest version**  
2. Check the **README** and **Troubleshooting** sections  
3. Search existing issues  

When reporting a bug, please use the **Bug Report** issue template and include:

- Export type (PDF / PPT / both)  
- Browser and OS  
- React and library versions  
- Dashboard structure (charts, panels, layout)  
- Screenshots or sample output (if possible)  

---

## ✨ Requesting Features

Feature requests are welcome, but please:

- Describe the **real use case**  
- Explain why it cannot be solved externally  
- Consider the project’s focus on **DOM-driven exports**  

Use the **Feature Request** issue template.

---

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
git clone https://github.com/<your-username>/pdfppt-export.git
cd pdfppt-export
```

### 2. Install Dependencies

```bash
# Install demo dependencies
cd demo
npm install

# Install library dependencies
cd ../pdf-ppt-export-react
npm install
```

### 3. Run the Demo

```bash
cd demo
npm run dev
```

Use the demo to test any changes to:

- Export layout  
- Chart handling  
- Grouping logic  
- Performance  

---

## 🔁 Working on the Library

Most core logic lives in:

```text
pdf-ppt-export-react/src/
```

Guidelines:

- Prefer **small, focused commits**  
- Avoid breaking existing APIs unless discussed first  
- Keep changes compatible with both **Vite** and **CRA**  
- Test **PDF and PPT** exports when possible  

If your change affects output structure, include screenshots or sample exports.

---

## 🧪 Testing Changes

There is no automated test suite yet.

Please:

- Validate changes manually using the demo  
- Test with at least one chart and one text-only dashboard  
- Test both small and large layouts when possible  

Future automated tests are planned.

---

## 🧾 Code Style

- Follow existing formatting and conventions  
- Prefer readability over cleverness  
- Keep DOM traversal logic well commented  
- Avoid unnecessary abstractions  
- TypeScript is preferred where possible  

---

## 📦 Pull Request Guidelines

When opening a PR:

- Clearly describe **what changed** and **why**  
- Reference related issues if applicable  
- Include screenshots or examples for UI/output changes  
- Keep PRs focused (avoid unrelated changes)  

Draft PRs are welcome.

---

## 🧠 Design Philosophy

- DOM-driven, not screenshot-only  
- Minimal API, developer-first  
- Real editable PPT output  
- Practical over perfect  
- Incremental improvement over breaking changes  

---

## 🤝 Code of Conduct

By participating, you agree to follow the  
[Code of Conduct](CODE_OF_CONDUCT.md).

---

## 💬 Questions or Help

If you’re unsure where to start:

- Check issues labeled `good first issue`  
- Open a **Question** issue  
- Review the demo implementation  

Maintainers are happy to help.

---

Thank you for contributing and helping improve **pdfppt-export** 🙌
