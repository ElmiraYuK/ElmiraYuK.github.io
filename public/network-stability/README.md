# Network Stability

Research project of **Elmira Yu. Kalimulina** on queueing stability, dynamic environments, reliability and geometric rerouting.

## Contents

- [Interactive routing laboratory](index.html#lab): Euclidean wheel family, available-node snapshots, actual shortest-path search, conditional flux profiles, and SVG/JSON exports.
- [Random-geometry illustration](index.html#poisson): a conditioned Poisson point pattern, guard window and exact event-probability formula.
- [Research notes](materials.html): model, first-step criterion, Poisson correctors, terminal bottlenecks, geometric realisations and limits.
- [Mathematical JavaScript](core.js) and [finite regression tests](test_core.cjs).
- [Change record](CHANGELOG.md).

## Run locally

Open `index.html`, or run `python -m http.server 8000` in this directory and visit `http://localhost:8000`.
There are no third-party browser dependencies, network data requests, trackers, or bundled fonts.

Run the deterministic finite checks with:

```sh
node test_core.cjs
```

These are numerical programme regressions. They do not prove stochastic recurrence, all-K geometric statements or scientific priority. The full mathematical arguments are separate from these explanatory pages.

## Read the labels before interpreting the display

The graph is finite; queue populations in the research model are not bounded. The wheel has a hub and is not a hub-free model. A working graph is induced from the physical graph, not retriangulated. Spin animation has its own display clock and does not simulate queues.

The flux envelopes require a recurrent background. The slider is not a general finite-speed stability certificate. The excursion bound is separate from the error that vanishes as switching becomes fast. The eventual theorem intervals depend on K; the display does not silently reuse the special 34-point intervals for all sizes.

The Poisson picture is conditioned on a rare local event. It does not establish typicality, dynamic isolation or positive recurrence of the full infinite network.

## Research roadmap

Current material: first-step profiles, stationary environment bias, finite-network stability mechanisms, open Euclidean realisations, and local Poisson occurrence.

Separate directions, not yet claimed: bounded-degree/hub-free families, non-terminal feedback, moderate switching, and spatially interacting random networks.

## Provenance and AI assistance

Claude (Anthropic) and ChatGPT (OpenAI) assisted research discussion, editing and implementation in the broader project. The present web version was revised and tested with ChatGPT. AI output is not a proof certificate or an independent referee report. The author retains responsibility for the scientific claims.

Only explanatory web materials are in this public directory. Internal reviews, private discussions, submission plans and earlier draft archives are not included.

## Hosting

The current public project is an isolated directory of the author's existing website repository: `public/network-stability` in `ElmiraYuK/ElmiraYuK.github.io`. It is served at `https://elmira.su/network-stability/`.

This folder is portable and can also be the root of a separate static repository. No claim is made that a separate `network-stability` repository has already been created.

## Rights

Copyright 2026 Elmira Yu. Kalimulina. No additional reuse licence has been selected in this iteration. Public visibility alone is not a grant of a software or manuscript licence.
