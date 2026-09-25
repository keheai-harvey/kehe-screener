# Job Rescue Kit — Part 1: ATS-Safe Resume Template
> Job Rescue Kit · Part 1 of 3 — a single-column resume template built to survive ATS parsing.

## Why single-column, no tables/two-column layouts
ATS (Applicant Tracking Systems) parse resumes by reading top-to-bottom in a linear text flow. Two-column layouts, text boxes, tables, and graphics can break parsing — an otherwise strong resume gets stored as scrambled text or rejected. Single-column keeps the parse order identical to what a human reads.

The parser does not "understand" your resume. It reads text in the order it appears in the file and tries to match what it finds against the job you applied for. Everything below is written for that reader first, and the human second.

## Template (single-column, section order)

```
[YOUR NAME]
[City, State] | [Phone] | [Email] | [LinkedIn URL]
(One line max; keep it scannable)

SUMMARY (2-3 lines)
A short statement of who you are, the role you want, and the measurable outcome you deliver.
NOT a list of adjectives. Include one number if you have it.

EXPERIENCE (reverse chronological)
Job Title — Company, City (Month Year – Month Year)
• Bullet: Action verb + what you did + measureable result (e.g., "Cut manual reporting time 40% by building an export pipeline").
• Format per bullet: [Verb][What][Measurable result]. Start each bullet with a different strong verb.
• 3-5 bullets per role. No paragraphs. No "responsible for" fluff.

PROJECTS (if relevant to target role)
Project Name (Technologies)
• Same bullet format: verb + what + measurable outcome.

EDUCATION
Degree, Major — School, Year

SKILLS
• Only skills relevant to the target role and that you can answer questions about.
• No "proficient in" word clouds of 20 tools.
```

## A literal skeleton you can paste and overwrite

Replace every bracket. Delete rows you do not need. Do not add sections back.

```
JORDAN AVERY
Columbus, Ohio | (614) 555-0148 | jordan.avery@example.com | linkedin.com/in/jordanavery

SUMMARY
Operations analyst moving into logistics planning. Cut weekly reporting time from 6 hours to
45 minutes at a 40-truck carrier, and I want to do that work at a larger carrier.

EXPERIENCE
Operations Analyst — Ridgeline Freight, Columbus, Ohio (Mar 2022 - Present)
• Cut weekly reporting time 88% (6h to 45min) by rebuilding the export as a scheduled script.
• Trained 7 dispatchers on the new dashboard; support tickets on report errors dropped from
  20/month to 3/month in the first quarter after rollout.
• Rebuilt the fuel-surcharge calculation after finding a rounding error that had been
  overcharging 3 accounts, and documented the fix so the next analyst could repeat it.

Dispatch Coordinator — Ridgeline Freight, Columbus, Ohio (Jun 2020 - Mar 2022)
• Handled 120+ inbound carrier calls a week while keeping average hold time under 70 seconds.
• Wrote the escalation checklist that replaced a Slack channel nobody read.

PROJECTS
Route Cost Calculator (Google Sheets, Apps Script)
• Built a per-lane cost sheet used by 4 dispatchers daily; replaced a manual estimate that was
  off by 10-15% on long-haul lanes.

EDUCATION
B.S., Business Administration — Ohio State University, 2020

SKILLS
Excel (INDEX/MATCH, Power Query), Google Apps Script, SQL (read-only queries), TMS: McLeod
```

## Rewriting bullets that say nothing

Take the dull version, keep the fact, and put a number or an artifact on it.

| Before (parsed, but forgettable) | After (parsed, and answerable) |
|---|---|
| Responsible for weekly reporting. | Rebuilt weekly reporting as a scheduled script; cut it from 6 hours to 45 minutes. |
| Helped improve onboarding process. | Rewrote onboarding into a 9-step checklist; new hires reached first solo shift 2 weeks earlier. |
| Worked with customers to resolve issues. | Handled roughly 40 escalations a month and wrote the 6 rules we still use to decide who takes the call. |
| Managed social media accounts. | Grew the company page from 400 to 2,300 followers in 7 months by posting 3x/week in a fixed format. |
| Team player with strong communication skills. | (Delete. If it is not provable, it does not go on the page.) |

**When you genuinely have no number.** Do not invent one. Use a concrete before/after artifact instead: "there was no checklist, now there is one and 5 people use it." Quantity of artifacts beats adjectives.

## Match the posting's own words

ATS ranking is largely keyword matching against the job description. This is not cheating — it is using the same vocabulary as the person who will read it.

1. Copy the job description into a plain text file.
2. Mark every skill, tool, certificate and job title it names.
3. For each one, ask: do I have this, in any form? If yes, use **the posting's exact phrase** somewhere in your resume (skills section or a bullet). If no, leave it out — do not stuff it in.
4. Check the title line. If the posting says "Logistics Planner" and your last title was "Operations Analyst", add a summary line that names the target role in plain words.
5. Acronyms: write both forms once — "Applicant Tracking System (ATS)". Some parsers index the acronym, some the full phrase.

## Strong verbs, grouped by what they claim

Pick by what you actually did. Do not mix a verb that claims ownership with a bullet that describes helping.

- **Built / created:** built, designed, wrote, launched, assembled, prototyped
- **Improved:** cut, reduced, simplified, automated, merged, rewrote, standardized
- **Ran / owned:** owned, led, managed, coordinated, scheduled, dispatched
- **Fixed:** diagnosed, repaired, recovered, resolved, patched, audited
- **Explained / taught:** trained, documented, presented, onboarded, briefed

Avoid: "responsible for", "assisted with", "participated in", "helped with", "duties included". They describe a job description, not a person.

## Ready-to-use checklist before applying

- [ ] Single column, no tables, standard fonts (Calibri/Arial), no images/photos.
- [ ] File name: "FirstName_LastName_Resume.pdf" (not "resume_final_v3"). PDF, not .docx, where possible.
- [ ] Every bullet starts with a strong verb and has a measurable result.
- [ ] 1 page for <8 years experience; max 2 pages.
- [ ] No fancy fonts/colors; no graphics.
- [ ] Job title line matches the posting's title vocabulary.
- [ ] Every tool the posting names that you actually know appears at least once, spelled the way the posting spells it.
- [ ] Contact line has no extra spaces or line breaks in the middle of the email address (parsers split on those).
- [ ] Read it out loud once. Any sentence you would not say to a person, rewrite.

## The section nobody thinks to include
Add a short "PROJECT IMPACT / METRICS" one-liner or embed numbers in bullets (e.g., "reduced onboarding time 25%"). Recruiters and ATS both reward specific, measurable impact over generic "responsible for."
