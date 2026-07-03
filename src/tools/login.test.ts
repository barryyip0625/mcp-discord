import { loginHandler } from './login.js';
import { DiscordLoginSchema } from '../schemas.js';
import { Client } from 'discord.js';
import { handleDiscordError } from '../errorHandler.js';
import { info, error } from '../logger.js';

// Mock the dependencies
jest.mock('../schemas.js', () => ({
  DiscordLoginSchema: {
    parse: jest.fn()
  }
}));

jest.mock('../errorHandler.js', () => ({
  handleDiscordError: jest.fn()
}));

jest.mock('../logger.js', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('loginHandler', () => {
  let mockClient: {
    isReady: jest.Mock;
    login: jest.Mock;
    once: jest.Mock;
    removeListener: jest.Mock;
    token: string | undefined;
    user: { tag: string } | null;
  };
  let mockContext: any;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockClient = {
      isReady: jest.fn().mockReturnValue(false),
      login: jest.fn().mockResolvedValue(undefined),
      once: jest.fn(),
      removeListener: jest.fn(),
      token: undefined,
      user: null
    };

    mockContext = {
      client: mockClient
    };

    // Reset all mocks
    jest.clearAllMocks();

    // Mock DiscordLoginSchema.parse to return the input unchanged
    (DiscordLoginSchema.parse as jest.Mock).mockImplementation((input) => input);

    // Spy on console methods to prevent test noise
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should return already logged in message if client is already ready', async () => {
    mockClient.isReady.mockReturnValueOnce(true);
    mockClient.user = {
      tag: 'TestUser#1234'
    };

    const args = {};
    const result = await loginHandler(args, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Already logged in as: TestUser#1234" }]
    });
  });

  it('should return error message if no token is provided and client token is not set', async () => {
    const args = {};

    const result = await loginHandler(args, mockContext);

    expect(result).toEqual({
      content: [{
        type: "text",
        text: "Discord token not provided and not configured. Cannot log in. Please check the following: 1. Provide a token in the login command or make sure the token is correctly set in your config or environment variables. 2. Ensure all required privileged intents (Message Content, Server Members, Presence) are enabled in the Discord Developer Portal for your bot application."
      }],
      isError: true
    });
  });

  it('should update client token if token is provided in args', async () => {
    const args = { token: 'test-token-from-args' };

    // Mock the waitForReady functionality
    const loginPromise = Promise.resolve();
    mockClient.login.mockReturnValue(loginPromise);
    mockClient.isReady.mockReturnValueOnce(false).mockReturnValueOnce(true);

    // Mock the ready event listener
    (mockClient.once as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'ready') {
        setTimeout(() => {
          mockClient.isReady.mockReturnValue(true);
          mockClient.user = { tag: 'NewUser#5678' };
          callback();
        }, 10); // Simulate the ready event firing after a delay
      }
    });

    const resultPromise = loginHandler(args, mockContext);

    await loginPromise;
    const result = await resultPromise;

    expect(mockClient.token).toBe('test-token-from-args');
    expect(result.content[0].text).toContain('Successfully logged in to Discord:');
  });

  it('should use context client token if no token provided in args', async () => {
    mockContext.client.token = 'context-token';
    const args = {};

    // Mock the ready event listener
    (mockClient.once as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'ready') {
        // Simulate the ready event firing immediately
        mockClient.isReady.mockReturnValue(true);
        mockClient.user = { tag: 'ContextUser#9999' };
        callback();
      }
    });

    const result = await loginHandler(args, mockContext);

    expect(mockClient.login).toHaveBeenCalledWith('context-token');
    expect(result.content[0].text).toContain('Successfully logged in to Discord: ContextUser#9999');
  });

  it('should handle login error gracefully', async () => {
    const args = { token: 'failing-token' };

    // Mock login to reject
    mockClient.login.mockRejectedValue(new Error('Login failed'));

    // Mock error handler to return a mock error response
    (handleDiscordError as jest.Mock).mockReturnValue({
      content: [{ type: "text", text: "An error occurred during login" }],
      isError: true
    });

    const result = await loginHandler(args, mockContext);

    expect(handleDiscordError).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith('Error in login handler: Login failed');
    expect(result.isError).toBe(true);
  });

  it('should call DiscordLoginSchema.parse with the provided args', async () => {
    const args = { token: 'some-token' };

    // Mock successful login
    const loginPromise = Promise.resolve();
    mockClient.login.mockReturnValue(loginPromise);
    mockClient.isReady.mockReturnValueOnce(false).mockReturnValueOnce(true);
    (mockClient.once as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'ready') {
        setTimeout(() => {
          mockClient.isReady.mockReturnValue(true);
          mockClient.user = { tag: 'TestUser#1234' };
          callback();
        }, 10);
      }
    });

    await loginHandler(args, mockContext);

    expect(DiscordLoginSchema.parse).toHaveBeenCalledWith(args);
  });

  it('should timeout if client does not become ready within the timeout period', async () => {
    const args = { token: 'slow-token' };

    // Mock a login that never becomes ready (for timeout test)
    // We'll simulate this by having the ready event never fire
    mockClient.login.mockResolvedValue(undefined);
    mockClient.isReady.mockReturnValue(false); // Always return false for this test

    // Mock error handler
    (handleDiscordError as jest.Mock).mockReturnValue({
      content: [{ type: "text", text: "Timeout error occurred" }],
      isError: true
    });

    // Increase the timeout for this test since timeout is internally 30 seconds
    const result = await loginHandler(args, mockContext);

    expect(handleDiscordError).toHaveBeenCalled();
    expect(result.isError).toBe(true);
  }, 35000); // Set timeout to 35 seconds to accommodate the internal 30-second timeout
});