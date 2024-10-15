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

        return responseData
    };

    const { mutateAsync: addGroup, isLoading, isError, isSuccess, error, reset } = useMutation(GroupRequest);

    if (isSuccess) {
        toast.success("New Group Added!. Check your inbox for invitation link");
        // window.location.reload(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/groups/${responseData.}`);
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
        console.log('groups dfs', groups)
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


export const useJoinGroup = () => {
    const accessToken = Cookies.get('access-token');
    const JoinGroupRequest = async (joinData: JoinGroupTypes) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(joinData),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message);
        }

        return responseData.group
    };

    const { mutateAsync: joinGroup, isLoading, isError, isSuccess, error, reset } = useMutation(JoinGroupRequest);

    if (isSuccess) {
        toast.success("Joined Succesfully!");
    }

    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        joinGroup,
        isLoading,
        isError,
        isSuccess
    }
};