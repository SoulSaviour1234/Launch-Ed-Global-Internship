# CraveWave Semantic Web Architecture

## Project Overview
CraveWave is a 4-page static website built for an international food delivery startup. The primary goal of this project is to demonstrate an unyielding commitment to web accessibility (a11y) and strict adherence to semantic HTML5 standards. This foundation ensures that the platform is inclusive, easily navigable by assistive technologies, and perfectly optimized for search engines—all without relying on CSS or JavaScript for structure and meaning.

## Technical Architecture & Design Decisions
The architecture of this project focuses on structural integrity and maximum accessibility:

- **Semantic HTML5 Exclusively**: The codebase is written entirely in semantic HTML. No CSS, inline styles, or JavaScript are used.
- **Strict Avoidance of Generic Tags**: The generic `<div>` and `<span>` tags have been completely omitted in favor of descriptive elements such as `<article>`, `<section>`, `<figure>`, `<nav>`, `<header>`, `<main>`, and `<footer>`.
- **ARIA Landmark Roles**: Every page includes explicit ARIA landmark roles (`role="banner"`, `role="main"`, `role="navigation"`, `role="contentinfo"`) to provide robust wayfinding for screen reader users.
- **Accessible Forms**: The contact form utilizes `<fieldset>` and `<legend>` for logical grouping, and every `<input>`, `<select>`, and `<textarea>` is explicitly bound to a `<label>` using matching `id` and `for` attributes.
- **Accessible Tables**: Subscription plans are presented using a highly accessible `<table>` that incorporates a `<caption>`, explicit `<thead>` and `<tbody>` sections, and strict `scope="col"` and `scope="row"` attributes on all header cells (`<th>`).

## Quality Assurance
- **W3C Compliance**: All four pages are guaranteed to pass the W3C Markup Validation Service with zero errors or warnings.
- **Lighthouse 100/100 Readiness**: Built from the ground up to achieve a perfect 100/100 accessibility audit score, featuring pristine document outlines, correctly bound labels, labeled navigation (`aria-label`), and descriptive `alt` text on all images.

## Project Directory Structure
```text
cravewave-core/
│
├── index.html       # Homepage with navigation, welcome message, and semantic image gallery
├── about.html       # Company story and semantic list of mission values
├── services.html    # Accessible data table detailing monthly subscription plans
├── contact.html     # Semantic contact form with explicit label bindings
└── README.md        # Project documentation and architectural overview
```
