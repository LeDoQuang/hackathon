import './styles.css';

// SecondKey: no fake access grant. The story tour is expressly an illustration;
// actual decisions are delegated to TideCloak QEA, never to a client-side switch.
const app = document.querySelector('#app');
app.innerHTML = `
<div class="shell">
  <header class="nav">
    <a class="logo" href="#top" aria-label="SecondKey home">secondkey<span>.</span></a>
    <div class="nav-right"><a href="#how" class="quiet-link">How it works</a><span id="connection" class="status"><span class="dot"></span><span>Tide setup needed</span></span></div>
  </header>
  <main id="top">
    <section class="hero">
      <div class="eyebrow"><span class="rule"></span> RMIT × TIDE / UNLOCKED CHALLENGE</div>
      <h1>Access decisions should not<br/><em>depend on one admin.</em></h1>
      <p class="intro">Who should be allowed to review a scholarship application? SecondKey explores <b>shared control of permissions</b> using TideCloak governance.</p>
      <div class="actions"><a class="btn" href="#try">See the access check <span aria-hidden="true">↗</span></a><a class="btn outline" href="#how">Understand the idea</a></div>
      <div class="trustline"><span class="small-circle"></span> Using fictional student information · No real applicant data</div>
    </section>

    <section class="focus-panel" id="try" aria-labelledby="try-heading">
      <div class="focus-top"><span class="eyebrow">01 / THE PROTECTED CASE</span><span class="pill" id="auth-tag">Not checked</span></div>
      <div class="focus-content">
        <div class="case-preview">
          <div class="paper-top"><span>SECONDKEY / SCHOLARSHIP 2026</span><span class="doc-mark">SK—024</span></div>
          <div class="file-icon">SK</div>
          <div class="paper-lines"><span></span><span></span><span></span></div>
          <div class="paper-bottom"><span>PRIVATE REVIEW</span><span>● ● ●</span></div>
        </div>
        <div class="check-flow"><h2 id="try-heading">Can you open this case?</h2>
          <p class="muted">A reviewer can open a synthetic application only when their TideCloak account has the approved reviewer role. The server checks the signed access token.</p>
          <div class="mini-rule"><span class="mini-icon">×</span><div><b>Before approval</b><small>The server rejects the request (403).</small></div></div>
          <div class="mini-rule"><span class="mini-icon accepted">✓</span><div><b>When an approved role is issued</b><small>A new valid token can grant access.</small></div></div>
          <div class="btn-group"><button class="btn" id="sign-in">1. Sign in with Tide</button><button class="btn outline hidden" id="sign-out">Sign out</button><button class="btn outline" id="verify-access">2. Check access</button></div>
          <div id="verify-message" class="message" role="status" aria-live="polite"></div>
          <div class="result" id="case-result" role="status" aria-live="polite">No case information loaded yet. Connect TideCloak to perform a real check.</div>
        </div>
      </div>
      <div class="focus-foot"><b>Security note</b><span>Verified locally: Tide login and 403 denial. Multi-admin QEA approval remains to be demonstrated in Tide Console.</span></div>
    </section>

    <section id="how" class="how" aria-labelledby="how-title"><div class="how-head"><span class="eyebrow">02 / THE IDEA IN A MINUTE</span><h2 id="how-title">What a governed approval<br/><em>could look like.</em></h2><p class="muted">Tide QEA supports multi-admin authorization. The three-admin/two-approval flow below is a concept; our live two-admin test is not complete.</p></div>
      <div class="timeline">
        <div class="item"><span class="marker">1</span><h3>Access is requested</h3><p>An admin proposes giving a user the <code>secondkey-reviewer</code> role in TideCloak.</p></div>
        <div class="item"><span class="marker">2</span><h3>One approval is not enough</h3><p>Tide QEA holds the request. It cannot commit until the quorum is satisfied.</p></div>
        <div class="item"><span class="marker">3</span><h3>The second approval changes things</h3><p>If verified and committed, the role grant takes effect. The reviewer signs in again and opens the protected case.</p></div>
      </div>
      <div class="tour"><div><span class="eyebrow">OPTIONAL / STORY WALKTHROUGH</span><p id="demo-story" aria-live="polite">Read through the expected flow. This is an illustration, not a real QEA approval.</p></div><button class="btn outline" id="next-step">Next step →</button></div>
    </section>

    <section class="closing"><div><span class="eyebrow">03 / WHAT TIDE CHANGES</span><h2>Trust the rules,<br/><em>not one powerful account.</em></h2></div><div><p>TideCloak governs identity changes with independent approvals. SecondKey checks those approved roles at the server before returning any case data.</p><p class="footnote">Scope: role governance, not end-to-end encryption. Server operators still have access to the fictional record. Tide's master realm is outside QEA governance; see README for limitations.</p></div></section>
  </main>
  <footer class="footer"><span>SecondKey · RMIT × Tide UNLOCKED 2026</span><span>Working login and 403 check · QEA concept is not a completed live proof.</span></footer>
</div>`;

