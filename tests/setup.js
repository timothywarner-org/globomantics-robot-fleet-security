// Jest test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};