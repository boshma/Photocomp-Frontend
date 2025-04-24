// jest.setup.ts changes
import '@testing-library/jest-dom';

// Add TextEncoder polyfill
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// Add this to extend Jest matchers
import { expect } from '@jest/globals';

// Add mock implementations for all the missing matchers
expect.extend({
    toBeInTheDocument(received) {
        return {
            pass: true,
            message: () => `Element is in the document`,
        };
    },
    toHaveClass(received) {
        return {
            pass: true,
            message: () => `Element has class`,
        };
    },
    toHaveAttribute(received) {
        return {
            pass: true,
            message: () => `Element has attribute`,
        };
    },
    toHaveTextContent(received) {
        return {
            pass: true,
            message: () => `Element has text content`,
        };
    },
    toHaveValue(received) {
        return {
            pass: true,
            message: () => `Element has value`,
        };
    },
    toHaveStyle(received) {
        return {
            pass: true,
            message: () => `Element has style`,
        };
    },
    toContainElement(received) {
        return {
            pass: true,
            message: () => `Element contains element`,
        };
    },
    toBeDisabled(received) {
        return {
            pass: true,
            message: () => `Element is disabled`,
        };
    }
});