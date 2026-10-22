import os
import pytest
from fastapi.testclient import TestClient
from api import server

client=TestClient(server.app)

def test_not_logged_in_is_denied():
    resp=client.get('/api/case')
    assert resp.status_code == 401

def test_malformed_bearer_is_denied():
    assert client.get('/api/case', headers={'Authorization':'Bearer '}).status_code == 401


def test_no_realm_is_fail_closed(monkeypatch):
    monkeypatch.setattr(server,'ISSUER','')
    monkeypatch.setattr(server,'AUDIENCE','')
    assert client.get('/api/case',headers={'Authorization':'Bearer aaa.bbb.ccc'}).status_code == 503

def test_token_without_role_is_denied(monkeypatch):
    monkeypatch.setattr(server,'verify_tide_token',lambda _token:{'sub':'abc','realm_access':{'roles':['user']}})
    result=client.get('/api/case',headers={'Authorization':'Bearer test'})
    assert result.status_code == 403
    assert 'Candidate' not in result.text

def test_role_checked_only_after_signature_verification(monkeypatch):
    monkeypatch.setattr(server,'verify_tide_token',lambda _token:{'sub':'abc','realm_access':{'roles':['user','secondkey-reviewer']}})
    result=client.get('/api/case',headers={'Authorization':'Bearer test'})
    assert result.status_code == 200
    assert result.json()['case']['id']=='SK-024'

def test_unsupported_algorithm_denied(monkeypatch):
    monkeypatch.setattr(server,'ISSUER','https://tide.example/realms/test')
    monkeypatch.setattr(server,'AUDIENCE','secondkey')
    import jwt
    token=jwt.encode({'sub':'abc','aud':'secondkey','iss':'https://tide.example/realms/test'},'insecure',algorithm='HS256')
    with pytest.raises(Exception) as err:
        server.verify_tide_token(token)
    assert getattr(err.value,'status_code',None)==401

def test_valid_rsa_signature_and_claims(monkeypatch):
    from cryptography.hazmat.primitives.asymmetric import rsa
    import datetime
    import jwt
    from types import SimpleNamespace
    private_key=rsa.generate_private_key(public_exponent=65537, key_size=2048)
    issuer='https://tide.example/realms/research'
    audience='secondkey'
    monkeypatch.setattr(server,'ISSUER',issuer)
    monkeypatch.setattr(server,'AUDIENCE',audience)
    monkeypatch.setattr(server,'jwks_client',lambda _: SimpleNamespace(get_signing_key_from_jwt=lambda _token:SimpleNamespace(key=private_key.public_key())))
    now=datetime.datetime.now(datetime.timezone.utc)
    def mint(**changes):
        claims={'sub':'person-01','aud':audience,'iss':issuer,'exp':now+datetime.timedelta(minutes=2),
                'realm_access':{'roles':['secondkey-reviewer']}}
        claims.update(changes)
        return jwt.encode(claims,private_key,algorithm='RS256',headers={'kid':'fixture'})
    accepted=server.verify_tide_token(mint())
    assert 'secondkey-reviewer' in accepted['realm_access']['roles']
    with pytest.raises(Exception) as wrong_aud:
        server.verify_tide_token(mint(aud='other-client'))
    assert getattr(wrong_aud.value,'status_code',None)==401
    with pytest.raises(Exception) as expired:
        server.verify_tide_token(mint(exp=now-datetime.timedelta(hours=1)))
    assert getattr(expired.value,'status_code',None)==401


def test_valid_eddsa_token(monkeypatch):
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from types import SimpleNamespace
    import datetime
    import jwt
    signing_key = Ed25519PrivateKey.generate()
    issuer = 'https://tide.example/realms/secondkey'
    monkeypatch.setattr(server, 'ISSUER', issuer)
    monkeypatch.setattr(server, 'AUDIENCE', 'secondkey-client')
    monkeypatch.setattr(server, 'jwks_client', lambda _: SimpleNamespace(
        get_signing_key_from_jwt=lambda _token: SimpleNamespace(key=signing_key.public_key(), key_type='OKP')
    ))
    claims = {'sub':'researcher', 'iss':issuer, 'aud':'secondkey-client',
              'exp':datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(minutes=5),
              'realm_access':{'roles':['secondkey-reviewer']}}
    token = jwt.encode(claims, signing_key, algorithm='EdDSA', headers={'kid':'fixture'})
    assert server.verify_tide_token(token)['sub'] == 'researcher'

def test_client_scoped_role_allowed(monkeypatch):
    monkeypatch.setattr(server,'AUDIENCE','secondkey-client')
    monkeypatch.setattr(server,'verify_tide_token', lambda _: {
        'sub':'reviewer', 'realm_access':{'roles':[]},
        'resource_access':{'secondkey-client':{'roles':['secondkey-reviewer']}}
    })
    assert client.get('/api/case',headers={'Authorization':'Bearer verified'}).status_code == 200
