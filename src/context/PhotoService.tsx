import axiosInstance from '../utils/axios';

export interface Photo {
    PK: string;
    SK: string;
    id: string;
    eventId: string;
    url: string;
    urls?: {
        original?: string;
        thumbnail?: string;
        medium?: string;
        large?: string;
    };
    createdAt: string;
    updatedAt: string;
    uploadedBy: string;
    metadata?: {
        title?: string;
        description?: string;
        size?: number;
        width?: number;
        height?: number;
        mimeType?: string;
        s3Key?: string;
    };
    GSI2PK: string;
    GSI2SK: string;
}

export interface PhotosResponse {
    status: string;
    data: {
        photos: Photo[];
    };
}

export interface PhotoUploadResponse {
    status: string;
    data: {
        photo?: Photo;
        photos?: Photo[];
    };
}

/**
 * Gets all photos for an event
 * @param orgName The organization name
 * @param eventId The ID of the event
 * @returns Promise with the response data
 */
export const getAllPhotos = async (orgName: string, eventId: string): Promise<PhotosResponse> => {
    try {
        const response = await axiosInstance.get<PhotosResponse>(
            `/organizations/${orgName}/events/${eventId}/photos`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching photos of an event:', error);
        throw error;
    }
};

/**
 * Uploads a photo or multiple photos to an event
 * @param orgId The organization ID
 * @param eventId The ID of the event
 * @param formData FormData containing the photo file(s) and metadata
 * @param isMultiple Whether this is a multiple file upload
 * @param onProgress Optional callback for tracking upload progress
 * @returns Promise with the response data
 */
export const uploadEventPhoto = async (
    orgId: string,
    eventId: string,
    formData: FormData,
    isMultiple: boolean = false,
    onProgress?: (progress: number) => void
): Promise<PhotoUploadResponse> => {
    try {
        // Add query parameter for multiple files if needed
        const endpoint = isMultiple
            ? `/organizations/${orgId}/events/${eventId}/photos?multiple=true`
            : `/organizations/${orgId}/events/${eventId}/photos`;

        const response = await axiosInstance.post<PhotoUploadResponse>(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: progressEvent => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading photo(s) to event:', error);
        throw error;
    }
};

/**
 * Gets a download URL for a specific photo
 * @param orgId The organization ID
 * @param eventId The ID of the event
 * @param photoId The ID of the photo
 * @param size The desired photo size
 * @returns Promise with the response data
 */
export const getPhotoDownloadUrl = async (
    orgId: string,
    eventId: string,
    photoId: string,
    size: 'thumbnail' | 'medium' | 'large' | 'original' = 'original'
): Promise<{ status: string; data: { downloadUrl: string; size: string } }> => {
    try {
        const response = await axiosInstance.get(
            `/organizations/${orgId}/events/${eventId}/photos/${photoId}/download`,
            { params: { size } }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting photo download URL:', error);
        throw error;
    }
};

/**
 * Delete a photo from an event
 * @param orgId The organization ID
 * @param eventId The ID of the event
 * @param photoId The ID of the photo to delete
 * @returns Promise with the response data
 */
export const deletePhoto = async (
    orgId: string,
    eventId: string,
    photoId: string
): Promise<{ status: string; message: string }> => {
    try {
        const response = await axiosInstance.delete(
            `/organizations/${orgId}/events/${eventId}/photos/${photoId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};
