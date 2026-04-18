# 🌾 KisanClaim Intelligence Layer — Walkthrough

## What Changed

Upgraded the backend from a basic CRUD + damage-calculation system into a **full decision-making engine** with three new modules and rewired all existing layers to run the complete pipeline.

---

## Architecture (After)

```
  NDVI Data → Damage Calculation → Claim Engine → Fraud Analysis → Response
       │              │                  │                │
  ndviAnalyzer   calculateDamage   claimService    fraudService
       └──────────────┴──────────────────┴────────────────┘
                              │
                     analysisService  (pipeline orchestrator)
                              │
                        farmService  (filtering, pagination, aggregation)
                              │
                       farmController  (thin HTTP layer)
```

### New Files

| File | Purpose |
|------|---------|
| [claimService.js](file:///d:/kisanclaim/src/services/claimService.js) | Multi-tier claim engine with sigmoid smoothing |
| [fraudService.js](file:///d:/kisanclaim/src/services/fraudService.js) | 5-factor weighted fraud detection |
| [analysisService.js](file:///d:/kisanclaim/src/services/analysisService.js) | Pipeline orchestrator |

### Modified Files

| File | Change |
|------|--------|
| [farmService.js](file:///d:/kisanclaim/src/services/farmService.js) | Rewired to use `analyzeOne`/`analyzeMany` pipeline |
| [farmController.js](file:///d:/kisanclaim/src/controllers/farmController.js) | New query params, renamed stats endpoint |
| [farmRoutes.js](file:///d:/kisanclaim/src/routes/farmRoutes.js) | Added `/stats/intelligence`, legacy alias kept |
| [config/index.js](file:///d:/kisanclaim/src/config/index.js) | Added claim & fraud configuration blocks |

---

## 1. Claim Calculation Engine

**Not a naive `damage × insured` multiplication.** Instead:

- **6-tier graduated payout curve** — catastrophic losses pay disproportionately more
- **Sigmoid-smoothed transitions** between tiers (no cliff-edge jumps)
- **15 crop-specific vulnerability factors** — Rice (flood-sensitive) gets 1.10×, Bajra (drought-resistant) gets 0.93×
- **Policy cap enforcement** — payout can never exceed insured amount
- **Per-acre breakdown** for field-level analytics

Example output for KCF-0012 (81.89% damage):
```json
{
  "claimAmount": 84393.05,
  "payoutRatio": 0.7798,
  "tierLabel": "CATASTROPHIC",
  "multiplier": 0.9522,
  "cropFactor": 1,
  "perAcrePayout": 3402.95,
  "cappedAtPolicy": false
}
```

---

## 2. Fraud Detection Engine

**5 independent detection modules**, each producing a 0–100 sub-score, combined via weighted composite:

| Check | Weight | What It Does |
|-------|--------|-------------|
| **Neighbor Anomaly** | 30% | Haversine distance to find farms within 50km, compare NDVI drop z-score against neighborhood |
| **Statistical Outlier** | 25% | Global + crop-specific z-score against dataset distribution |
| **Logical Consistency** | 25% | Detects impossible NDVI combos (low baseline + high damage, vegetation improved, over-insurance) |
| **Temporal Pattern** | 10% | Flags recent policy enrollment with catastrophic damage (post-event fraud) |
| **Claim-Value Ratio** | 10% | High payout on tiny farms, near-total claims, high-value absolute claims |

**Classification**:
| Score | Status | Action |
|-------|--------|--------|
| 0–29 | LOW / CLEAR | Automated approval eligible |
| 30–54 | MEDIUM / REVIEW | Automated approval eligible (manual review suggested) |
| 55–74 | HIGH / INVESTIGATE | **Flagged** — manual review required |
| 75–100 | CRITICAL / BLOCK | **Flagged** — claim blocked |

Example: KCF-0012 scored **88 on neighbor anomaly** (damage 2.21× neighborhood average, z=2.61) but only **15 on statistical outlier** — composite: **30.15 → MEDIUM**:
```json
{
  "fraudScore": 30.15,
  "fraudStatus": "MEDIUM",
  "riskLevel": "REVIEW",
  "flag": false,
  "checks": {
    "neighborAnomaly": { "score": 88, "neighborsAnalyzed": 6, "zScore": 2.61 },
    "statisticalOutlier": { "score": 15, "effectiveZScore": 1.55 },
    "logicalConsistency": { "score": 0 },
    "temporalPattern": { "score": 0, "daysSinceEnrollment": 375 },
    "claimValueRatio": { "score": 0, "payoutRatio": 0.7798 }
  }
}
```

---

## 3. Pipeline Orchestrator

Every farm request flows through `analysisService.analyzeOne()`:

```
Raw Farm → calculateDamage() → calculateClaim() → analyzeFraud() → Enriched Response
```

The response includes:
- **`analysis`** — full detail blocks for each stage + pipeline metadata
- **`summary`** — flat top-level fields for quick access by frontends

---

## API Endpoints (Updated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/farms` | All farms with full intelligence (paginated) |
| `GET` | `/api/v1/farms/:farmId` | Single farm with complete pipeline output |
| `GET` | `/api/v1/farms/stats/intelligence` | Aggregate intelligence statistics |
| `GET` | `/api/v1/farms/stats/damage` | Legacy alias → intelligence |

### New Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `fraudStatus` | string | Filter: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `flaggedOnly` | bool | Only return fraud-flagged farms |
| `sortBy` | string | `damage`, `claim`, `fraudScore`, `insured` |
| `order` | string | `asc` or `desc` (default: `desc`) |

---

## Validation Results

All endpoints tested and passing:

| Test | Result |
|------|--------|
| Full pipeline (single farm) | ✅ 3-stage analysis with complete audit trail |
| Sorted by fraud score | ✅ KCF-0012 (30.15), KCF-0085 (30.0) top scorers |
| Intelligence stats | ✅ 100 farms, ₹52.2L total claims, 34.37% claim ratio |
| Fraud distribution | ✅ 98 LOW, 2 MEDIUM — realistic for clean dataset |
| Severity breakdown | ✅ moderate(32), low(26), high(20), severe(9), minimal(8), none(5) |
| Response times | ✅ All under 7ms including 100-farm pipeline |
| Backward compat | ✅ `/stats/damage` still works (aliases to intelligence) |
