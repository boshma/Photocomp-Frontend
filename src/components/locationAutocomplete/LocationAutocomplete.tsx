import React, { useState, useEffect, useRef } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';

interface LocationAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

interface LocationSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
    id,
    value,
    onChange,
    placeholder = 'Enter event location',
    required = false,
    className = '',
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            if (inputValue && inputValue.length > 3) {
                fetchSuggestions(inputValue);
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [inputValue]);

    const fetchSuggestions = async (query: string) => {
        if (!query) return;

        setIsLoading(true);
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );

            setSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
        setInputValue(suggestion.display_name);
        onChange(suggestion.display_name);
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className="position-relative">
            <Form.Label style={{ fontFamily: 'Michroma, sans-serif' }} className="fs-4">
                Location
            </Form.Label>
            <Form.Control
                id={id}
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                className={`location-input ${className}`}
                required={required}
                autoComplete="off"
            />

            {isLoading && (
                <div className="position-absolute end-0 top-0 mt-2 me-2">
                    <span
                        className="spinner-border spinner-border-sm text-secondary"
                        role="status"
                        aria-hidden="true"
                    ></span>
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ListGroup>
                    {suggestions.map(suggestion => (
                        <ListGroup.Item
                            key={suggestion.place_id}
                            action
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="py-2 px-3 text-truncate"
                        >
                            {suggestion.display_name}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default LocationAutocomplete;
