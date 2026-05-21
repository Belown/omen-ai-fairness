# Design System for "Detecting Bias: A Time-Travel Investigation"

## 1. Core Direction

Θmen is a story-driven investigation game about AI bias, wrongful judgment, and the human decisions hidden behind machine certainty. The player is a private detective from the future city of Novus. Their apprentice is accused of helping steal confidential government documents after being manipulated into slipping a small device into a businessman's pocket. The AI justice system sees only risk data, not coercion or context, and returns a cold verdict: **HIGH RISK**.

The visual system must carry that emotional contradiction:

- A warm, cluttered detective office where truth is physical, messy, personal, and still discoverable.
- A cold AI justice system where decisions are clean, fast, statistical, and frighteningly confident.
- A time-travel layer that feels unstable, impossible, and hopeful.

The game should not feel like a generic cyberpunk dashboard. It should feel like a case room full of human doubt being invaded by machine logic.

## 2. Story Anchors

### Opening Premise

Novus is a golden-age technology city where AI decides loans, jobs, school admission, and criminal judgment. Citizens believe AI is fair because it is fast, emotionless, and consistent.

The detective lives quietly with a loyal dog and a young apprentice. One morning, police arrive and take the apprentice away. The AI system judges the apprentice through background, neighborhood, and historical patterns rather than the full story. Human testimony cannot compete with the machine's certainty.

After days of grief and obsessive case work, a stranger appears with a time machine. The detective can return to the weeks before the AI system is deployed and investigate how bias entered the pipeline.

### Chapter Structure

**Chapter 1: Data Bias**

The detective investigates training data. The model was trained on too few people and only from part of the city, so it performs well on limited examples but fails when deployed across Novus. Gameplay should emphasize maps, region selection, missing samples, incomplete records, and the difference between accurate-looking data and representative data.

**Chapter 2: Algorithmic Fairness Bias**

The detective examines what the AI means by "fair." The player first makes fast judgments on defendant profiles, then chooses fairness definitions for the AI. From the court's perspective, consistency and statistics seem fair. From the defendant's perspective, proxy variables and missing context can reproduce inequality. The chapter should show that fairness is not a single button; it is a value choice.

**Chapter 3: Human-in-the-Loop Bias**

The detective studies how humans guide LLM behavior through labels, answers, and feedback. The player answers question cards, then watches the AI echo those choices back later. The interface should make the feedback loop visible: biased, incomplete, or one-sided human input becomes machine behavior.

### Ending Direction

The ending should reveal that AI bias is not caused by one villain or one broken model. It is created through a chain of decisions: what data is collected, which fairness rule is chosen, and how humans guide the AI. The detective's victory should feel earned through understanding the system, not simply "fixing" a machine.

## 3. Asset Direction

### Case Room Background

Use `caseroom.jpeg` as the primary visual reference for the detective's workspace. It establishes the game's grounded identity:

- Nighttime office, rain or city darkness beyond the window.
- Desk lamp, monitors, files, drawers, maps, wall clippings, cables, and warning notes.
- A mix of old investigation tools and futuristic devices.
- Strong practical light from screens and lamps, with deep shadows around the edges.

Use this background for title/menu scenes, case review screens, transition moments after story scenes, and the detective's home base. UI layered on top of it should respect the existing composition: avoid covering the monitor, desk, and evidence wall with large opaque cards unless the screen is explicitly a modal case file.

### Detective Portraits

The detective portrait assets live in `src/assets/detective/portrait/new/`:

- `neutral.png`
- `Curious.png`
- `happy.png`
- `sad.png`
- `Angry.png`
- `Scared.png`

These portraits are expressive, illustrated, and character-forward. They should be used for dialogue, reaction moments, investigation feedback, and emotional state changes. They are not generic avatar icons; they are the player's dramatic presence in the scene.

Portrait usage:

