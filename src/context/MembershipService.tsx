import axiosInstance from '../utils/axios';
import { MembershipRequest } from '../components/cards/membershipCard/MembershipCard';

interface MembershipResponse {
    status: string;
    data: {
        requests: MembershipRequest[];
    };
}

interface ApplicationResponse {
    status: string;
    message: string;
    data: {
        request: MembershipRequest;
    };
}

export const getOrganizationMembershipRequests = async (organizationId: string) => {
    try {
        const response = await axiosInstance.get<MembershipResponse>(
            `/organizations/${organizationId}/requests`
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching membership requests for organization ${organizationId}:`,
            error
        );
        throw error;
    }
};

export const acceptMembershipRequest = async (organizationId: string, requestId: string) => {
    try {
        const response = await axiosInstance.put(
            `/organizations/${organizationId}/requests/${requestId}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error accepting membership request ${requestId}:`, error);
        throw error;
    }
};

export const denyMembershipRequest = async (organizationId: string, requestId: string) => {
    try {
        const response = await axiosInstance.delete(
            `/organizations/${organizationId}/requests/${requestId}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error denying membership request ${requestId}:`, error);
        throw error;
    }
};

export const sendJoinRequest = async (organizationId: string, message: string) => {
    try {
        const response = await axiosInstance.post<ApplicationResponse>(
            `/organizations/${organizationId}`,
            {
                message,
            }
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching membership requests for organization ${organizationId}:`,
            error
        );
        throw error;
    }
};
