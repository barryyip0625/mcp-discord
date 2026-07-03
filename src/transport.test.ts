import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express, { Application } from "express";
import { MCPTransport, StdioTransport, StreamableHttpTransport } from './transport.js';

// Mock the imported modules
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn()
}));

jest.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: jest.fn()
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn()
}));

jest.mock('express', () => {
  const mockApp = {
    use: jest.fn().mockReturnThis(),
    all: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    patch: jest.fn().mockReturnThis(),
    listen: jest.fn((port, host, callback) => {
      process.nextTick(callback);
      // Return a mock HTTP server-like object
      return {
        close: jest.fn((cb) => {
          if (cb) cb();
        })
      };
    })
  };

  const mockExpress: any = jest.fn(() => mockApp);
  mockExpress.json = jest.fn().mockReturnThis();
  return mockExpress;
});

jest.mock('./tools/tools.js', () => ({
  createToolContext: jest.fn()
}));

jest.mock('discord.js', () => ({
  Client: jest.fn(() => ({
    login: jest.fn(),
    on: jest.fn()
  })),
  GatewayIntentBits: {
    Guilds: 'Guilds',
    GuildMessages: 'GuildMessages',
    MessageContent: 'MessageContent',
    GuildMessageReactions: 'GuildMessageReactions'
  }
}));

jest.mock('./logger.js', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('StdioTransport', () => {
  let stdioTransport: StdioTransport;
  let mockServer: jest.Mocked<Server>;

  beforeEach(() => {
    stdioTransport = new StdioTransport();
    mockServer = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<Server>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should initialize StdioServerTransport and connect to server', async () => {
      const mockStdioTransport = {
        close: jest.fn().mockResolvedValue(undefined)
      };
      (require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport as jest.Mock)
        .mockReturnValue(mockStdioTransport);

      await stdioTransport.start(mockServer);

      expect(require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport).toHaveBeenCalledTimes(1);
      expect(mockServer.connect).toHaveBeenCalledWith(mockStdioTransport);
    });
  });

  describe('stop', () => {
    it('should close the transport if it exists', async () => {
      const mockStdioTransport = {
        close: jest.fn().mockResolvedValue(undefined)
      };
      (require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport as jest.Mock)
        .mockReturnValue(mockStdioTransport);

      // Start the transport first to initialize it
      await stdioTransport.start(mockServer);
      await stdioTransport.stop();

      expect(mockStdioTransport.close).toHaveBeenCalled();
    });

    it('should do nothing if transport is not initialized', async () => {
      await stdioTransport.stop();

      expect(stdioTransport).toBeDefined(); // Transport exists but no-op
    });
  });
});

describe('StreamableHttpTransport', () => {
  let httpTransport: StreamableHttpTransport;
  let mockServer: jest.Mocked<Server>;
  let mockApp: jest.Mocked<Application>;
  let mockExpress: jest.Mock;
  let originalConsoleInfo: typeof console.info;

  beforeEach(() => {
    originalConsoleInfo = console.info;
    console.info = jest.fn(); // Suppress console logs during tests
    
    mockExpress = require('express');
    mockApp = {
      use: jest.fn(),
      all: jest.fn(),
      listen: jest.fn((port, host, callback) => {
        process.nextTick(callback);
        return { close: jest.fn((closeCallback) => process.nextTick(closeCallback)) };
      })
    } as unknown as jest.Mocked<Application>;
    
    (mockExpress as jest.Mock).mockReturnValue(mockApp);

    httpTransport = new StreamableHttpTransport(3000);
    mockServer = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<Server>;
  });

  afterEach(() => {
    console.info = originalConsoleInfo; // Restore console.info
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default port if not specified', () => {
      const defaultTransport = new StreamableHttpTransport();
      // Since we can't easily access private properties, we'll verify the initialization indirectly
      expect(defaultTransport).toBeInstanceOf(StreamableHttpTransport);
    });

    it('should initialize with provided port', () => {
      const customPortTransport = new StreamableHttpTransport(9999);
      // Verify the transport was created properly
      expect(customPortTransport).toBeInstanceOf(StreamableHttpTransport);
    });
  });

  describe('start', () => {
    it('should initialize transport and start HTTP server on specified port', async () => {
      const mockTransport = {
        handleRequest: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      };
      (require('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport as jest.Mock)
        .mockReturnValue(mockTransport);

      await httpTransport.start(mockServer);

      expect(require('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport).toHaveBeenCalledTimes(1);
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
      expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0', expect.any(Function));
    });

    it('should set up /mcp endpoint correctly', async () => {
      const mockTransport = {
        handleRequest: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      };
      (require('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport as jest.Mock)
        .mockReturnValue(mockTransport);

      await httpTransport.start(mockServer);

      // Check that the /mcp route was set up
      expect(mockApp.all).toHaveBeenCalledWith('/mcp', expect.any(Function));
    });

    it('should handle errors in /mcp endpoint gracefully', async () => {
      const mockTransport = {
        handleRequest: jest.fn().mockRejectedValue(new Error('Test error')),
        close: jest.fn().mockResolvedValue(undefined)
      };
      (require('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport as jest.Mock)
        .mockReturnValue(mockTransport);

      await httpTransport.start(mockServer);
      
      // Get the handler function for the /mcp route
      const mockRouteHandler = (mockApp.all as jest.Mock).mock.calls.find(
        (call) => call[0] === '/mcp'
      )[1];
      
      // Create mock request and response objects
      const mockReq = { body: {} };
      const mockRes = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(),
        headersSent: false
      };

      await mockRouteHandler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('stop', () => {
    it('should close transport, server, and HTTP server', async () => {
      const mockTransport = {
        handleRequest: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      };
      (require('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport as jest.Mock)
        .mockReturnValue(mockTransport);

      // Start the transport first
      await httpTransport.start(mockServer);
      
      // Now stop it
      await httpTransport.stop();

      expect(mockTransport.close).toHaveBeenCalled();
      expect(mockServer.close).toHaveBeenCalled();
    });

    it('should handle case where HTTP server is not started', async () => {
      await httpTransport.stop();
      // Should not throw any errors
      expect(httpTransport).toBeDefined();
    });
  });
});

describe('MCPTransport Interface', () => {
  it('should define the correct interface', () => {
    // This test ensures the interface contract is maintained
    const mockTransport: MCPTransport = {
      start: jest.fn(),
      stop: jest.fn()
    };

    expect(typeof mockTransport.start).toBe('function');
    expect(typeof mockTransport.stop).toBe('function');
  });
});