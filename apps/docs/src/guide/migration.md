---
sidebar: auto
---

# Migration Guide

## Upgrading to v2.0

| Before | After |
|--------|-------|
| Single `index.html` SPA | VitePress multi-page site |
| Manual data embedding | Automated TypeDoc pipeline |
| No CI/CD | GitHub Actions → GitHub Pages |

## New Build Pipeline

```bash
pnpm run docs:generate
```

## Package Version Updates

```bash
pnpm install
pnpm run docs:generate
```
