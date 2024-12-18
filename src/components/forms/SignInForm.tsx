import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import LoadingButton from '../LoadingButton';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import SocialAuthForm from './SocialAuthForm';
import Cookies from 'js-cookie'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2, 'Password is required'),
});

type SignInFormData = z.infer<typeof formSchema>;

type Props = {
  onSignIn: (values: SignInFormData) => void;
  isLoading: boolean;
}

const SignInForm = ({ onSignIn, isLoading }: Props) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  // useEffect(() => {
  //   if (Cookies.get('access-token')) {
  //     window.location.href = '/'
  //   }
  // }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSignIn)} className='space-y-2 w-full md:w-4/5'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type={passwordVisible ? 'text' : 'password'} placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex items-center justify-start gap-2'>
          <Checkbox id='viewpassword' className='' onClick={() => setPasswordVisible(!passwordVisible)} />
          <label htmlFor='viewpassword' className='text-sm'> View password</label>
        </div>

        <div className='flex justify-between items-center md:flex-row gap-3 flex-col'>
          {isLoading ? <LoadingButton /> : <Button type='submit' className='bg-gray-800 hover:bg-gray-600 text-white'>Submit</Button>}
          <div>
            {`Don't have an account? `}
            <a href={'/public_pages/SignUp'} className='text-blue-600'>Create account</a>
          </div>
        </div>
        <div className='mt-6'>
          {`Forgot your password? `}
          <a href={'/public_pages/forgotpassword'} className='text-blue-600'>Recover or reset your password</a>
        </div>

      </form>
        <SocialAuthForm />

    </Form>
  )
}

export default SignInForm;