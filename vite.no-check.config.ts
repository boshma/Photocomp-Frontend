// vite.no-check.config.ts (new file)
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [
            react({
                // Use SWC for better performance and no type checking
                jsxImportSource: 'react',
                jsxRuntime: 'automatic',
                babel: {
                    plugins: [
                        '@babel/plugin-transform-react-jsx',
                        '@babel/plugin-transform-react-jsx-development',
                    ],
                },

            })
        ],
        define: {
            'process.env': env,
        },
        // Skip type checking entirely
        esbuild: {
            tsconfigRaw: '{"compilerOptions":{"jsx":"react-jsx","jsxImportSource":"react"}}',
        },
        test: {
            globals: true,
            environment: 'jsdom',
            alias: {
                '^.+\\.(jpg|jpeg|png|gif|svg)$': '/tests/__mocks__/fileMock.ts',
            },
        },
    };
});