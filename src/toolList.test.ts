import { toolList } from './toolList.js';

// Define types for the tool interface to satisfy TypeScript
interface ToolInputSchema {
  type: string;
  properties: Record<string, any>;
  required: string[];
}

interface Tool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

describe('toolList', () => {
  // Basic structure tests
  test('should be an array', () => {
    expect(Array.isArray(toolList)).toBe(true);
  });

  test('should have at least one tool', () => {
    expect(toolList.length).toBeGreaterThan(0);
  });

  test('should contain objects with required properties', () => {
    for (const tool of toolList as Tool[]) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.inputSchema).toBe('object');
    }
  });

  // Name validation tests
  test('all tool names should be non-empty strings', () => {
    for (const tool of toolList as Tool[]) {
      expect(tool.name).toBeTruthy();
      expect(typeof tool.name).toBe('string');
      expect(tool.name.length).toBeGreaterThan(0);
    }
  });

  test('all tool names should follow snake_case convention', () => {
    const snakeCaseRegex = /^[a-z][a-z0-9_]*[a-z0-9]$/;
    for (const tool of toolList as Tool[]) {
      expect(tool.name).toMatch(snakeCaseRegex);
    }
  });

  // Description validation tests
  test('all descriptions should be non-empty strings', () => {
    for (const tool of toolList as Tool[]) {
      expect(tool.description).toBeTruthy();
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);
    }
  });

  // Input schema validation tests
  test('all input schemas should have valid structure', () => {
    for (const tool of toolList as Tool[]) {
      const schema = tool.inputSchema;
      expect(schema).toHaveProperty('type');
      expect(schema.type).toBe('object');
      expect(schema).toHaveProperty('properties');
      expect(typeof schema.properties).toBe('object');
      expect(schema).toHaveProperty('required');
      expect(Array.isArray(schema.required)).toBe(true);
    }
  });

  test('input schema properties should have valid types', () => {
    for (const tool of toolList) {
      const schema = tool.inputSchema;
      for (const [propName, propDef] of Object.entries(schema.properties)) {
        const typedPropDef = propDef as any;
        
        // Properties should have a type
        expect(typedPropDef).toHaveProperty('type');
        const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'null'];
        expect(validTypes).toContain(typedPropDef.type);

        // Arrays should have items definition
        if (typedPropDef.type === 'array') {
          expect(typedPropDef).toHaveProperty('items');
          expect(typedPropDef.items).toHaveProperty('type');
        }

        // Numbers may have minimum/maximum/default values
        if (typedPropDef.type === 'number') {
          if ('minimum' in typedPropDef) {
            expect(typeof typedPropDef.minimum).toBe('number');
          }
          if ('maximum' in typedPropDef) {
            expect(typeof typedPropDef.maximum).toBe('number');
          }
          if ('default' in typedPropDef) {
            expect(typeof typedPropDef.default).toBe('number');
          }
        }

        // Strings may have enum values
        if (typedPropDef.type === 'string' && 'enum' in typedPropDef) {
          expect(Array.isArray(typedPropDef.enum)).toBe(true);
          for (const enumValue of typedPropDef.enum || []) {
            expect(typeof enumValue).toBe('string');
          }
        }
      }
    }
  });

  test('required fields should be a subset of properties', () => {
    for (const tool of toolList as Tool[]) {
      const schema = tool.inputSchema;
      for (const requiredField of schema.required as string[]) {
        expect(Object.keys(schema.properties)).toContain(requiredField);
      }
    }
  });

  // Specific tool tests
  test('should have discord_send tool with correct schema', () => {
    const discordSendTool = toolList.find((tool: Tool) => tool.name === 'discord_send');
    expect(discordSendTool).toBeDefined();

    if (discordSendTool) {
      expect(discordSendTool.description).toContain('Sends a message');
      expect(discordSendTool.inputSchema.required).toContain('channelId');
      expect(discordSendTool.inputSchema.required).toContain('message');
      expect(discordSendTool.inputSchema.properties).toHaveProperty('replyToMessageId');
    }
  });

  test('should have discord_login tool with correct schema', () => {
    const discordLoginTool = toolList.find((tool: Tool) => tool.name === 'discord_login');
    expect(discordLoginTool).toBeDefined();

    if (discordLoginTool) {
      expect(discordLoginTool.inputSchema.required).toEqual([]);
      expect(discordLoginTool.inputSchema.properties).toHaveProperty('token');
    }
  });

  test('should have discord_search_messages tool with complex schema', () => {
    const searchTool = toolList.find((tool: Tool) => tool.name === 'discord_search_messages');
    expect(searchTool).toBeDefined();

    if (searchTool) {
      const props = searchTool.inputSchema.properties;
      expect(props.guildId).toBeDefined();
      expect(props.content).toBeDefined();
      expect(props.authorId).toBeDefined();
      expect(props.has).toBeDefined();
      expect(props.has).toHaveProperty('enum');
      expect(props.authorType).toHaveProperty('enum');
      expect(searchTool.inputSchema.required).toContain('guildId');
    }
  });

  test('should have tools with array type properties correctly defined', () => {
    const toolsWithArrays = toolList.filter((tool: Tool) =>
      Object.values((tool.inputSchema as any).properties).some((prop: any) => prop.type === 'array')
    );

    expect(toolsWithArrays.length).toBeGreaterThan(0);

    // Check that array properties have items defined
    for (const tool of toolsWithArrays) {
      for (const [propName, propDef] of Object.entries((tool.inputSchema as any).properties)) {
        const typedPropDef = propDef as any;
        if (typedPropDef.type === 'array') {
          expect(typedPropDef).toHaveProperty('items');
          expect(typedPropDef.items).toHaveProperty('type');
        }
      }
    }
  });

  // Unique name test
  test('all tool names should be unique', () => {
    const names = toolList.map((tool: Tool) => tool.name);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });
});