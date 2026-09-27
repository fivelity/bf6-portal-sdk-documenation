---
title: About This Site
description: The vision behind the BF6 Portal SDK docs, how the reference is generated, and why it's built AI-first.
---

import { Card, CardGrid, Aside } from '@astrojs/starlight/components';

## Who this is for

This site exists for the full range of people building Battlefield 6
Portal game modes — from engineers writing every line of `strict` mode
TypeScript by hand, to modders steering a local LLM through their first
kill-reward script, to complete beginners who don't yet know what an
`ObjId` is. The reference doesn't change based on who's reading it; the
guides do the work of meeting each group where they are.

## How the docs get made

Nothing here is hand-transcribed. The pipeline is: install
`bf6-portal-mod-types` and `bf6-portal-utils` → run
[TypeDoc](https://typedoc.org/) against their real `.d.ts` files → publish
the result as this site. The **Official BF6 Portal SDK** — including the
[`mod` namespace](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/)
itself — is the ultimate source of truth; these two npm packages are
community-maintained translations of it into TypeScript type declarations,
and this site is in turn generated from whichever version of those
packages is currently installed.

`bf6-portal-mod-types` mirrors the official runtime's own types.
`bf6-portal-utils` — the vector math, event plumbing, timers, and UI
helpers layered on top — is authored and maintained by
[deluca-mike](https://github.com/deluca-mike), and built specifically to
work seamlessly alongside `mod-types`. Both packages are independent,
community-published projects; neither is an EA/DICE artifact.

That chain means accuracy has a dependency: if a Portal update ships
before the npm packages catch up, this site will lag too, for exactly as
long as the packages do. When something here doesn't match what you
observe in-game, the official Portal documentation is the tiebreaker, not
this site.

## Why AI-first, on purpose

Modern gaming hardware — the same GPU driving Battlefield 6 at high
settings — is also enough to run a capable local LLM. That's a real,
underused opportunity for modding communities: you don't need a cloud
subscription to have an AI pair-programmer for your Portal script. But an
LLM is only as good as its grounding, and asked to write against an API it
doesn't have direct knowledge of, it will invent plausible-looking
functions that don't exist.

This site is built to close that gap: every reference page is extracted
from the real package, and the site publishes `/llms.txt` and
`/llms-full.txt` so a model — local or hosted — can be pointed at
ground truth instead of guessing. Structured, generated docs aren't just
convenient for humans skimming a sidebar; they're the difference between
an LLM that hallucinates a `mod.Network` namespace and one that correctly
tells you it doesn't exist.

## The badges in the header

The strip under the main navigation isn't decoration — it's a running
receipt for how this particular build of the site was put together: which
AI tool, which model, and roughly how much it took. It's there in the same
spirit as the rest of the project: don't hide the process, show it, and
let the docs' own accuracy speak for whether AI-assisted development
holds up. Take it as a small, honest artifact of how this site was built,
not a claim about how *your* mod should be built.

<Aside type="note" title="On the numbers">
Token counts and elapsed time are approximate and updated by hand — treat
them as a rough log, not a precise metric.
</Aside>

## Where this is headed

The goal is a genuine hub for BF6 Portal modding culture, not just an API
mirror: phased tutorials, real mode walkthroughs, and a reference that
stays honest about its own limits. If you've built something with this
SDK, hit a gap in the docs, or want to contribute a guide, the project
lives on GitHub — issues and pull requests are welcome.

<CardGrid>
	<Card title="Report a doc issue" icon="github">
		Found a stale symbol or a broken link? Open an issue on the
		[GitHub repo](https://github.com/fivelity/bf6-portal-sdk-documenation/issues).
	</Card>
	<Card title="Contribute a guide" icon="pencil">
		Conceptual guides live under `src/content/docs/` and are hand-written,
		not generated — PRs adding tutorials or examples are very welcome.
	</Card>
</CardGrid>