- **neutral**: default narration, calm questioning, case review.
- **Curious**: inspecting clues, discovering inconsistencies, selecting evidence.
- **happy**: small breakthroughs, correct reasoning, hopeful scenes.
- **sad**: memories of the apprentice, failed appeals, heavy story beats.
- **Angry**: AI injustice, court rejection, moral confrontation.
- **Scared**: time travel instability, sudden danger, system verdict reveals.

Portrait UI should preserve the transparent background and avoid cropping the face too tightly. Use a soft shadow or rim glow only when needed to separate the character from dark backgrounds.

## 4. Visual Theme & Atmosphere

The visual theme is **human evidence versus machine certainty**.

The human world is tactile: paper, folders, handwritten notes, pinned photos, cork boards, desk wood, worn labels, and imperfect shadows. The machine world is sharp: dark panels, data grids, blue-green light, verdict meters, scan lines, and hard borders.

Key characteristics:

- Detective office atmosphere with practical lighting and visible clutter.
- Evidence-board layouts with pinned cards, red string, maps, and case notes.
- Cold AI displays that feel precise but emotionally empty.
- Emotional portrait reactions that make the detective's state visible.
- Time-travel effects that interrupt both worlds with purple/blue instability.
- Chapter color shifts that match the investigation focus.

## 5. Color Palette & Roles

### Investigator Palette

| Token                 | Hex         | Role                                 |
| --------------------- | ----------- | ------------------------------------ |
| `--omen-ink`        | `#1a1410` | Primary text, deep office shadow     |
| `--omen-paper`      | `#f5f0e8` | Main case-file surface               |
| `--omen-paper-dark` | `#e8e0d0` | Secondary paper and pinned notes     |
| `--omen-file-tab`   | `#d4c5a9` | Folder tabs and dividers             |
| `--omen-amber`      | `#c77d20` | Desk lamp glow and clue highlights   |
| `--omen-copper`     | `#b85c1e` | Important warm markers               |
| `--omen-wood`       | `#5c3d2e` | Furniture, frames, warm dark panels  |
| `--omen-red-string` | `#c0392b` | Evidence links and urgent clue paths |
| `--omen-ink-faded`  | `#6b5e53` | Secondary case-file text             |
| `--omen-stamp-red`  | `#8b1a1a` | Stamps, warnings, classified labels  |

### Machine Palette

| Token                     | Hex         | Role                                 |
| ------------------------- | ----------- | ------------------------------------ |
| `--omen-void`           | `#0a0e14` | Deep AI surface                      |
| `--omen-steel`          | `#141b22` | AI panel background                  |
| `--omen-holo-blue`      | `#4dc9f6` | Holographic accent and focus         |
| `--omen-neon-teal`      | `#00f0b5` | Verified or low-risk state           |
| `--omen-terminal-green` | `#3fef6f` | Logs and terminal output             |
| `--omen-alert-red`      | `#ff3347` | High-risk verdicts and danger        |
| `--omen-alert-amber`    | `#ff8c38` | Medium-risk warnings                 |
| `--omen-grid-line`      | `#1c2836` | Data grid dividers                   |
| `--omen-data-blue`      | `#5b9bd5` | Charts and model statistics          |
| `--omen-glitch-purple`  | `#b44cf0` | Time travel, anomalies, bias reveals |
| `--omen-machine-text`   | `#8ba4b8` | Secondary AI text                    |
| `--omen-cold-white`     | `#dce6f0` | Primary AI text                      |

### Neutral Bridge

| Token                    | Hex                    | Role                    |
| ------------------------ | ---------------------- | ----------------------- |
| `--omen-shadow`        | `rgba(0, 0, 0, 0.4)` | Depth and overlays      |
| `--omen-overlay`       | `rgba(0, 0, 0, 0.6)` | Modal and scene dimming |
| `--omen-divider`       | `#2a2520`            | Dark dividers           |
| `--omen-divider-light` | `#d9d0c0`            | Light dividers          |

## 6. Typography

