---
title: About This Site
description: The vision behind the BF6 Portal SDK docs, how the reference is generated, and why it's built AI-first.
---

import { Card, CardGrid, Aside } from '@astrojs/starlight/components';

## Who this is for

This site exists for everyone building Battlefield 6 Portal game modes —
engineers writing every line of `strict`-mode TypeScript by hand, modders
steering a local LLM through their first kill-reward script, and complete
beginners who don't yet know what an `ObjId` is. The reference itself
doesn't bend to who's reading it; that's the guides' job, meeting each of
you exactly where you are.

## How the docs get made

Nothing here is hand-transcribed. The pipeline is simple and unglamorous:
install `bf6-portal-mod-types` and `bf6-portal-utils`, run
[TypeDoc](https://typedoc.org/) against their real `.d.ts` files, publish
the result as this site. The **Official BF6 Portal SDK** — including the
[`mod` namespace](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/)
itself — is the ultimate source of truth here; these two npm packages are
community-maintained translations of it into TypeScript type declarations,
and this site is generated, in turn, from whichever version of those
packages happens to be installed.

`bf6-portal-mod-types` mirrors the official runtime's own types directly.
`bf6-portal-utils` — the vector math, event plumbing, timers, and UI
helpers layered on top of it — is authored and maintained by
[deluca-mike](https://github.com/deluca-mike), built from the ground up to
work seamlessly alongside `mod-types`. Both are independent,
community-published projects; neither is an EA/DICE artifact, and it's
worth keeping that distinction in mind.

That chain has one honest consequence: accuracy comes with a dependency.
If a Portal update ships before the npm packages catch up, this site lags
right along with them — for exactly as long as they do. When something
here doesn't match what you're seeing in-game, trust the official Portal
documentation over this site, every time.

## Why AI-first, on purpose

Here's an opportunity most modding communities haven't caught onto yet:
the same GPU already driving Battlefield 6 at high settings is more than
capable of running a local LLM too. You don't need a cloud subscription to
have an AI pair-programmer sitting next to your Portal script. But an LLM
is only as good as what it's grounded in — point one at an API it doesn't
actually know, and it will confidently invent functions that were never
real to begin with.

This site exists to close that gap. Every reference page is extracted
directly from the real package, and the site publishes `/llms.txt` and
`/llms-full.txt` so a model — local or hosted, doesn't matter — can be
pointed at ground truth instead of left to guess. Structured, generated
docs aren't just nice for humans skimming a sidebar; they're the
difference between an LLM that hallucinates a `mod.Network` namespace and
one that correctly tells you it doesn't exist.

## The badges in the header

The strip under the main navigation isn't decoration — it's a running
receipt for how this particular build of the site came together: which AI
tool, which model, roughly how much it took to get here. It's there in the
same spirit as everything else on this project: don't hide the process,
show it, and let the docs' own accuracy make the case for whether
AI-assisted development actually holds up. Take it as a small, honest
artifact of how this site was built — not a claim about how *your* mod
should be.

<Aside type="note" title="On the numbers">
Token counts and elapsed time are approximate and updated by hand — treat
them as a rough log, not a precise metric.
</Aside>

## Where this is headed

The real goal is a genuine hub for BF6 Portal modding culture, not just a
mirror of the API: phased tutorials, real mode walkthroughs, and a
reference that stays honest about its own limits as it grows. If you've
built something with this SDK, hit a gap in the docs, or want to
contribute a guide of your own, the project lives on GitHub — issues and
pull requests are genuinely welcome, not just tolerated.

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
