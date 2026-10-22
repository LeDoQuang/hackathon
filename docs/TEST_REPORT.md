# Test report — SecondKey release (22 Oct 2026)

## Automated checks run on release source

- `python -m pytest api/tests -q`: **9 passed**, one non-blocking warning about deliberately short HMAC key in the negative test case.
- `node --check src/main.js`: pass.
- `node --check vite.config.js`: pass.
- `node --check scripts/install-dpop.mjs`: pass.
- `node --check scripts/check-dpop.mjs`: pass.
- `demo.mp4`: H.264/AAC MP4, 1280x720, 88 seconds, English captions burned in, under 100MB.

## User-observed integration on local Windows Docker setup

- Tide `secondkey` realm / `secondkey-client` authenticated browser login after enabling DPoP and serving official DPoP relay.
- `GET /api/case` returned `403 Forbidden` without role. User supplied proof screenshot (also in video).

## Not tested/verified for this release

- Production Vite build on release source in this environment (network-restricted npm).
- 2-of-3 independent Tide QEA approval, committed reviewer role, authenticated request returning 200 afterward.
- HTTP DPoP proof validation on API (server checks Bearer JWT signatures and claims only).

Do not confuse unit tests that mock a valid reviewer token with live QEA governance proof.
