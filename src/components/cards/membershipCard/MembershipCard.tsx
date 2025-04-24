import React from 'react';
import { Card } from 'react-bootstrap';

export interface UserDetails {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface MembershipRequest {
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    userId: string;
    status: string;
    requestDate: string;
    organizationName: string;
    type: string;
    message?: string;
    userDetails?: UserDetails;
}

interface MembershipCardProps {
    request: MembershipRequest;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ request, isSelected, onSelect }) => {
    const requestId = request.SK.split('#')[1] || request.userId;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const firstName = request.userDetails?.firstName;
    const lastName = request.userDetails?.lastName;
    const displayName = `${firstName} ${lastName}`;

    return (
        <Card
            className={`membership-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(requestId)}
            style={{
                width: '300px',
                height: '200px',
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#4d5154' : '#343a40',
                borderColor: isSelected ? '#fff' : 'transparent',
                borderWidth: isSelected ? '2px' : '1px',
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <div className="card-content text-white p-4 d-flex flex-column justify-content-between h-100">
                <div>
                    <h5 className="card-title">{displayName}</h5>
                    {request.message && (
                        <p className="card-message text-white-50 small">"{request.message}"</p>
                    )}
                </div>

                <div className="card-footer bg-transparent border-0 text-white-50">
                    <small>Requested on {formatDate(request.requestDate)}</small>
                </div>
            </div>
        </Card>
    );
};

export default MembershipCard;
