"use client"
import { useSignUp } from "@/api/auth";
import HelmetComponent from "@/components/HelmetComponent";
import SignUpForm from "@/components/forms/SignUpForm";
import { CreateUserTypes } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SignUp = () => {
  const { signUp, isLoading, isSuccess } = useSignUp();
  const router = useRouter();
  
  useEffect(() => {
    if (isSuccess) {
      router.push('/public_pages/ValidateOTP');
    }
  },[isSuccess, router])

  const handleSignUp = (values: Omit<CreateUserTypes, 'role'>) => {
    // Transform the data to include the 'role' property
    const userData: CreateUserTypes = {
      ...values,
      role: "User" // or any default role you want to assign
    };
    signUp(userData);
  };

  return (
    <div className="flex w-full flex-wrap justify-center">
      <HelmetComponent title="Create account" description="Register yourself to start applying" />
      
      <div className="mx-auto w-1/2 hidden lg:flex">
        <img src="/assets/progress3.png" alt="signup" />
      </div>
      <div className="flex flex-col mx-auto w-full lg:w-1/2 border-2  border-neutral-100 p-4 rounded-md shadow-xl items-center justify-center">
        <h1 className="text-3xl text-center md:text-start my-3 font-bold">Create your account now</h1>
        <SignUpForm  onSignUp={handleSignUp} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default SignUp