import { log, info, error } from './logger.js';

// Mock process.stdout.write to capture log output
const mockStdoutWrite = jest.fn();

describe('Logger', () => {
    let originalStdoutWrite: typeof process.stdout.write;

    beforeEach(() => {
        // Save original function
        originalStdoutWrite = process.stdout.write;
        // Mock the function
        process.stdout.write = mockStdoutWrite;
        // Clear previous calls
        mockStdoutWrite.mockClear();
    });

    afterEach(() => {
        // Restore original function
        process.stdout.write = originalStdoutWrite;
    });

    describe('log', () => {
        it('should log with default info level when no level is provided', () => {
            log('Test message');
            
            expect(mockStdoutWrite).toHaveBeenCalledTimes(1);
            const [call] = mockStdoutWrite.mock.calls;
            const jsonStr = call[0];
            const parsedLog = JSON.parse(jsonStr);
            
            expect(parsedLog).toEqual({
                jsonrpc: '2.0',
                method: 'log',
                params: {
                    level: 'info',
                    message: 'Test message'
                }
            });
            
            // Ensure the log ends with a newline
            expect(jsonStr.endsWith('\n')).toBe(true);
        });

        it('should log with specified info level', () => {
            log('Info message', 'info');
            
            expect(mockStdoutWrite).toHaveBeenCalledTimes(1);
            const [call] = mockStdoutWrite.mock.calls;
            const jsonStr = call[0];
            const parsedLog = JSON.parse(jsonStr);
            
            expect(parsedLog).toEqual({
                jsonrpc: '2.0',
                method: 'log',
                params: {
                    level: 'info',
                    message: 'Info message'
                }
            });
        });

        it('should log with specified error level', () => {
            log('Error message', 'error');
            
            expect(mockStdoutWrite).toHaveBeenCalledTimes(1);
            const [call] = mockStdoutWrite.mock.calls;
            const jsonStr = call[0];
            const parsedLog = JSON.parse(jsonStr);
            
            expect(parsedLog).toEqual({
                jsonrpc: '2.0',
                method: 'log',
                params: {
                    level: 'error',
                    message: 'Error message'
                }
            });
        });

        it('should properly format the JSON-RPC message structure', () => {
            log('Test message', 'info');
            
            const [call] = mockStdoutWrite.mock.calls;
            const jsonStr = call[0];
            const parsedLog = JSON.parse(jsonStr);
            
            expect(parsedLog).toHaveProperty('jsonrpc', '2.0');
            expect(parsedLog).toHaveProperty('method', 'log');
            expect(parsedLog).toHaveProperty('params');
            expect(parsedLog.params).toHaveProperty('level');
            expect(parsedLog.params).toHaveProperty('message');
        });
    });

    describe('info', () => {
        it('should call log with info level', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            info('Info message');
            logSpy.mockRestore();
            
            expect(mockStdoutWrite).toHaveBeenCalledTimes(1);
            const [call] = mockStdoutWrite.mock.calls;
            const jsonStr = call[0];
            const parsedLog = JSON.parse(jsonStr);
            
            expect(parsedLog).toEqual({
                jsonrpc: '2.0',
                method: 'log',
                params: {
                    level: 'info',
                    message: 'Info message'
                }
            });
        });
    });

    describe('error', () => {
        it('should call log with error level', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            error('Error message');
            logSpy.mockRestore();
            
            expect(mockStdoutWrite).toHaveBeenCalledTimes(1);
            const [call] = mockStdoutWrite.mock.calls;
            const jsonStr = call[0];
            const parsedLog = JSON.parse(jsonStr);
            
            expect(parsedLog).toEqual({
                jsonrpc: '2.0',
                method: 'log',
                params: {
                    level: 'error',
                    message: 'Error message'
                }
            });
        });
    });

    describe('output formatting', () => {
        it('should append newline character to the output', () => {
            log('Test message', 'info');
            
            const [call] = mockStdoutWrite.mock.calls;
            const output = call[0];
            
            expect(output).toMatch(/\n$/);
        });

        it('should write stringified JSON to stdout', () => {
            log('Test message', 'info');
            
            const [call] = mockStdoutWrite.mock.calls;
            const output = call[0].slice(0, -1); // Remove newline for parsing
            
            // Should be valid JSON
            expect(() => JSON.parse(output)).not.toThrow();
            
            const parsed = JSON.parse(output);
            expect(parsed).toEqual({
                jsonrpc: '2.0',
                method: 'log',
                params: {
                    level: 'info',
                    message: 'Test message'
                }
            });
        });
    });
});