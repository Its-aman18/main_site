// JWT verification test for apps/zero-one/server/zeroOneBackend.ts
// Signs main-site-shaped tokens and checks verifyZeroOneSession behavior.
process.env.JWT_SECRET = 'test_shared_secret_for_zero_one_verify';
const jwt = require('jsonwebtoken');

async function main() {
  const { verifyZeroOneSession } = await import(
    '../apps/zero-one/server/zeroOneBackend.ts'
  );
  let pass = 0;
  let fail = 0;
  const check = (name, cond, extra = '') => {
    if (cond) { pass++; console.log(`PASS ${name}`); }
    else { fail++; console.log(`FAIL ${name} ${extra}`); }
  };
  const reqWith = (token, cookie = false) => ({
    headers: cookie
      ? { cookie: `scriet_session=${encodeURIComponent(token)}` }
      : { authorization: `Bearer ${token}` },
  });

  // 1. Valid main-site access token (no purpose claim) via Bearer
  const access = jwt.sign(
    { userId: 'u1', id: 'u1', name: 'Aman', email: 'aman@scriet.edu', role: 'MEMBER' },
    'test_shared_secret_for_zero_one_verify',
    { algorithm: 'HS256', expiresIn: '7d' }
  );
  const id1 = await verifyZeroOneSession(reqWith(access));
  check('valid access token verifies', id1?.email === 'aman@scriet.edu' && id1?.role === 'MEMBER');

  // 2. Same token via scriet_session cookie
  const id2 = await verifyZeroOneSession(reqWith(access, true));
  check('cookie session verifies', id2?.email === 'aman@scriet.edu');

  // 3. Special-purpose token (oauth_exchange) must NOT authenticate
  const exchange = jwt.sign(
    { userId: 'u1', purpose: 'oauth_exchange', jti: 'x' },
    'test_shared_secret_for_zero_one_verify',
    { algorithm: 'HS256', expiresIn: '30s' }
  );
  check('purpose token rejected', (await verifyZeroOneSession(reqWith(exchange))) === null);

  // 4. qotd_reopen purpose rejected
  const reopen = jwt.sign(
    { purpose: 'qotd_reopen', qotdId: 'q', nonce: 'n' },
    'test_shared_secret_for_zero_one_verify',
    { algorithm: 'HS256', expiresIn: '180d' }
  );
  check('qotd purpose token rejected', (await verifyZeroOneSession(reqWith(reopen))) === null);

  // 5. Wrong secret rejected
  const wrong = jwt.sign(
    { userId: 'u1', id: 'u1', email: 'x@y.z', role: 'USER' },
    'some_other_secret',
    { algorithm: 'HS256' }
  );
  check('wrong secret rejected', (await verifyZeroOneSession(reqWith(wrong))) === null);

  // 6. No token -> null (LAN mode preserved)
  check('no token -> null', (await verifyZeroOneSession({ headers: {} })) === null);

  // 7. Garbage token -> null
  check('garbage rejected', (await verifyZeroOneSession(reqWith('not.a.jwt'))) === null);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
