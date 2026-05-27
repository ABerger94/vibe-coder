const crypto = require('crypto');

function html(body) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>GitHub login</title></head><body>${body}</body></html>`;
}

function postMessageScript(payload) {
  return html(`<script>
    if (window.opener) {
      window.opener.postMessage(${JSON.stringify(payload)}, window.location.origin);
      window.close();
    } else {
      document.body.textContent = ${JSON.stringify(payload.error || 'GitHub login finished. You can close this window.')};
    }
  </script>`);
}

module.exports = async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(postMessageScript({
      type: 'vibe-coder-github-oauth',
      error: 'GitHub login is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel.'
    }));
    return;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const origin = `${proto}://${host}`;
  const callbackUrl = `${origin}/api/github-oauth`;
  const url = new URL(req.url, origin);

  if (!url.searchParams.get('code')) {
    const state = crypto.randomBytes(16).toString('hex');
    res.statusCode = 302;
    res.setHeader('set-cookie', `vc_gh_state=${state}; Path=/api/github-oauth; HttpOnly; SameSite=Lax; Secure; Max-Age=600`);
    res.setHeader('location', `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=repo&state=${encodeURIComponent(state)}`);
    res.end();
    return;
  }

  const cookieState = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('vc_gh_state='))?.split('=')[1];
  const returnedState = url.searchParams.get('state');
  if (!cookieState || cookieState !== returnedState) {
    res.statusCode = 400;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(postMessageScript({ type: 'vibe-coder-github-oauth', error: 'GitHub login state did not match. Try signing in again.' }));
    return;
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: url.searchParams.get('code'),
        redirect_uri: callbackUrl
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || `GitHub token exchange failed (${tokenResponse.status})`);
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { authorization: `Bearer ${tokenData.access_token}`, accept: 'application/vnd.github+json', 'user-agent': 'vibe-coder' }
    });
    const user = await userResponse.json();

    res.statusCode = 200;
    res.setHeader('set-cookie', 'vc_gh_state=; Path=/api/github-oauth; HttpOnly; SameSite=Lax; Secure; Max-Age=0');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(postMessageScript({
      type: 'vibe-coder-github-oauth',
      token: tokenData.access_token,
      scope: tokenData.scope || '',
      user: { login: user.login || 'GitHub', avatar_url: user.avatar_url || '' }
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(postMessageScript({ type: 'vibe-coder-github-oauth', error: err.message || 'GitHub login failed.' }));
  }
};
