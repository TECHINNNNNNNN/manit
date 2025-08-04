/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    test: {
        // Include only unit test files
        include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

        // Test environment (jsdom for React components, node for pure logic)
        environment: 'node',

        // Setup files (if needed)
        // setupFiles: ['./tests/setup.ts'],
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});