import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        define: {
            'process.env': env,
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
