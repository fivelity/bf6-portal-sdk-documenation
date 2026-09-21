---
layout: home
---

# BF6 Portal SDK

The **Battlefield 6 Portal SDK** — type-safe access to the global `mod` API and a comprehensive suite of utility modules, all generated directly from upstream TypeScript definitions.

<div class="hero-stats">
  <div class="hero-stat">
    <b>417</b>
    <span>Mod Functions</span>
  </div>
  <div class="hero-stat">
    <b>33</b>
    <span>Utility Modules</span>
  </div>
  <div class="hero-stat">
    <b>25</b>
    <span>Spawn Enums</span>
  </div>
</div>

<div class="check">
  <label>Symbol Verifier</label>
  <p class="hint">Type any symbol to validate its existence and signature across both packages.</p>
  <div class="check-field">
    <span class="prefix">></span>
    <input id="symbol-input" type="text" placeholder="e.g. mod.RayCast or Player.Undeploy" aria-label="Search for a symbol" />
  </div>
  <div class="try">
    <span class="chip" data-symbol="mod.RayCast">mod.RayCast</span>
    <span class="chip" data-symbol="mod.Player">mod.Player</span>
    <span class="chip" data-symbol="mod.Add">mod.Add</span>
    <span class="chip" data-symbol="TimersModule">TimersModule</span>
    <span class="chip" data-symbol="EventHandlerSignatures">EventHandlerSignatures</span>
  </div>
  <div class="verdict is-none" id="verdict">
    <div class="v-head"><span class="v-dot"></span><p id="verdict-text">Enter a symbol above to verify</p></div>
  </div>
</div>

<div class="plate-frame">
  <div class="plate-row pk-mod">
    <div class="pr-top">
      <span class="pr-name">bf6-portal-mod-types</span>
      <span class="pr-ver">v4.3.0</span>
    </div>
    <div class="code"><span class="lang">bash</span>npm install -D bf6-portal-mod-types</div>
    <p class="plate-caption">Global TypeScript definitions for the <code>mod</code> namespace — 417 functions, 40 types, 51 enums, 74 events.</p>
  </div>
  <div class="plate-row pk-utils">
    <div class="pr-top">
      <span class="pr-name">bf6-portal-utils</span>
      <span class="pr-ver">v9.4.0</span>
    </div>
    <div class="code"><span class="lang">bash</span>npm install bf6-portal-utils</div>
    <p class="plate-caption">Runtime utilities — diagnostics, interface components, gameplay tools, and more across 33 modules.</p>
  </div>
</div>

<div class="stat-grid">
  <a class="stat-cell" href="/mod/functions"><div class="ev">417</div><div class="el">Functions</div></a>
  <a class="stat-cell" href="/mod/types"><div class="ev">40</div><div class="el">Types</div></a>
  <a class="stat-cell" href="/mod/enums"><div class="ev">51</div><div class="el">Enums</div></a>
  <a class="stat-cell" href="/mod/events"><div class="ev">74</div><div class="el">Events</div></a>
  <a class="stat-cell" href="/utils"><div class="ev">33</div><div class="el">Modules</div></a>
  <a class="stat-cell" href="/mod/spawn"><div class="ev">25</div><div class="el">Spawn Enums</div></a>
</div>

::: info Getting Started

Install the packages, configure your `tsconfig.json`, and start building. See the [Getting Started guide](/guide/getting-started) for step-by-step instructions.

:::

---

<script>
export default {
  mounted() {
    // Load SDK data from the generated JSON file
    fetch('/data/sdk-data.json')
      .then(r => r.json())
      .then(data => {
        window.__SDK_DATA__ = data;
        console.log('BF6 Portal SDK data loaded:', data.mod.pkg.version, data.utils.pkg.version);
      })
      .catch(err => console.warn('Could not load SDK data:', err));
  }
}
</script>
