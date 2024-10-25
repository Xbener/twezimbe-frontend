"use client"
import { useForgotPassword, useResetPassword, useValidateOTP } from "@/api/auth";
import HelmetComponent from "@/components/HelmetComponent";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import { ValidateOTPForm } from "@/components/forms/ValidateOTPForm";
import { useRouter } from "next/navigation";


const ResetPassword = () => {
    // const { validateOTP, isSuccess, isLoading } = useValidateOTP();
    const { resetPassword, isError, isLoading, isSuccess } = useResetPassword()
    const router = useRouter()

    if (isSuccess) {
        router.push('/public_pages/signin');
    }

    return (
        <div className="flex w-full flex-wrap items-center justify-center">
            <HelmetComponent title="Reset Password" />

            <div className="flex mx-auto w-full md:w-1/2">
                <img src="/assets/progress3.png" alt="" />
            </div>
            <div className="flex flex-col mx-auto w-full md:w-1/2">
                <h1 className="text-3xl text-center md:text-start my-3 font-bold">Reset Your Password</h1>
                {/* <ValidateOTPForm onValidateOTP={validateOTP} isLoading={isLoading} /> */}
                <ResetPasswordForm onResetPassword={resetPassword} isLoading={isLoading} />
            </div>
        </div>
    )
}

export default ResetPassword