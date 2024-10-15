import { CreateGroupTypes, GroupTypes, JoinGroupTypes } from "@/types";
import Cookies from "js-cookie";
import { useMutation, useQuery } from 'react-query';
import { toast } from 'sonner';
// const API_BASE_URL = process.env.VITE_API_BASE_URL;
const environment = process.env.VITE_ENVIRONMENT;

export const useAddGroup = () => {
    const accessToken = Cookies.get('access-token');
    const GroupRequest = async (groupData: CreateGroupTypes) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups`, {
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
    };

    const { mutateAsync: addGroup, isLoading, isError, isSuccess, error, reset } = useMutation(GroupRequest);

    if (isSuccess) {
        toast.success("New Group Added!");
        // window.location.reload();
    }

    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        addGroup,
        isLoading,
        isError,
        isSuccess
    }
};



export const useGetGroupList = () => {
    const accessToken = Cookies.get('access-token');

    const getAllGroupList = async (): Promise<GroupTypes[]> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/public`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors || responseData.message);
        }
        const { groups } = responseData
        return groups;
    };

    const { data: groups, isLoading } = useQuery("allGroupList", () => getAllGroupList());
    return { groups, isLoading }
};



export const useGetjoinedGroupList = () => {
    const accessToken = Cookies.get('access-token');

    const getJoinedGroupList = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/findByUserId`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors || responseData.message);
        }

        const { groups } = responseData

        return groups;
    };

    const { data: groups, isLoading } = useQuery("joinedGroupList", () => getJoinedGroupList());

    return { joinedGroupList: groups, isLoading }
};



export const useGetGroup = () => {
    const accessToken = Cookies.get('access-token');

    const GroupRequest = async (groupId: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors || responseData.message);
        }

        return responseData.group
    };

    const { mutateAsync: getGroup, isLoading, isError, isSuccess, error, reset } = useMutation(GroupRequest);

    if (isSuccess) {
        toast.success("Group Found");
        // window.location.reload();
    }

    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        getGroup,
        isLoading,
        isError,
        isSuccess
    }
}