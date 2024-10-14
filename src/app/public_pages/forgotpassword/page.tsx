"use client"
import { useForgotPassword, useValidateOTP } from "@/api/auth";
import HelmetComponent from "@/components/HelmetComponent";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { ValidateOTPForm } from "@/components/forms/ValidateOTPForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


const ForgotPassword = () => {
    // const { validateOTP, isSuccess, isLoading } = useValidateOTP();
    const { forgotPassword, isError, isLoading, isSuccess } = useForgotPassword()
    const router = useRouter()

    if (isSuccess) {
        toast.success("Check your inbox for password reset link. ")
    }

    return (
        <div className="flex w-full flex-wrap items-center justify-center">
            <HelmetComponent title="Change Password" />

            <div className="flex mx-auto w-full md:w-1/2">
                <img src="/assets/progress3.png" alt="" />
            </div>
            <div className="flex flex-col mx-auto w-full md:w-1/2">
                <h1 className="text-3xl text-center md:text-start my-3 font-bold">Change Your Password</h1>
                {/* <ValidateOTPForm onValidateOTP={validateOTP} isLoading={isLoading} /> */}
                <ForgotPasswordForm onForgotPassword={forgotPassword} isLoading={isLoading} />
            </div>
        </div>
    )
}

export default ForgotPassword