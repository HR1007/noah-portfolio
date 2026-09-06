---
title: OSCE Medical Assessment Platform
order: 3
summary: >-
  My master's thesis: redesigning the information system behind an AR + OSCE
  assessment platform, so the structure of an exam lives in the interface
  instead of the coordinator's head.
hero:
  ctaLabel: Try it out
  ctaHref: 'https://osce-medical-assessment-platform.figma.site'
  gradient: cool
sections:
  - type: textSection
    eyebrow: ORIGIN & INSPIRATION
    heading: OSCE Medical Assessment Platform
    paragraphs:
      - >-
        This is my master's thesis, built on the "AR + OSCE" teaching-assessment
        platform from the Department of Pharmacy at Taipei University of Science
        and Technology, developed alongside OSCE domain experts. OSCE is a
        rigorously designed assessment method — stations, rubrics, standardized
        patients, all of it specified. Its information system, on the other
        hand, had never really been treated as something that needed designing.
        The line that stuck with me from the interviews was a coordinator's
        aside: they had to open ten separate tabs just to place one exam seat.
        Which means the structure of the exam lived in her head, not in the
        interface. That gap is where this project started.
  - type: deviceShowcase
    ratio: 16/10
    alt: OSCE Medical Assessment Platform dashboard screenshot
  - type: textSection
    eyebrow: RESEARCH FRAMEWORK
    heading: Research Framework
    paragraphs:
      - >-
        Human-Centered Design as the anchor, Double Diamond as the structure —
        with a different lens deliberately fitted to each diamond. The first
        diamond, discover and define, ran on Experience-Centered Design:
        situational context, emotional demands, how roles actually collaborate.
        Task analysis alone doesn't surface any of that. The second diamond,
        develop and deliver, switched to User-Centered Design for task-driven
        iteration and usability, and participatory co-creation. The reasoning is
        simple: keep the efficiency and error-prevention UCD cares about,
        without flattening the lived experience of turning an exam into a
        handful of numbers.
  - type: imageRow
    images:
      - ratio: 4/3
        alt: Research process flowchart
      - ratio: 4/3
        alt: Double Diamond design process diagram
  - type: persona
    eyebrow: PERSONA
    heading: OSCE — Persona
    personas:
      - name: Exam coordinator
        ratio: 3/4
        alt: OSCE persona board — the coordinator who sets up and runs the stations
  - type: designThemes
    eyebrow: DESIGN THEMES
    heading: >-
      A system built for long shifts in dim rooms — colour that carries status,
      and a dark theme that is not an afterthought.
    themes:
      - title: Semantic colour
        description: >-
          Status is read from colour before it is read as text, so a coordinator
          scanning a full station list does not have to parse every row.
      - title: Dark theme
        description: >-
          Exams run for hours in dimmed simulation rooms, so the dark surface is
          specified alongside the light one rather than derived from it
          afterwards.
  - type: flow
    eyebrow: FLOW
    heading: 'One seat, one place'
    body: >-
      The original workflow scattered a single action across ten tabs. The
      redesigned flow keeps a whole exam setup on one surface, so the structure
      of the exam lives in the interface instead of in someone's memory.
    steps:
      - label: Set up the station
        ratio: 3/4
        alt: OSCE flow — configuring a station and its rubric
      - label: Place and confirm seats
        ratio: 3/4
        alt: OSCE flow — placing exam seats and confirming the arrangement
  - type: featureSplit
    heading: Unified Task Surface
    body: >-
      Search, filtering and batch operations consolidated into one view,
      removing the page-hopping that fragmented the original workflow. A dense
      table for precise batch work, a card grid for status when needed — same
      data, two genuinely different tools.
    imagePosition: left
    ratio: 4/3
    alt: Unified task surface dashboard screenshot
  - type: featureSplit
    heading: Dark Mode for Long Sessions
    body: >-
      Exams run for hours in dimmed simulation rooms; a dedicated dark theme
      keeps content compliant with existing eye-strain requirements.
    imagePosition: right
    ratio: 4/3
    alt: Dark mode dashboard screenshot
  - type: experienceDemo
    eyebrow: EXPERIENCE DEMO
    heading: See the OSCE platform in Action
    body: >-
      A walk through the redesigned backend: advanced filters that expand in
      place, status read through semantic colour, and bulk actions that stay
      where the selection happens. The same tasks that once needed ten tabs,
      done on one screen.
    ratio: 16/10
    alt: OSCE Medical Assessment Platform demo on laptop
  - type: featureSplit
    heading: Experience the Intuitive Flow
    body: >-
      Watch a fragmented backend fold into one continuous surface. Advanced
      filters expand in place. Status is read through semantic color rather than
      a wall of text. Bulk actions live where the selection happens.
    imagePosition: right
    ratio: 3/4
    alt: Intuitive flow demo illustration
    ctaLabel: Let's Try Out
    ctaHref: '#'
  - type: experienceDemo
    eyebrow: OUTCOMES
    heading: Verification and results
    body: >-
      The redesigned backend was evaluated with 21 participants, combining task
      performance, SUS, UEQ, eye-tracking and semi-structured interviews.
      Triangulating three kinds of data was deliberate: I wanted to know not
      just whether tasks got faster, but whether running an exam actually felt
      easier — those two turn out to be correlated but not the same thing.
    ratio: 16/9
    alt: >-
      Study session photos showing eye-tracking, simulated exam stations, and
      semi-structured interviews
---

