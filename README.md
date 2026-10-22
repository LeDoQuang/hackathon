# SecondKey — scholarship review with governed permissions

**SecondKey is a scholarship-review prototype that uses TideCloak sign-in and server-side reviewer-role checks, with a proposed QEA-governed role-grant workflow.**

### 1. Vision & originality
Scholarship committees should be able to invite reviewers without letting one privileged account silently decide who gets access. SecondKey puts an access decision—not another form—at the centre of a tiny application.

### 2. Trust constraint insight
Traditional role management can concentrate authority in a single administrator. TideCloak Quorum Enforced Authorization (QEA) is designed to make sensitive role changes depend on independent administrators' approval rather than unilateral action.

### 3. Value & impact
A university could allow external reviewers to inspect particular applications under governed permissions. Our case, SK-024, is synthetic and contains no real applicant data.

### 4. Why TideCloak matters
SecondKey signs in with TideCloak; its FastAPI server validates a Tide-issued JWT and checks for `secondkey-reviewer` before returning a case. The intended governance path grants that role via QEA, *outside the app*. The frontend cannot grant itself a role.

### 5. Prototype & storytelling
**Verified locally:** real TideCloak sign-in and an authenticated request returning **403 Forbidden** when the reviewer role is absent. **Not completed:** a live multi-admin QEA approval and post-approval **200**. The on-screen QEA walkthrough and video explain the *intended* flow, not a completed two-admin demonstration.

---

## Watch the demo

[**demo.mp4**](demo.mp4) — 88-second English-captioned video, including a real local 403 result and clearly marked QEA concept diagrams. It is not a recording of a completed two-admin approval. [English subtitle file](demo.en.srt).

## Run locally (Windows)

Prerequisites: Node.js 22+, Python 3.11+, and a TideCloak development realm. Full instructions: [SETUP_VI.md](SETUP_VI.md).

```powershell
npm.cmd install
npm.cmd run setup:dpop
npm.cmd run dev
```

In a second PowerShell window, from the project folder:

```powershell
$env:TIDE_ISSUER = 'http://localhost:8080/realms/secondkey'
$env:TIDE_AUDIENCE = 'secondkey-client'
python -m pip install -r api/requirements.txt
python -m uvicorn api.server:app --host 127.0.0.1 --port 8000
```

Download your Tide client adapter through **Tide Console → Apps → client → Credentials → Tide adapter** and place it at `public/tidecloak.json`. That real local adapter is not committed to GitHub. The DPoP relay is fetched from the official Tide repository by `setup:dpop`.

Open `http://localhost:5173`. Test the real Tide sign-in and press **Check access**. An authenticated user without `secondkey-reviewer` receives **403**.

## Test

```powershell
python -m pytest api/tests -q
node --check src/main.js
npm.cmd run build
```

## Security boundary (read before deploying)

- A successfully validated JWT role check is **not** proof of successful multi-admin QEA. A demo of two independent approvals and a 403→200 change remains future work.
- Frontend uses DPoP-strict for login. The backend currently checks a **Bearer JWT**, not an HTTP DPoP proof; full RFC 9449 API-bound DPoP is **not** implemented. Do not treat this as a production security design.
- The case is fictional, stored in the API source, **not end-to-end encrypted**, and accessible to server operators. The Tide master realm is outside the prototype's governance boundary.
- This is a local development prototype; do not deploy it publicly or use real applicant records.

## References

[UNLOCKED challenge](https://tide.org/unlocked) · [TideCloak Quickstart](https://docs.tide.org/get-started/Tidecloak%20Quickstart) · [QEA setup](https://docs.tide.org/Admin/SetupIGA)
