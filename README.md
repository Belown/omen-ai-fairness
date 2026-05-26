# Θmen

Θmen is an interactive educational website about AI bias and fairness. It presents AI ethics as a story-driven investigation in the fictional city of Novus, where players examine how an automated justice system reaches a harmful verdict and trace that outcome back through the decisions that shaped it.

The website is designed for learners who are encountering AI fairness concepts for the first time. Instead of requiring programming knowledge, it uses playable scenarios, case-file evidence, assessments, and reflection prompts to make abstract ideas easier to inspect and discuss.

## Website Overview

The experience is built around a time-travel detective story. Players move through a case about an AI system that appears objective but misses target context, then investigate different points in the AI pipeline where bias can enter.

The site includes:

- A landing page that introduces the case, the city of Novus, and the central AI justice problem.
- Pre- and post-assessments for checking how learner understanding changes.
- Three interactive chapters focused on different sources of AI bias.
- Teaching resources and facilitator materials for classroom use.
- An about page describing the learning goals, audience, and design rationale.

## Learning Themes

Θmen focuses on three connected ideas:

- Sampling bias: who appears in the data, who is missing, and how that affects model behavior.
- Fairness trade-offs: why different definitions of fairness can conflict in real AI systems.
- Human feedback and alignment: how human preferences, labels, and judgments can shape model outputs.

Together, the chapters show that AI bias is not usually caused by one broken model. It can emerge from a chain of choices about data collection, fairness goals, system design, and human feedback.

## Technology

This project is a React and TypeScript website built with Vite. It uses React Router for navigation and includes custom interactive chapter components, assessment storage, visual assets, and teaching materials.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```
