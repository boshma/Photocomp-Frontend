import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
    id?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search...',
    value,
    onChange,
    onSubmit,
    className = '',
    id = 'topBarSearch',
}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className={`search-bar-form ${className}`}>
            <InputGroup>
                <Form.Control
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="form-input bg-dark border-dark text-light search-input"
                    aria-label="Search"
                />
                <InputGroup.Text className="bg-dark border-dark text-light">
                    <Search />
                </InputGroup.Text>
            </InputGroup>
        </Form>
    );
};

export default SearchBar;
