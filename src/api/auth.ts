import { CreateUserTypes, OPTTypes, SignInTypes, UpdateUserTypes, User } from "@/types";
import Cookies from "js-cookie";
import { useMutation, useQuery } from 'react-query';
import { Socket } from "socket.io-client";
import { toast } from 'sonner';

// const API_BASE_URL = process.env.VITE_API_BASE_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const environment = process.env.VITE_ENVIRONMENT;

export const useSignUp = () => {
    const SignUpRequest = async (user: CreateUserTypes) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors);
        }
    };

    const { mutateAsync: signUp, isLoading, isError, isSuccess, error } = useMutation(SignUpRequest);

    if (error) {
        toast.error(error.toString());
    }

    if (isSuccess) {
        window.location.href = '/groups'
    }


    return {
        signUp,
        isLoading,
        isError,
        isSuccess
    }
};

export const useSignIn = () => {
    const SignInRequest = async (user: SignInTypes) => {

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors);
        }

        Cookies.set('access-token', responseData.token, {
            secure: environment === "production" ? true : false,
            expires: 365 * 10 // Set to 10 years
        });

    };

    const { mutateAsync: signIn, isLoading, isError, isSuccess, error } = useMutation(SignInRequest);

    if (error) {
        toast.error(error.toString());
    }

    if (isSuccess) {
        window.location.href = '/groups'
    }

    return {
        signIn,
        isLoading,
        isError,
        isSuccess
    }
};

export const useForgotPassword = () => {
    const ForgotPasswordRequest = async (user: { email: string }) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgotPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors);
        }

        Cookies.set('reset-token', responseData.token)
    };

    const { mutateAsync: forgotPassword, isLoading, isError, isSuccess, error } = useMutation(ForgotPasswordRequest);

    if (error) {
        toast.error(error.toString());
    }

    return {
        forgotPassword,
        isLoading,
        isError,
        isSuccess
    }
};

export const useResetPassword = () => {
    const accessToken = Cookies.get("reset-token");
    const ResetPasswordRequest = async (user: { password: string }) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/resetPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(user),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors);
        }
    };

    const { mutateAsync: resetPassword, isLoading, isError, isSuccess, error } = useMutation(ResetPasswordRequest);

    if (error) {
        toast.error(error.toString());
    }

    return {
        resetPassword,
        isLoading,
        isError,
        isSuccess
    }
};

export const useValidateOTP = () => {
    const SignInRequest = async (data: OPTTypes) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors);
        }
    };

    const { mutateAsync: validateOTP, isLoading, isError, isSuccess, error } = useMutation(SignInRequest);

    if (error) {
        toast.error(error.toString());
    }

    return {
        validateOTP,
        isLoading,
        isError,
        isSuccess
    }
};

export const useRegenerateOTP = () => {
    const SignInRequest = async (data: { id: string }) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/regenerateOtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors);
        }
    };

    const { mutateAsync: validateOTP, isLoading, isError, isSuccess, error } = useMutation(SignInRequest);

    if (error) {
        toast.error(error.toString());
    }

    return {
        validateOTP,
        isLoading,
        isError,
        isSuccess
    }
};

export const useGetProfileData = () => {
    const accessToken = Cookies.get('access-token');
    const getUserProfileRequest = async (): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/user`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const responseData = await response.json();
        if (responseData.message === "User not found") {
            Cookies.remove('access-token')
            Cookies.remove('admin')
            toast.error("This session was not found. Please login again")
        }
        if (!response.ok) {
            throw new Error(responseData.errors);
        }
        return responseData;
    };

    const { data: currentUser, isLoading } = useQuery("userInfo", () => getUserProfileRequest());

    return { currentUser, isLoading }
};


export const useDeleteAccount = () => {
    const deleteUserAccount = async (userId: string) => {
        const accessToken = Cookies.get('access-token');
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }
    const { mutateAsync: deleteAccount, isLoading, isSuccess, error } = useMutation(deleteUserAccount);
    return {
        deleteAccount,
        isLoading
    }

}

export const useUpdateUserAccount = () => {
    const updateUserAccountRequest = async (user: UpdateUserTypes) => {
        const accessToken = Cookies.get('access-token');
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/update/${user._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.errors);
        }
    }

    const { mutateAsync: updateAccount, isLoading, isSuccess, error, reset } = useMutation(updateUserAccountRequest);

    if (isSuccess) {
        toast.success("User profile updated!");
        window.location.reload()
    }

    if (error) {
        toast.error(error.toString());
        reset();
    }

    return {
        updateAccount,
        isLoading
    }
};

export const useGetAllUsers = () => {
    const accessToken = Cookies.get('access-token');
    const getAllUsersRequest = async (): Promise<User[]> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/users`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const responseData = await response.json();

        const { users } = responseData
        if (!response.ok) {
            throw new Error(responseData.errors || responseData.message);
        }

        return users;
    };

    const { data: users, isLoading } = useQuery("users", () => getAllUsersRequest());

    return { users, isLoading }
};



export const changeActiveStatus = async (userId: string, status: string, socket: Socket) => {
    try {
        const accessToken = Cookies.get('access-token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/status`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, status })
        })

        const data = await res.json()
        if (!data.status) return toast.error("Try again")
        if (socket.connected) {
            socket.emit('user-active-status-change', { userId, status })
        }
        return data
    } catch (error) {
        console.log('error changing active status')
    }
}

export const handleSuspension = async (userId: string) => {
    try {
        const accessToken = Cookies.get('access-token');
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/suspend/${userId}`,
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
        return data.user
    } catch (error: any) {
        toast.error(error.message)
    }
}

export const updatePassword = async (body: { oldPassword: string, newPassword: string }) => {
    const accessToken = Cookies.get('access-token');
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/passwords`,
            {
                method: "PUT",
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(body)
            }
        )

        const data = await res.json()
        if (!data.status) throw new Error(data.message || data.errors || "Something went wrong please try again.")
        toast.success(data.message)
        Cookies.remove('access-token')
        Cookies.remove('admin')
        window.location.href = '/public_pages/SignIn'
    } catch (error: any) {
        toast.error(error.message)
    }
}