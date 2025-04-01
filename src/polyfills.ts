import { Buffer } from 'buffer';

// Add Buffer to window
window.Buffer = window.Buffer || Buffer;

// Add process and global to window
window.global = window;
window.process = {
  env: { NODE_ENV: process.env.NODE_ENV },
  version: '',
  versions: {},
  platform: '',
  argv: [],
  stdin: undefined,
  stdout: undefined,
  stderr: undefined
} as any; 
