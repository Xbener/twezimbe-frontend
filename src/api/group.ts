import { CreateGroupTypes, GroupTypes, JoinGroupTypes, UpdateGroupTypes } from "@/types";
import Cookies from "js-cookie";
import { useMutation, useQuery } from 'react-query';
import { toast } from 'sonner';
// const API_BASE_URL = process.env.VITE_API_BASE_URL;
const environment = process.env.VITE_ENVIRONMENT;

export const useGetAllGroups = () => {
    const accessToken = Cookies.get('access-token');
    const groupsRequest = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.errors || responseData.errors || responseData.message);
        }

        const { groups } = responseData
        return groups
    }


    const { data: groups, isLoading } = useQuery("allGroupListRequest", () => groupsRequest());
    return { groups: groups as GroupTypes[], isLoading }
}

export const useAddGroup = () => {
    const accessToken = Cookies.get('access-token');

    const GroupRequest = async (groupData: CreateGroupTypes) => {
        console.log(groupData)
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
        return groups;
    };

    const { data: groups, isLoading } = useQuery("allGroupList", () => getAllGroupList());
    return { groups: groups as GroupTypes[], isLoading }
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

        return { group: responseData.group, default_channel: responseData.default_channel }
    };

    const { mutateAsync: getGroup, isLoading, isError, isSuccess, error, reset } = useMutation(GroupRequest);


    if (error) {
        toast.error(error.toString());
        reset();
        window.location.href = '/groups'
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
            throw new Error(responseData.message || responseData.errors);
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



export const useUpdateGroup = () => {
    const accessToken = Cookies.get('access-token');
    const updateGroupRequest = async (updateData: UpdateGroupTypes) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updateData),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || responseData.errors);
        }

        return responseData
    };

    const { mutateAsync: updateGroup, isLoading, isError, isSuccess, error, reset } = useMutation(updateGroupRequest);

    if (isSuccess) {
        toast.success("Group updated Succesfully!");
    }

    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        updateGroup,
        isLoading,
        isError,
        isSuccess
    }
};


export const handleGroupSuspension = async (groupId: string) => {
    try {
        const accessToken = Cookies.get('access-token');
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/suspend/${groupId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.message || data.errors || "Something went wrong. Please try again")
        toast.success(data.message)
        return data.group
    } catch (error: any) {
        toast.error(error.message)
    }
}

export const deleteGroup = async (groupId: string) => {
    try {
        const accessToken = Cookies.get('access-token');
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/groups/${groupId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.message || data.errors || "Something went wrong. Please try again")
        toast.success(data.message)
        return data.status
    } catch (error: any) {
        toast.error(error.message)
    }
}