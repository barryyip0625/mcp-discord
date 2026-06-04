export function log(message: string, level: 'info' | 'error' = 'info') {
    // Diagnostics must go to stderr: in stdio mode stdout is the JSON-RPC
    // channel, and writing anything else there corrupts the protocol stream.
    process.stderr.write(`[${level}] ${message}\n`);
}

export function info(message: string) {
    log(message, 'info');
}

export function error(message: string) {
    log(message, 'error');
} 