Use typography to separate story, case work, and machine output.

| Role                 | Font                 | Use                                                      |
| -------------------- | -------------------- | -------------------------------------------------------- |
| Narrative / Display  | `Playfair Display` | Chapter titles, scene cards, dramatic story beats        |
| Case File / Headings | `IBM Plex Serif`   | Evidence labels, file headers, investigation sections    |
| Body / UI            | `Source Sans 3`    | Dialogue, descriptions, buttons, readable interface text |
| Terminal / Data      | `JetBrains Mono`   | AI output, risk scores, logs, model diagnostics          |

Guidelines:

- Keep letter spacing at `0` for readability.
- Use Playfair Display sparingly for cinematic weight.
- Use JetBrains Mono only where the player is reading machine output or structured data.
- Dialogue should be clean and readable; the portraits provide emotion, so text does not need decorative styling.

## 7. Component Guidance

### Case Room Screen

- Use `caseroom.jpeg` as a full-screen or wide background with a subtle dark overlay.
- Place interactive hotspots on natural objects: monitor, files, evidence board, drawers, time machine device.
- Use small labels, icons, and glows rather than large instructional blocks.
- Keep the office legible; the player should feel they are inspecting a real room.

### Dialogue Panel

- Portrait on one side, dialogue text on a paper or dark translucent panel.
- Use the portrait expression that matches the current emotional beat.
- For AI speech, replace the portrait with a cold terminal-style panel or verdict interface.
- Keep panel radius at `4px` for human dialogue and `2px` for AI dialogue.

### Evidence Cards

- Background: `--omen-paper` or `--omen-paper-dark`.
- Border: `1px solid --omen-file-tab`.
- Radius: `4px`.
- Shadow: `--omen-shadow-paper`.
- Hover: slight lift and deeper shadow.
- Use stamps, tape, small pins, and red string as visual states, not decoration.

### AI Verdict Panel

- Background: `--omen-steel`.
- Border: `1px solid --omen-grid-line`.
- Text: `--omen-cold-white` with `--omen-alert-red` for dangerous verdicts.
- Use `HIGH RISK` as a large, frightening machine conclusion.
- Show the limited evidence the AI used so the player can see what context is missing.

### Data Collection UI

- Use city-map regions, sample counters, demographic coverage, and missing-data warnings.
- Make sampling gaps visible through empty cells, faded districts, or incomplete records.
- Successful improvement should feel like a better case file, not a magical fix.

### Fairness Definition UI

- Present fairness definitions as competing legal/moral choices.
- Show judge-facing and defendant-facing interpretations side by side.
- Avoid presenting one option as universally correct. The lesson is tradeoffs and hidden assumptions.

### Human Feedback / LLM UI

- Use question cards, answer labels, and before/after model responses.
- Make feedback loops visible with arrows, repeated phrases, or highlighted bias echoes.
- When the AI starts reflecting the player's biased input, use `--omen-glitch-purple` sparingly to mark the realization.

### Time Machine Elements

- Time-machine controls are the only place where pill shapes and unstable purple/blue effects are allowed.
- Use distortion, brief glitch, and light streaks for travel transitions.
- The time machine is hope, but not comfort; it should feel risky.

## 8. Chapter Visual Zones

| Chapter   | Visual Focus                                                 | Dominant Feeling                        |
| --------- | ------------------------------------------------------------ | --------------------------------------- |
| Opening   | Case room, police, court, failed appeal                      | Personal loss under machine certainty   |
| Chapter 1 | Maps, samples, records, missing regions                      | The data was incomplete                 |
| Chapter 2 | Profiles, fairness rules, courtroom comparison               | Fairness depends on chosen values       |
| Chapter 3 | Question cards, labels, LLM responses                        | Humans teach the machine what to repeat |
| Ending    | Evidence chain, corrected understanding, apprentice's future | Bias is a chain of decisions            |

## 9. Motion & Feedback

