import axiosInstance from '../utils/axios';

// Define interfaces for the tag data
export interface TaggedUser {
    id: string;
    userId: string;
    photoId: string;
    eventId: string;
    taggedBy: string;
    taggedAt: string;
}

export interface TaggedUserWithDetails {
    tag: TaggedUser;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface TagResponse {
    status: string;
    data: {
        tags: TaggedUser[];
    };
}

/**
 * Get all users tagged in a photo
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param photoId The photo ID
 * @returns Promise with tagged users data
 */
export const getPhotoTags = async (
    orgId: string,
    eventId: string,
    photoId: string
): Promise<{ status: string; data: { tags: TaggedUserWithDetails[] } }> => {
    try {
        const response = await axiosInstance.get(
            `/organizations/${orgId}/events/${eventId}/photos/${photoId}/tags`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching photo tags:', error);
        throw error;
    }
};

/**
 * Tag multiple users in a photo
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param photoId The photo ID
 * @param userIds Array of user IDs to tag
 * @returns Promise with created tags
 */
export const tagUsersInPhoto = async (
    orgId: string,
    eventId: string,
    photoId: string,
    userIds: string[]
): Promise<TagResponse> => {
    try {
        const response = await axiosInstance.post(
            `/organizations/${orgId}/events/${eventId}/photos/${photoId}/tags`,
            { userIds }
        );
        return response.data;
    } catch (error) {
        console.error('Error tagging users in photo:', error);
        throw error;
    }
};

/**
 * Remove a tag (untag a user from a photo)
 * @param orgId The organization ID
 * @param eventId The event ID
 * @param photoId The photo ID
 * @param userId The user ID to untag
 * @returns Promise with success response
 */
export const removeTagFromPhoto = async (
    orgId: string,
    eventId: string,
    photoId: string,
    userId: string
): Promise<{ status: string; message: string }> => {
    try {
        const response = await axiosInstance.delete(
            `/organizations/${orgId}/events/${eventId}/photos/${photoId}/tags/${userId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error removing tag from photo:', error);
        throw error;
    }
};

/**
 * Get all photos a user is tagged in
 * @param userId The user ID
 * @returns Promise with tagged photos
 */
export const getUserTaggedPhotos = async (
    userId: string
): Promise<{ status: string; data: { photos: any[]; count: number } }> => {
    try {
        const response = await axiosInstance.get(`/users/${userId}/tagged-photos`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user tagged photos:', error);
        throw error;
    }
};

export default {
    getPhotoTags,
    tagUsersInPhoto,
    removeTagFromPhoto,
    getUserTaggedPhotos,
};
