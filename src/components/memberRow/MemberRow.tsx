import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import MemberCard, { Member } from '../cards/memberCard/MemberCard';

interface MemberRowProps {
    title: string;
    members: Member[];
    onAction: (actionType: string, memberId: string) => void;
    actionTypes: string[];
    actionLabels: string[];
}

const MemberRow: React.FC<MemberRowProps> = ({
    title,
    members,
    onAction,
    actionTypes,
    actionLabels,
}) => {
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<boolean>(false);
    const [displayCount, setDisplayCount] = useState<number>(3);

    const handleSelect = (memberId: string) => {
        setSelectedMemberId(memberId === selectedMemberId ? null : memberId);
    };

    const handleSeeMore = () => {
        setExpandedRow(true);
        setDisplayCount(members.length);
    };

    const handleChange = (actionType: string, selectedMemberId: string) => {
        return () => {
            setSelectedMemberId(null);
            onAction(actionType, selectedMemberId);
        };
    };

    const membersToDisplay = members.slice(0, expandedRow ? members.length : displayCount);

    return (
        <div className="member-row mb-4">
            <h3 className="text-white mb-3">{title}</h3>
            <div
                className={`row-container ${expandedRow ? 'expanded' : ''}`}
                style={{
                    overflowX: 'auto',
                    display: 'flex',
                    gap: '15px',
                    paddingBottom: '10px',
                    whiteSpace: 'nowrap',
                    scrollbarWidth: 'thin',
                    msOverflowStyle: 'none',
                }}
            >
                {membersToDisplay.map(member => (
                    <div
                        key={member.userId}
                        style={{
                            minWidth: '300px',
                            flexShrink: 0,
                            display: 'inline-block',
                        }}
                    >
                        <MemberCard
                            member={member}
                            isSelected={member.userId === selectedMemberId}
                            onSelect={handleSelect}
                        />
                    </div>
                ))}

                {!expandedRow && members.length > displayCount && (
                    <div
                        style={{
                            minWidth: '100px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Button className="p-1" variant="primary" onClick={handleSeeMore}>
                            See more
                        </Button>
                    </div>
                )}
            </div>

            {selectedMemberId && (
                <div className="action-buttons mt-3 mb-4 d-flex gap-3">
                    {actionTypes.map((actionType, index) => (
                        <Button
                            key={actionType}
                            variant={
                                actionType.includes('remove') || actionType.includes('demote')
                                    ? 'danger'
                                    : 'success'
                            }
                            onClick={handleChange(actionType, selectedMemberId)}
                        >
                            {actionLabels[index]}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemberRow;
