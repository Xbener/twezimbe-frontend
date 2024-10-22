import { ChannelTypes, CreateChannelTypes } from '@/types';
import Cookies from 'js-cookie'
import { useMutation, useQuery } from 'react-query';
import { toast } from 'sonner';


export const useAddChannel = () => {
    const accessToken = Cookies.get('access-token');
    const ChannelRequest = async (groupData: CreateChannelTypes) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(groupData),
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.errors || responseData.errors || responseData.message);
        }

        return responseData
    };

    const { mutateAsync: addChannel, isLoading, isError, isSuccess, error, reset } = useMutation(ChannelRequest);

    if (isSuccess) {
        toast.success("New Channel Added!");
        // window.location.reload(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${responseData.}`);
    }

    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        addChannel,
        isLoading,
        isError,
        isSuccess
    }
};


export const useGetGroupChannels = () => {
    const accessToken = Cookies.get('access-token');
    const getChannelList = async ({ userId, groupId }: { userId: string, groupId: string }): Promise<any> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/${groupId}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors || responseData.message);
        }
        return responseData
    };

    const { mutateAsync: getChannels, isLoading, isError, isSuccess, error, reset } = useMutation(getChannelList);


    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        getChannels,
        isLoading,
        isError,
        isSuccess
    }
}


export const useGetSingleChannel = () => {
    const accessToken = Cookies.get('access-token');
    const getChannelData = async ({ userId, channelId }: { userId: string, channelId: string }): Promise<any> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/channels/${userId}/${channelId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors || responseData.message);
        }
        return responseData
    };

    const { mutateAsync: getChannel, isLoading, isError, isSuccess, error, reset } = useMutation(getChannelData);


    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        getChannel,
        isLoading,
        isError,
        isSuccess
    }
}