// __mocks__/../errorHandler.js
module.exports = {
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: "text", text: `Discord API Error: ${error.message || 'Unknown error'}` }],
    isError: true
  }))
};