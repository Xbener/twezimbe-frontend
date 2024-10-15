"use client"
import { useSignIn } from "@/api/auth";
import HelmetComponent from "@/components/HelmetComponent";
import SignInForm from "@/components/forms/SignInForm";

const SignIn = () => {
  const { signIn, isLoading, isSuccess, } = useSignIn();

  if (isSuccess) {
    window.location.href = '/groups';
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-center">
      <HelmetComponent title="Sign in to your account" />

      <div className="flex mx-auto w-full md:w-1/2">
        <img src="/assets/progress3.png" alt="signin" />
      </div>
      <div className="flex flex-col mx-auto w-full md:w-1/2 border-2  border-neutral-100 p-4 rounded-md shadow-xl items-center justify-center">
        <h1 className="text-3xl text-center md:text-start my-3 font-bold">Sign in to your account</h1>
        <SignInForm onSignIn={signIn} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default SignIn