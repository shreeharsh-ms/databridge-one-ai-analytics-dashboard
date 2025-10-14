// Logger utility// Simple structured logging utility
const isDev = import.meta.env.MODE === 'development';

export const log = (message, ...args) => {
  if (isDev) console.log(`[LOG]: ${message}`, ...args);
};

export const warn = (message, ...args) => {
  console.warn(`[WARN]: ${message}`, ...args);
};

export const error = (message, ...args) => {
  console.error(`[ERROR]: ${message}`, ...args);
};
