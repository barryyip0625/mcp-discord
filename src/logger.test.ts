import { error, info, log } from './logger.js';

describe('protocol-safe logger', () => {
    let stderrWrite: jest.SpyInstance;
    let stdoutWrite: jest.SpyInstance;

    beforeEach(() => {
        stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
        stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => jest.restoreAllMocks());

    it('writes diagnostics only to stderr', () => {
        log('message');
        expect(stderrWrite).toHaveBeenCalledWith('[info] message\n');
        expect(stdoutWrite).not.toHaveBeenCalled();
    });

    it('labels info messages', () => {
        info('ready');
        expect(stderrWrite).toHaveBeenCalledWith('[info] ready\n');
    });

    it('labels error messages', () => {
        error('failed');
        expect(stderrWrite).toHaveBeenCalledWith('[error] failed\n');
    });
});