- Evidence links draw in with red-string animation when clues connect.
- New clues can stamp in, slide from file folders, or appear as pinned notes.
- AI output types in quickly and clinically.
- Bias reveals use short glitch effects, never constant noise.
- Portrait changes should be immediate and readable; avoid over-animating the face art.
- Time travel uses fullscreen interruption: dark screen, blue/purple distortion, then a hard return to the case room or past scene.

## 10. Responsive Behavior

- Mobile layouts should prioritize dialogue, portraits, and single-clue focus.
- Evidence boards become scrollable vertical case files on small screens.
- AI comparison panels collapse into tabs or stacked sections.
- Touch targets should be at least 44px.
- Preserve the detective portraits without awkward cropping on all screen sizes.

## 11. Do's and Don'ts

### Do

- Use the actual case room image as the emotional home base.
- Let detective portraits carry reactions and story tone.
- Keep human investigation warm, physical, and imperfect.
- Keep AI interfaces cold, clean, statistical, and slightly intimidating.
- Show the player what the AI is missing, not only what it predicts.
- Treat each chapter as one part of a bias pipeline.

### Don't

- Do not make the game feel like a generic SaaS dashboard.
- Do not hide the office background behind oversized cards.
- Do not use purple/blue glitch styling everywhere; reserve it for time travel and bias discovery.
- Do not imply that better data alone solves the entire story.
- Do not present fairness as a single correct metric.
- Do not make the detective portraits tiny decorative icons.

## 12. CSS Custom Properties Reference

```css
:root {
  /* Investigator */
  --omen-ink: #1a1410;
  --omen-paper: #f5f0e8;
  --omen-paper-dark: #e8e0d0;
  --omen-file-tab: #d4c5a9;
  --omen-amber: #c77d20;
  --omen-copper: #b85c1e;
  --omen-wood: #5c3d2e;
  --omen-red-string: #c0392b;
  --omen-ink-faded: #6b5e53;
  --omen-stamp-red: #8b1a1a;

  /* Machine */
  --omen-void: #0a0e14;
  --omen-steel: #141b22;
  --omen-holo-blue: #4dc9f6;
  --omen-neon-teal: #00f0b5;
  --omen-terminal-green: #3fef6f;
  --omen-alert-red: #ff3347;
  --omen-alert-amber: #ff8c38;
  --omen-grid-line: #1c2836;
  --omen-data-blue: #5b9bd5;
  --omen-glitch-purple: #b44cf0;
  --omen-machine-text: #8ba4b8;
  --omen-cold-white: #dce6f0;

  /* Neutral */
  --omen-shadow: rgba(0, 0, 0, 0.4);
  --omen-overlay: rgba(0, 0, 0, 0.6);
  --omen-divider: #2a2520;
  --omen-divider-light: #d9d0c0;

  /* Typography */
  --omen-font-display: 'Playfair Display', Georgia, serif;
  --omen-font-case-file: 'IBM Plex Serif', Georgia, serif;
  --omen-font-body: 'Source Sans 3', system-ui, sans-serif;
  --omen-font-terminal: 'JetBrains Mono', Consolas, monospace;

  /* Radius */
  --omen-radius-sharp: 2px;
  --omen-radius-document: 4px;
  --omen-radius-stamp: 50%;
  --omen-radius-impossible: 9999px;

  /* Effects */
  --omen-shadow-paper: 0 1px 3px rgba(0, 0, 0, 0.12);
  --omen-shadow-lift: 0 4px 12px rgba(0, 0, 0, 0.15);
  --omen-shadow-float: 0 8px 30px rgba(0, 0, 0, 0.25);
  --omen-shadow-dramatic: 0 16px 48px rgba(0, 0, 0, 0.35);
  --omen-glow-holo: 0 0 20px rgba(77, 201, 246, 0.06);
  --omen-glow-alert: 0 0 16px rgba(255, 51, 71, 0.1);
}
```
