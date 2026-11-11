// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Bind the dev server to IPv4 loopback; the default bound to ::1 only on this machine.
  server: { host: '127.0.0.1' },
});
