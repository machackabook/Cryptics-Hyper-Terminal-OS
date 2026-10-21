# Golden Forge Financial Singularity — read-only research integration (v17)

**ADAM promotion status:** ORCHBENCH / CODE-REVIEW REQUIRED.
**Production evidence:** no exchange WebSocket end-to-end or Google Gemini live call established yet.
**Financial activity:** no live orders, captures, deposits, withdrawals, transfers, payouts, or Cash App disbursements can be performed by this integration.

## Purpose

The HyperTerminal's historical `arbitrage` and `arbitrage-monitor` interfaces now use one
Golden Forge Financial module, wired to read-only live public quote streams from:

- Coinbase Exchange: `wss://ws-feed.exchange.coinbase.com` with public `ticker` updates
- Kraken Spot v2: `wss://ws.kraken.com/v2` with public `ticker` BBO subscriptions

Supported same-quote-currency symbols: BTC/USD, ETH/USD, SOL/USD. No currency conversion assumed.
Quotes are stamped on receipt, carry optional exchange timestamps, and expire after 8 seconds.
Feed failure is shown as missing / stale data; the code does not substitute fictional prices.

Google **Gemini AI** is a separate interpretive model behind `POST /api/forge/analyze`.
**Google Finance is not used as a real-time market API**; no undocumented finance
scraping endpoint is employed, and a language model is never the price oracle.
The optional Google analysis endpoint receives only browser-declared public quotes,
marks them untrusted, and cannot issue financial orders.

## Mathematical model (paper only)

For base quantity `q`, venue A ask, venue B bid:

```
buyCost         = q * venueA.ask
sellProceeds     = q * venueB.bid
gross            = sellProceeds - buyCost
buyFee           = buyCost * configuredBuyFeeRate
sellFee          = sellProceeds * configuredSellFeeRate
slippageReserve  = (buyCost + sellProceeds) * (bpsPerLeg / 10000)
estimatedNet     = gross - buyFee - sellFee - slippageReserve - transferReserveUsd
```

The UI permits modifying fees, quantity, slippage reserve and transfer reserve.
These are assumptions, not confirmed venue fee tiers. Top-of-book ticker data
does not establish fillable depth, simultaneous liquidity, source balances, venue
eligibility, withdrawal constraints, funding time, taxation or realized profits.
Even positive net estimates are labeled `CANDIDATE_NOT_EXECUTABLE`.

The model deliberately **does not** derive the old $148,290.50 / $32,450.00
fabricated balances, or the previous $4,500 / $1,250 fixture transactions.
Those values entered the Git history through the initial synthetic `server.ts`
release on October 17, 2026; they were not produced by an actual exchange ledger.

## Google server gateway (optional, localhost-only)

Server environment variables:

- `GOOGLE_GENAI_API_KEY` (or `GEMINI_API_KEY`): operator-owned Google key, **never commit**.
- `GEMINI_FINANCE_MODEL`: exact authorized model ID, e.g. a supported `gemini-*` model.
- `FORGE_GOOGLE_ANALYSIS_ENABLED=true`: opt-in analysis switch.
- `CRYPTIC_HOST=127.0.0.1`: server enforces loopback hosting.

Without these requirements `POST /api/forge/analyze` returns 503 `NOT_CONFIGURED`.
With them, the server requests Google Gemini **only** when an operator clicks
“Analyze grounded quotes” after both venue quote streams have fresh observations.
The server enforces a 4/minute per-client soft cap, 12-second upstream timeout,
bounded prompt and response, and a same-local-origin check.

AI analysis is advisory, not trading signal execution. Never paste financial secrets
or personally identifying transaction data into prompts.

## Financial settlement / Cash App distinction

“Cash App Pay” is a *customer checkout payment method* supported by Stripe, not
a generic payout API sending arbitrary funds to a Cash App $cashtag.
Routing genuine profits to Cash App requires an independently documented,
verified, compliant disbursement rail. No such integration is claimed or enabled.

Stripe Live and Test linked-account queries previously returned zero charges,
transfers, payouts, balance transactions and USD available/pending funds for the
connected Cryptic News LLC Stripe account. The old in-memory display was not
evidence that funds could be withdrawn.

## ADAM gates

1. DISCOVER: capture official venue market-data API docs and model availability.
2. OBSERVE: establish both public WebSocket connections from the real deployed browser.
3. NORMALIZE: validate same pair, venue, bid, ask, receive time and optional provider time.
4. CLASSIFY: separate quote-only paper estimate, negative estimate and stale observations.
5. VERIFY: run parser/math tests; retain server response evidence. Never invent successes.
6. FINGERPRINT: SHA-256 the paper input + assumptions; append the fingerprint to local ledger.
7. LOOKUP_REMEDY: on missing feeds, refuse to compute; retry with bounds.
8. APPLY_REMEDY: reconnect public stream and re-observe; never mutate financial balances.
9. REVERIFY: repeat independent quotes; fail closed on stale or unavailable sources.

Promotion to live financial execution is **outside this branch** and requires
separate authorization, authenticated account reconciliation, risk limits,
real executable depth, fractional fills, idempotency, independent kill switch,
signed webhook/settlement receipts and regulatory review.

## Quick verification

```bash
npm install --ignore-scripts
npm run test:forge
npm run test:polyglot
npm run lint
npm run build
npm run dev
```

Open the HyperTerminal's **Arbitrage** or **Arbitrage Monitor** panel.
If browsers/network policy block public market sockets, show `UNREACHABLE` and
`NO DATA`, not simulated activity.

References:
- Coinbase Exchange WebSocket public feeds: https://help.coinbase.com/en/developer-platform/websocket-feeds/exchange
- Kraken ticker API: https://docs.kraken.com/api/docs/websocket-v2/ticker/
- Google Gemini API: https://ai.google.dev/api
- Stripe Cash App Pay: https://docs.stripe.com/payments/cash-app-pay

**Security posture:** read-only market observations and paper receipts.
No profit projection constitutes a promised or historical financial outcome.
