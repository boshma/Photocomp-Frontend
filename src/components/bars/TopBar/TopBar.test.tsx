import React from 'react';
import { render, screen } from '@testing-library/react';
import TopBar from './TopBar';

jest.mock('react-bootstrap', () => ({
    Navbar: ({
        children,
        bg,
        variant,
        className,
        'data-bs-theme': theme,
        expand,
    }: {
        children: React.ReactNode;
        bg: string;
        variant: string;
        className: string;
        'data-bs-theme': string;
        expand: string;
    }) => (
        <nav
            data-testid="mock-navbar"
            data-bg={bg}
            data-variant={variant}
            data-theme={theme}
            data-expand={expand}
            className={className}
        >
            {children}
        </nav>
    ),
    Container: ({ children, fluid }: { children: React.ReactNode; fluid: boolean }) => (
        <div data-testid="mock-container" data-fluid={fluid}>
            {children}
        </div>
    ),
    Row: ({ children, className }: { children: React.ReactNode; className: string }) => (
        <div data-testid="mock-row" className={className}>
            {children}
        </div>
    ),
    Col: ({
        children,
        xs,
        md,
        className,
    }: {
        children?: React.ReactNode;
        xs: number;
        md: number;
        className: string;
    }) => (
        <div data-testid="mock-col" data-xs={xs} data-md={md} className={className}>
            {children}
        </div>
    ),
}));

describe('TopBar Component', () => {
    const searchComponent = <div data-testid="search-component">Search Component</div>;
    const rightComponents = <div data-testid="right-components">Right Components</div>;

    test('renders with default props', () => {
        render(<TopBar />);

        const navbar = screen.getByTestId('mock-navbar');
        expect(navbar).toHaveAttribute('data-bg', 'dark');
        expect(navbar).toHaveAttribute('data-variant', 'dark');
        expect(navbar).toHaveAttribute('data-theme', 'dark');
        expect(navbar).toHaveClass('py-2');

        const container = screen.getByTestId('mock-container');
        expect(container).toHaveAttribute('data-fluid', 'true');

        const row = screen.getByTestId('mock-row');
        expect(row).toHaveClass('w-100');
        expect(row).toHaveClass('align-items-center');

        const cols = screen.getAllByTestId('mock-col');
        expect(cols).toHaveLength(2);
        expect(cols[0]).toHaveAttribute('data-xs', '12');
        expect(cols[0]).toHaveAttribute('data-md', '9');
        expect(cols[1]).toHaveAttribute('data-xs', '12');
        expect(cols[1]).toHaveAttribute('data-md', '3');
        expect(cols[1]).toHaveClass('d-flex');
        expect(cols[1]).toHaveClass('justify-content-end');
    });

    test('renders search component', () => {
        render(<TopBar searchComponent={searchComponent} />);

        expect(screen.getByTestId('search-component')).toBeInTheDocument();
    });

    test('renders right components', () => {
        render(<TopBar rightComponents={rightComponents} />);

        expect(screen.getByTestId('right-components')).toBeInTheDocument();
    });

    test('renders both search and right components', () => {
        render(<TopBar searchComponent={searchComponent} rightComponents={rightComponents} />);

        expect(screen.getByTestId('search-component')).toBeInTheDocument();
        expect(screen.getByTestId('right-components')).toBeInTheDocument();
    });

    test('applies custom class name', () => {
        render(<TopBar className="custom-class" />);

        const navbar = screen.getByTestId('mock-navbar');
        expect(navbar).toHaveClass('custom-class');
    });

    test('applies custom background and variant', () => {
        render(<TopBar bg="light" variant="light" />);

        const navbar = screen.getByTestId('mock-navbar');
        expect(navbar).toHaveAttribute('data-bg', 'light');
        expect(navbar).toHaveAttribute('data-variant', 'light');
        expect(navbar).toHaveAttribute('data-theme', 'light');
    });
});
