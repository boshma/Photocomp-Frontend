import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    return (
        <footer className={`footer bg-dark text-light py-3 text-center ${className}`}>
            <Container fluid className="d-flex justify-content-center align-items-center">
                <div className="d-flex gap-3 text-center">
                    <div className="footer-copyright">
                        © {new Date().getFullYear()} PHOTOCOMP. All rights reserved.
                    </div>
                    <div className="footer-links">
                        <Link to="/content-policy" className="text-light">
                            Content Policy
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
