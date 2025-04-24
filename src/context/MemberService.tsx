import axiosInstance from '../utils/axios';
import { Member } from '../components/cards/memberCard/MemberCard';

export interface MemberResponse {
    status: string;
    data: {
        members: Member[];
    };
}

export enum Role {
    Admin = 'ADMIN',
    Member = 'MEMBER',
}

export const getOrganizationMembers = async (organizationId: string) => {
    try {
        const response = await axiosInstance.get<MemberResponse>(
            `/organizations/${organizationId}/members`
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching members for organization ${organizationId}:`, error);
        throw error;
    }
};

export const updateMember = async (organizationId: string, memberId: string, role: Role) => {
    try {
        const response = await axiosInstance.patch(
            `/organizations/${organizationId}/members/${memberId}`,
            {
                role: role,
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error promoting member ${memberId}:`, error);
        throw error;
    }
};

export const removeMember = async (organizationId: string, memberId: string) => {
    try {
        const response = await axiosInstance.delete(
            `/organizations/${organizationId}/members/${memberId}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error removing member ${memberId}:`, error);
        throw error;
    }
};
