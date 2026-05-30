import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
    server: {
    host: '0.0.0.0',
    allowedHosts: [
      'amiibo-alb-273469495.us-east-1.elb.amazonaws.com', // Tvoj konkretni Load Balancer
      '.elb.amazonaws.com',                              // Wildcard koji dopušta AWS provjere
      'localhost'                                        // Za lokalno testiranje ako zatreba
    ],
    port: 3000,
    watch: {
      usePolling: true
    }
  },
});