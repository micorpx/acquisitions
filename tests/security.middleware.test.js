import { jest } from '@jest/globals';

const buildDecision = ({
  denied = false,
  bot = false,
  shield = false,
  rate = false,
} = {}) => ({
  isDenied: () => denied,
  reason: {
    isBot: () => bot,
    isShield: () => shield,
    isRateLimit: () => rate,
  },
});

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const loadMiddleware = async ({
  nodeEnv = 'development',
  decision = buildDecision(),
  throwProtect = false,
} = {}) => {
  jest.resetModules();
  process.env.NODE_ENV = nodeEnv;

  const protect = jest.fn();
  if (throwProtect) {
    protect.mockRejectedValue(new Error('Arcjet down'));
  } else {
    protect.mockResolvedValue(decision);
  }

  const withRule = jest.fn(() => ({ protect }));
  const warn = jest.fn();
  const error = jest.fn();
  const slidingWindow = jest.fn(() => ({ rule: true }));

  await jest.unstable_mockModule('../src/config/arcjet.js', () => ({
    default: { withRule },
  }));

  await jest.unstable_mockModule('../src/config/logger.js', () => ({
    default: { warn, error },
  }));

  await jest.unstable_mockModule('@arcjet/node', () => ({
    slidingWindow,
  }));

  const { default: securityMiddleware } =
    await import('../src/middleware/security.middleware.js');
  return { securityMiddleware, withRule, protect, warn, error, slidingWindow };
};

describe('security middleware', () => {
  it('skips Arcjet in test environment', async () => {
    const { securityMiddleware, withRule } = await loadMiddleware({
      nodeEnv: 'test',
    });
    const req = {};
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(withRule).not.toHaveBeenCalled();
  });

  it('uses admin-specific rate limit and allows request', async () => {
    const { securityMiddleware, slidingWindow } = await loadMiddleware({
      nodeEnv: 'development',
      decision: buildDecision(),
    });
    const req = { user: { role: 'admin' } };
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(slidingWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        max: 20,
        name: 'admin-rate-limit',
      })
    );
    expect(next).toHaveBeenCalled();
  });

  it('uses user-specific rate limit', async () => {
    const { securityMiddleware, slidingWindow } = await loadMiddleware({
      nodeEnv: 'development',
      decision: buildDecision(),
    });
    const req = { user: { role: 'user' } };
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(slidingWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        max: 10,
        name: 'user-rate-limit',
      })
    );
  });

  it('uses guest-specific rate limit when no user is set', async () => {
    const { securityMiddleware, slidingWindow } = await loadMiddleware({
      nodeEnv: 'development',
      decision: buildDecision(),
    });
    const req = {};
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(slidingWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        max: 5,
        name: 'guest-rate-limit',
      })
    );
    expect(next).toHaveBeenCalled();
  });

  it('blocks bot requests', async () => {
    const { securityMiddleware } = await loadMiddleware({
      decision: buildDecision({ denied: true, bot: true }),
    });

    const req = { ip: '127.0.0.1', path: '/api', get: () => 'UA' };
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Automated requests are not allowed',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks shield-denied requests', async () => {
    const { securityMiddleware } = await loadMiddleware({
      decision: buildDecision({ denied: true, shield: true }),
    });

    const req = {
      ip: '127.0.0.1',
      path: '/api',
      method: 'GET',
      get: () => 'UA',
    };
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Request blocked by security Policy',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks rate-limited requests', async () => {
    const { securityMiddleware } = await loadMiddleware({
      decision: buildDecision({ denied: true, rate: true }),
    });

    const req = { ip: '127.0.0.1', path: '/api', get: () => 'UA' };
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Too many requestss.....',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 500 when Arcjet throws', async () => {
    const { securityMiddleware } = await loadMiddleware({ throwProtect: true });

    const req = {};
    const res = createRes();
    const next = jest.fn();

    await securityMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
