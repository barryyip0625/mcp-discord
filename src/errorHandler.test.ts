import { handleDiscordError } from './errorHandler.js';
import { ToolResponse } from './tools/types.js';

describe('handleDiscordError', () => {
  describe('Privileged Intent Errors', () => {
    it('should handle privileged intent error correctly', () => {
      const error = {
        message: 'Privileged intent provided is not enabled or whitelisted'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: Privileged intents are not enabled.

Solution: Please enable the required intents (Message Content, Server Members, Presence) in the Discord Developer Portal for your bot application.

For detailed instructions, check the Prerequisites section in our README.`
        }],
        isError: true
      });
    });

    it('should handle privileged intent error with string error', () => {
      const error = 'Privileged intent provided is not enabled or whitelisted';

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: Privileged intents are not enabled.

Solution: Please enable the required intents (Message Content, Server Members, Presence) in the Discord Developer Portal for your bot application.

For detailed instructions, check the Prerequisites section in our README.`
        }],
        isError: true
      });
    });
  });

  describe('Authorization/Permissions Errors', () => {
    it('should handle missing access error (code 50001)', () => {
      const error = {
        code: 50001,
        message: 'Missing Access'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: The bot is not a member of the target Discord server or lacks required permissions.

Solution: Please add the bot to the target server using this Discord invite link:
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=52076489808

According to Discord's security model, a bot can only access information from servers it has been explicitly added to.`
        }],
        isError: true
      });
    });

    it('should handle unknown guild error (code 10004)', () => {
      const error = {
        code: 10004,
        message: 'Some other message'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: The bot is not a member of the target Discord server or lacks required permissions.

Solution: Please add the bot to the target server using this Discord invite link:
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=52076489808

According to Discord's security model, a bot can only access information from servers it has been explicitly added to.`
        }],
        isError: true
      });
    });

    it('should handle missing permissions error', () => {
      const error = {
        message: 'Missing Permissions'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: The bot is not a member of the target Discord server or lacks required permissions.

Solution: Please add the bot to the target server using this Discord invite link:
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=52076489808

According to Discord's security model, a bot can only access information from servers it has been explicitly added to.`
        }],
        isError: true
      });
    });

    it('should handle unknown guild error in message', () => {
      const error = {
        message: 'Unknown Guild'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: The bot is not a member of the target Discord server or lacks required permissions.

Solution: Please add the bot to the target server using this Discord invite link:
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=52076489808

According to Discord's security model, a bot can only access information from servers it has been explicitly added to.`
        }],
        isError: true
      });
    });

    it('should handle authorization errors with custom client ID', () => {
      const error = {
        code: 50001,
        message: 'Missing Access'
      };
      const clientId = '123456789';

      const result = handleDiscordError(error, clientId);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: The bot is not a member of the target Discord server or lacks required permissions.

Solution: Please add the bot to the target server using this Discord invite link:
https://discord.com/oauth2/authorize?client_id=123456789&scope=bot&permissions=8

According to Discord's security model, a bot can only access information from servers it has been explicitly added to.`
        }],
        isError: true
      });
    });
  });

  describe('Rate Limiting Errors', () => {
    it('should handle rate limit error (code 429)', () => {
      const error = {
        code: 429,
        message: 'Some other message'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: Discord API rate limit reached.

Solution: Please wait a moment before trying again. If this persists, consider spacing out your requests.`
        }],
        isError: true
      });
    });

    it('should handle rate limit error in message', () => {
      const error = {
        message: 'rate limit exceeded'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Error: Discord API rate limit reached.

Solution: Please wait a moment before trying again. If this persists, consider spacing out your requests.`
        }],
        isError: true
      });
    });
  });

  describe('General Errors', () => {
    it('should handle generic error with error object', () => {
      const error = {
        message: 'Some generic error'
      };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Discord API Error: Some generic error`
        }],
        isError: true
      });
    });

    it('should handle generic error with string', () => {
      const error = 'Some string error';

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Discord API Error: Some string error`
        }],
        isError: true
      });
    });

    it('should handle generic error with error object that has no message property', () => {
      const error = { someOtherProperty: 'value' };

      const result = handleDiscordError(error);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Discord API Error: [object Object]`
        }],
        isError: true
      });
    });

    it('should handle generic error with undefined error', () => {
      const result = handleDiscordError(undefined as any);

      expect(result).toEqual({
        content: [{
          type: "text",
          text: `Discord API Error: undefined`
        }],
        isError: true
      });
    });
  });
});