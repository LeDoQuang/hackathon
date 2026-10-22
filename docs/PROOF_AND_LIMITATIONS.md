# Evidence and limitations for judges

**Observed on the user's local setup, 22 Oct 2026**

- TideCloak realm `secondkey`, client `secondkey-client`, authenticated browser session after DPoP relay fix.
- FastAPI request `GET /api/case` returned **403 Forbidden** when signed-in user lacked the reviewer role.
- Relevant backend line: `GET /api/case HTTP/1.1" 403 Forbidden`.
- The denial screenshot embedded in `demo.mp4` was supplied by the user from the running local app.

**Not demonstrated**

- Additional administrator enrolment; Tide console returned HTTP 400 when trying to add another admin.
- A live 2-of-3 QEA approval; earlier change requests experienced Tide server commit errors.
- `200 OK` after governed role grant; authorization transition remains a *planned* flow.
- Resource-server DPoP proof validation: frontend requests the Tide DPoP session, but backend currently accepts Bearer-scheme signed JWTs and does not validate a DPoP header.
- Encryption of scholarship case: API's synthetic record is not encrypted at rest.

This README and video must not be interpreted as demonstrating those unfinished security properties. For reproducibility, use your own realm and adapter; local secrets are excluded from the GitHub release.
