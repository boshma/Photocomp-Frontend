import axiosInstance, { noAuthInstance } from '../utils/axios';

export const registerUser = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}) => {
    return noAuthInstance.post('/api/auth/register', data);
};

export const loginUser = async (data: { email: string; password: string }) => {
    return noAuthInstance.post('/api/auth/login', data);
};

/**
 * Change user password
 * @param currentPassword Current password for verification
 * @param newPassword New password to set
 * @returns Promise with success response
 */
export const changePassword = async (currentPassword: string, newPassword: string) => {
    return axiosInstance.patch('/api/auth/password', {
        currentPassword,
        newPassword,
    });
};

/**
 * Delete user account
 * @param userId User ID to delete
 * @returns Promise with success response
 */
export const deleteAccount = async (userId: string) => {
    return axiosInstance.delete(`/api/auth/users/${userId}`);
};

export interface UserOrgRelationship {
    GSI1PK: string;
    joinedAt: string;
    role: string;
    updatedAt: string;
    userId: string;
    SK: string;
    GSI1SK: string;
    PK: string;
    organizationName: string;
    type: string;
}

export const isMemberOfOrg = async (
    userId: string,
    orgId: string
): Promise<{ status: string; data: { data: { membership: UserOrgRelationship } } }> => {
    return axiosInstance.get(`/users/${userId}/members/${orgId}`);
};
