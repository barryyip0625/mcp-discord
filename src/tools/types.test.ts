import { Client } from "discord.js";
import { ToolResponse, ToolContext, ToolHandler } from "./types.js";

// Mock Discord.js client for testing purposes
const mockClient = {
  // Minimal mock of Discord.js Client interface for testing
  ws: { ping: 0 },
  options: {},
  readyAt: null,
  user: null
} as unknown as Client;

describe('Tool Types', () => {
  describe('ToolResponse', () => {
    it('should have required content property', () => {
      const response: ToolResponse = {
        content: [
          { type: 'text', text: 'Hello world' }
        ]
      };

      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content.length).toBe(1);
      expect(response.content[0]).toEqual({ type: 'text', text: 'Hello world' });
    });

    it('should support optional isError property', () => {
      const responseWithNoError: ToolResponse = {
        content: [{ type: 'success', text: 'Success' }]
      };
      const responseWithError: ToolResponse = {
        content: [{ type: 'error', text: 'Error' }],
        isError: true
      };

      expect(responseWithNoError.isError).toBeUndefined();
      expect(responseWithError.isError).toBe(true);
    });

    it('should allow additional properties via index signature', () => {
      const response: ToolResponse = {
        content: [{ type: 'text', text: 'Test' }],
        customField: 'customValue',
        anotherField: 123,
        nestedObject: { key: 'value' }
      };

      expect(response.customField).toBe('customValue');
      expect(response.anotherField).toBe(123);
      // Since indexer returns unknown, we need to cast or check before accessing
      if (typeof response.nestedObject === 'object' && response.nestedObject !== null) {
        expect((response.nestedObject as { key: string }).key).toBe('value');
      }
    });

    it('should properly type content array elements', () => {
      const response: ToolResponse = {
        content: [
          { type: 'message', text: 'Message text' },
          { type: 'image', text: 'Image description' },
          { type: 'embed', text: 'Embed content' }
        ]
      };

      expect(response.content[0].type).toBe('message');
      expect(response.content[0].text).toBe('Message text');
      expect(response.content[1].type).toBe('image');
      expect(response.content[1].text).toBe('Image description');
      expect(response.content[2].type).toBe('embed');
      expect(response.content[2].text).toBe('Embed content');
    });
  });

  describe('ToolContext', () => {
    it('should have required client property', () => {
      const context: ToolContext = {
        client: mockClient
      };

      expect(context.client).toBeDefined();
      expect(context.client).toBe(mockClient);
    });

    it('should accept Discord.js Client type', () => {
      const context: ToolContext = {
        client: mockClient
      };

      // Verify that the client property is compatible with Discord.js Client
      expect(context.client).toBeInstanceOf(Object); // Basic check since we're mocking
    });
  });

  describe('ToolHandler', () => {
    it('should be a function type that accepts args and context', async () => {
      const handler: ToolHandler<{ message: string }> = async (args, context) => {
        return {
          content: [
            { type: 'text', text: `Received: ${args.message}` }
          ]
        };
      };

      const mockContext: ToolContext = { client: mockClient };
      const args = { message: 'Hello' };
      
      const result = await handler(args, mockContext);
      
      expect(result.content).toEqual([{ type: 'text', text: 'Received: Hello' }]);
    });

    it('should work with generic type parameter', async () => {
      // Define a specific type for arguments
      interface CustomArgs {
        name: string;
        count: number;
      }

      const handler: ToolHandler<CustomArgs> = async (args, context) => {
        return {
          content: [
            { 
              type: 'info', 
              text: `${args.name} has ${args.count} items` 
            }
          ],
          data: { processed: true }
        };
      };

      const mockContext: ToolContext = { client: mockClient };
      const args: CustomArgs = { name: 'TestUser', count: 5 };
      
      const result = await handler(args, mockContext);
      
      expect(result.content[0].text).toBe('TestUser has 5 items');
    });

    it('should handle different argument types', async () => {
      const stringHandler: ToolHandler<string> = async (args: string, context: ToolContext) => {
        return {
          content: [{ type: 'result', text: `String: ${args}` }]
        };
      };

      const numberHandler: ToolHandler<number> = async (args: number, context: ToolContext) => {
        return {
          content: [{ type: 'result', text: `Number: ${args}` }]
        };
      };

      const objectHandler: ToolHandler<{ id: string; value: number }> = async (args: { id: string; value: number }, context: ToolContext) => {
        return {
          content: [{ type: 'result', text: `Object ID: ${args.id}, Value: ${args.value}` }]
        };
      };

      const stringResult = await stringHandler('hello', { client: mockClient });
      const numberResult = await numberHandler(42, { client: mockClient });
      const objectResult = await objectHandler({ id: '123', value: 100 }, { client: mockClient });

      expect(stringResult.content[0].text).toBe('String: hello');
      expect(numberResult.content[0].text).toBe('Number: 42');
      expect(objectResult.content[0].text).toBe('Object ID: 123, Value: 100');
    });

    it('should handle optional generic type parameter', async () => {
      const defaultHandler: ToolHandler<any> = async (args: any, context: ToolContext) => {
        return {
          content: [{ type: 'any', text: 'Handles any type of args' }],
          argsType: typeof args
        };
      };

      const mockContext: ToolContext = { client: mockClient };
      
      // Test with different argument types
      const result1 = await defaultHandler({ anyProperty: 'value' }, mockContext);
      const result2 = await defaultHandler([1, 2, 3], mockContext);
      const result3 = await defaultHandler('string', mockContext);

      expect(result1.content[0].text).toBe('Handles any type of args');
      expect(result2.content[0].text).toBe('Handles any type of args');
      expect(result3.content[0].text).toBe('Handles any type of args');
    });
  });

  describe('Integration - ToolHandler with ToolContext and ToolResponse', () => {
    it('should compose correctly in a practical scenario', async () => {
      interface EchoArgs {
        message: string;
        channelId: string;
      }

      const echoHandler: ToolHandler<EchoArgs> = async (args: EchoArgs, context: ToolContext) => {
        // Simulate using the client from context
        const channelInfo = `Sending to channel: ${args.channelId}`;

        return {
          content: [
            { type: 'echo', text: `Echo: ${args.message}` },
            { type: 'channel', text: channelInfo }
          ],
          sentFrom: context.client.user?.tag || 'unknown',
          success: true
        };
      };

      const context: ToolContext = { client: mockClient };
      const args: EchoArgs = { message: 'Hello Discord!', channelId: '12345' };
      
      const response = await echoHandler(args, context);
      
      expect(response.content.length).toBe(2);
      expect(response.content[0].type).toBe('echo');
      expect(response.content[0].text).toBe('Echo: Hello Discord!');
      expect(response.content[1].type).toBe('channel');
      expect(response.content[1].text).toBe('Sending to channel: 12345');
      expect(response.success).toBe(true);
    });
  });
});