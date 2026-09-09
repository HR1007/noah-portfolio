---
title:
  en: New Formosa Sport — Sports Platform Website Design
order: 2
summary:
  en: >-
    A modern sports website designed to deliver clear information, engaging
    visuals, and a seamless browsing experience.
hero:
  ctaLabel:
    en: Try it out
  ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
  gradient: mint
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN & INSPIRATION
    heading:
      en: New Formosa Sport — Sports Platform Website Design
    paragraphs:
      - en: >-
          New Formosa Sport is a long-established sporting goods store in Rende,
          Tainan, running five stores at once — retail, event construction, and
          local team apparel — for local schools and cycling teams. The easy
          version of this brief is a website. What the business actually lacked
          was a system: one design language, a site that deploys fast, an
          automated inquiry pipeline, and a workflow the team could keep using
          long after I stopped touching the files.
  - type: deviceShowcase
    ratio: 16/10
    alt:
      en: New Formosa Sport website homepage screenshot
  - type: persona
    eyebrow:
      en: PERSONA
    heading:
      en: New Formosa Sport — Persona
    personas:
      - name: School equipment buyer
        ratio: 3/4
        alt:
          en: New Formosa Sport persona board
  - type: designThemes
    eyebrow:
      en: DESIGN THEMES
    heading:
      en: >-
        One design language across five business lines — so the site reads as
        one shop, not five.
    themes:
      - title:
          en: Colour
        description:
          en: >-
            The existing Formosa Red carried over as the brand anchor, paired
            with a deep navy that keeps long product listings calm.
      - title:
          en: Typography
        description:
          en: >-
            A type scale that survives both a spec sheet on a desktop and a
            phone held one-handed in a school corridor.
      - title:
          en: Spacing & Shape
        description:
          en: >-
            A 4px spacing scale with fixed radius and elevation steps, so a new
            page cannot quietly invent its own rhythm.
      - title:
          en: Components
        description:
          en: >-
            Buttons, inputs, badges and service cards specified with every
            state, so five business lines build from one kit.
    direction: vertical
  - type: flow
    eyebrow:
      en: FLOW
    heading:
      en: The inquiry path
    body:
      en: >-
        Most visits end in a question, not a checkout. The flow gets someone
        from landing to a sent inquiry without asking them to understand the
        company's internal structure first.
    steps:
      - label: Pick a store or service
        ratio: 3/4
        alt:
          en: New Formosa Sport flow — choosing a store or service line
    direction: horizontal
  - type: experienceDemo
    layout: stacked
    eyebrow:
      en: EXPERIENCE DEMO
    heading:
      en: The Quote Lives on the First Screen
    body:
      en: >-
        No hunting for a contact page. The inquiry form sits beside the hero, so
        a visitor can say what they need and send it without scrolling away.
    ratio: 9/16
    alt:
      en: New Formosa Sport homepage with the free-quote form beside the hero
  - type: featureSplit
    heading:
      en: Automated Lead Pipeline
    body:
      en: >-
        The inquiry form is wired to Netlify Forms — captured automatically,
        reviewed in real time, with access and notification routing handled by
        environment variables.
    imagePosition: right
    ratio: 4/3
    alt:
      en: Inquiry form screenshot showing the automated lead pipeline
  - type: featureSplit
    heading:
      en: Zero-Build Deployment
    body:
      en: >-
        A static site with no build command, deployed straight from the
        repository. The client has no engineering team, so the site had to stay
        updatable without anyone standing by to run a pipeline.
    imagePosition: left
    ratio: 4/3
    alt:
      en: Deployment configuration screenshot
  - type: featureSplit
    heading:
      en: Experience the Intuitive Flow
    body:
      en: How do five unrelated business lines share one site without competing?
    imagePosition: right
    ratio: 4/3
    alt:
      en: Overview of the five business lines sharing one site
  - type: featureSplit
    heading:
      en: Single Source of Truth
    body:
      en: >-
        Formosa Red and a deep navy were already the brand's colours; the work
        was turning them into a token set with fixed roles, so a new page cannot
        quietly invent a seventh shade of red.
    imagePosition: left
    ratio: 4/3
    alt:
      en: Color and typography system screenshot
  - type: featureSplit
    heading:
      en: 'Built for the Corridor, Not the Desk'
    body:
      en: >-
        The mobile path assumes someone standing in a school corridor with one
        hand full — larger targets, fewer steps, and a form that never asks for
        anything the person would not already know.
    imagePosition: right
    ratio: 3/4
    alt:
      en: Mobile inquiry flow screenshot
  - type: featureSplit
    heading:
      en: The System Holds at 375px
    body:
      en: >-
        375px is the floor, not an afterthought. Every layout, form and product
        listing is checked at that width, so the smallest supported screen gets
        the whole site rather than a reduced one.
    imagePosition: left
    ratio: 3/4
    alt:
      en: Mobile layout at 375px viewport
---

