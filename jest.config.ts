import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/__mocks__/fileMock.js',
    },
};

export default config;
