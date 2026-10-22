"""SecondKey's protected demonstration API.

No development bypass: missing Tide issuer/audience means fail closed.
Actual QEA approvals occur in TideCloak, not here.
"""
from __future__ import annotations
import os
import jwt
from functools import lru_cache
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from jwt import PyJWKClient

ISSUER = os.getenv('TIDE_ISSUER', '').rstrip('/')
AUDIENCE = os.getenv('TIDE_AUDIENCE', '')
REVIEWER_ROLE = 'secondkey-reviewer'

app = FastAPI(title='SecondKey protected proof API', docs_url=None, redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=[os.getenv('ALLOWED_ORIGIN','http://localhost:5173')], allow_credentials=False, allow_methods=['GET'], allow_headers=['Authorization'])

@lru_cache(maxsize=3)
def jwks_client(issuer: str) -> PyJWKClient:
    return PyJWKClient(f'{issuer}/protocol/openid-connect/certs', cache_jwk_set=True, lifespan=240)


def verify_tide_token(token: str) -> dict:
    if not ISSUER or not AUDIENCE or not ISSUER.startswith(('http://localhost:','https://')):
        raise HTTPException(503, detail='Tide issuer and audience not configured')
    try:
        header = jwt.get_unverified_header(token)
        # The realm may sign tokens with RSA (RS256) or Ed25519 (EdDSA).
        # Reject unsigned, symmetric, and unexpected algorithms.
        algorithm = header.get('alg')
        key_types = {'RS256': 'RSA', 'EdDSA': 'OKP'}
        if algorithm not in key_types:
            raise HTTPException(401, detail='Unsupported JWT signature algorithm')
        signing_jwk = jwks_client(ISSUER).get_signing_key_from_jwt(token)
        if getattr(signing_jwk, 'key_type', key_types[algorithm]) != key_types[algorithm]:
            raise HTTPException(401, detail='JWT key type does not match algorithm')
        claims = jwt.decode(token, key=signing_jwk.key, algorithms=[algorithm], issuer=ISSUER,
                            audience=AUDIENCE, options={'require':['exp','iss','aud','sub']},
                            leeway=15)
        return claims
    except HTTPException:
        raise
    except (jwt.PyJWTError, ValueError, KeyError) as exc:
        raise HTTPException(401, detail='Invalid Tide token') from exc


def require_token(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, detail='Tide sign-in required')
    token = authorization[7:].strip()
    if not token:
        raise HTTPException(401, detail='Bearer token missing')
    return verify_tide_token(token)


@app.get('/api/health')
def health():
    return {'status':'ok', 'tide_configured':bool(ISSUER and AUDIENCE)}


@app.get('/api/case')
def case(authorization: str | None = Header(default=None)):
    claims = require_token(authorization)
    # Accept an authorized realm role or the role scoped to this client.
    # Both must come from the already-verified JWT claims.
    realm_roles = claims.get('realm_access', {}).get('roles', [])
    client_roles = claims.get('resource_access', {}).get(AUDIENCE, {}).get('roles', [])
    roles = set(realm_roles) | set(client_roles)
    if REVIEWER_ROLE not in roles:
        raise HTTPException(403, detail='Reviewer role missing; request governed approval in Tide console')
    # Deliberately synthetic. This is NOT an encrypted database or protected against server-root access.
    return {'authorized_role': REVIEWER_ROLE,
            'case': {'id':'SK-024', 'title':'Scholarship eligibility review — synthetic case',
                     'summary':'Candidate 024: strong academic record, verified community involvement. No real student information.'}}