const $ = (id) => document.getElementById(id);
const steps = [
  'Illustration 1/3 — An admin requests that a reviewer role be granted in the real Tide console. Nothing has been changed by this page.',
  'Illustration 2/3 — With three Tide realm admins, the first approval is below the two-approval threshold. The real change remains pending.',
  'Illustration 3/3 — A second independent admin would approve in Tide QEA Approvals. After a fresh login, the reviewer can test access above.',
];
let storyIndex = 0;
$('next-step').addEventListener('click', () => {
  $('demo-story').textContent = steps[storyIndex];
  storyIndex = (storyIndex + 1) % steps.length;
});

let iam = null;
let signedIn = false;
function setConnection(text, live=false) {
  $('connection').innerHTML = `<span class="dot${live ? ' live' : ''}"></span><span></span>`;
  $('connection').lastElementChild.textContent = text;
}
function setSignedIn(auth) {
  signedIn = Boolean(auth);
  $('sign-in').classList.toggle('hidden', signedIn);
  $('sign-out').classList.toggle('hidden', !signedIn);
  $('auth-tag').textContent = signedIn ? 'Signed in · not yet checked' : 'Not checked';
}
$('sign-in').addEventListener('click', async () => {
  if (!iam) { $('verify-message').textContent = 'Tide is not connected yet. See SETUP_VI.md for the live setup.'; return; }
  try { await iam.doLogin(); }
  catch (err) { $('verify-message').textContent = `Could not sign in: ${err?.message || 'Unknown error'}`; }
});
$('sign-out').addEventListener('click', async () => {
  try { if (iam) await iam.doLogout(); }
  catch (err) { $('verify-message').textContent = `Sign-out failed: ${err?.message || 'Unknown error'}`; }
});
$('verify-access').addEventListener('click', async () => {
  $('case-result').textContent = 'Checking your permission…';
  $('case-result').dataset.result = '';
  try {
    if (!iam || !signedIn) {
      $('case-result').textContent = 'Sign in with a real TideCloak account first. Offline preview cannot authorize access.';
      $('auth-tag').textContent = 'Not authenticated'; return;
    }
    const token = await iam.getToken();
    if (!token) {
      $('case-result').textContent = 'No valid Tide access token. Please sign in again.';
      $('auth-tag').textContent = 'Not authenticated'; return;
    }
    const response = await fetch('/api/case', {headers:{Authorization:`Bearer ${token}`}, cache:'no-store'});
    if (response.status === 403) {
      $('case-result').textContent = 'ACCESS DENIED · 403\n\nYou are signed in, but the server cannot find the approved reviewer role. An administrator must request it in TideCloak; QEA must approve the change.';
      $('auth-tag').textContent = 'Role not approved'; $('case-result').dataset.result='deny'; return;
    }
    if (response.status === 401) {
      $('case-result').textContent = 'Authentication failed · 401\n\nThe backend rejected your token. Check the Tide issuer, token audience and session.';
      $('auth-tag').textContent = 'Invalid token'; return;
    }
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const result = await response.json();
    $('case-result').textContent = `ACCESS APPROVED · 200\n\n${result.case.title}\n${result.case.summary}\n\nVerified role: ${result.authorized_role}`;
    $('auth-tag').textContent = 'Role verified by server'; $('case-result').dataset.result = 'allow';
  } catch (err) {
    $('case-result').textContent = `Could not check access: ${err?.message || 'Unknown error'}. Start the backend and check the Tide connection.`;
    $('auth-tag').textContent = 'Check unavailable';
  }
});

async function startTide() {
  try {
    // The downloaded Tide adapter is needed for the real integration.
    const resp = await fetch('/tidecloak.json', {cache:'no-store'});
    if (!resp.ok) throw new Error('Adapter missing');
    const config = await resp.json();
    if (!config.realm || config.realm.includes('YOUR_')) throw new Error('Adapter not configured');
    const {IAMService} = await import('@tidecloak/js');
    iam = IAMService;
    IAMService.on('ready', (_event, auth) => {setSignedIn(auth); setConnection(auth ? 'Signed in with Tide' : 'Tide is ready', auth);});
    IAMService.on('logout', () => {setSignedIn(false); setConnection('Signed out');});
    IAMService.on('authError', (_event, err) => {setConnection('Tide auth error'); $('verify-message').textContent = err?.message || 'Sign-in failed';});
    IAMService.on('initError', (_event, err) => {setConnection('Tide init error'); $('verify-message').textContent = err?.message || 'Tide initialization failed';});
    IAMService.on('tokenExpired', () => {setSignedIn(false); setConnection('Session expired');});
    await IAMService.initIAM({...config, useDPoP: {mode: "strict"}});
  } catch (_err) {
    setConnection('Tide setup needed');
    $('verify-message').textContent = 'You can explore the page, but live permission checks require the Tide setup in SETUP_VI.md.';
  }
}
startTide();
