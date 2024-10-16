"use client"
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { any, z } from 'zod';
import LoadingButton from '../LoadingButton';
import Image from 'next/image';
import { toast } from 'sonner';
import Cookies from 'js-cookie'

const formSchema = z.object({
    email: z.string().optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(10, "Phone number is required"),
    birthday: z.string().min(6, "birthday is required"),
    home_address: z.string().optional(),
    office_address: z.string().optional(),
    primary_interest: z.string().optional(),
    current_challenges: z.string().optional(),
    preferred_date: z.string().optional(),
    joined_group: z.string().optional(),
    role: z.string().optional(),
});

// Determining the type of our form data by infering it from the zod schema 
type UserFormData = z.infer<typeof formSchema>;

type Props = {
    currentUser: User;
    onSave: (UserProfileData: UserFormData) => void;
    isLoading: boolean;
};

const UserProfileForm = ({ onSave, isLoading, currentUser }: Props) => {
    const form = useForm<UserFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: currentUser,
    });
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    // useEffect(() => {
    //     form.reset(currentUser);
    // }, [currentUser, form])

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file !== undefined) setFile(file as File)
        setImagePreview(URL.createObjectURL(file as File));
    };

    useEffect(() => {
        console.log('form', form.getValues())
    }, [currentUser, form, imagePreview]);


    const uploadPicture = async () => {
        try {

            if (file) {
                setUploading(true)
                const accessToken = Cookies.get('access-token');
                const formData = new FormData()
                formData.append('profile_pic', file)
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/user/upload-profile-picture`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: formData
                })

                let result = await res.json()
                if (!result.status) throw new Error()
                toast.success('Profile Picture updated successfully')
                window.location.reload()
            } else {
                toast.error('please upload a file')
            }
        } catch (error) {
            toast.error("Error occurred. Please refresh the page")
        } finally {
            setUploading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className='space-y-2 bg-gray-50 rounded-lg md:p-10'>
                <FormDescription>
                    View and change your profile information here
                </FormDescription>

                {/* Image Upload and Preview Section */}
                <div className='flex flex-col-reverse justify-center text-center items-start'>
                    <FormItem className='w-full flex justify-start'>
                        <div className='flex items-center gap-2'>
                            <Button className="disabled:cursor-not-allowed" type='button' disabled={uploading}>
                                <FormLabel className='p-2 border-2 mt-3 cursor-pointer bg-blue-500 text-white rounded-lg'> Choose Profile Picture</FormLabel>
                            </Button>
                            {
                                imagePreview && (
                                    <Button type='button' className='border disabled:cursor-not-allowed border-black' disabled={uploading} onClick={uploadPicture}>Upload</Button>
                                )
                            }
                        </div>
                        <FormControl>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageChange}
                                className='bg-white p-2 border border-gray-300 rounded-lg'
                                hidden
                                name="profile_pic"
                            />
                        </FormControl>
                    </FormItem>
                    {(
                        <div className='w-[100px] h-[100px] rounded-full'>
                            <div className='border border-gray-300 p-2 w-full rounded-full h-full'>
                                <img
                                    src={imagePreview || currentUser.profile_pic}
                                    alt=''
                                    className='object-cover w-full rounded-full h-full'
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className='flex flex-wrap w-full justify-between items-start gap-3'>
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled className='bg-white' />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='firstName'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='lastName'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex flex-wrap w-full justify-between items-start gap-3'>
                    <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Phone number</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='birthday'
                        defaultValue={currentUser.birthday}
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Birhday: {currentUser.birthday ? new Date(currentUser.birthday).toLocaleDateString() : ''}</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' type='date' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='home_address'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Home Address</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex flex-wrap w-full justify-between items-start gap-3'>
                    <FormField
                        control={form.control}
                        name='office_address'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Office Address</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='primary_interest'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Primary Interest</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='current_challenges'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Current Challenges</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex flex-wrap w-full justify-between items-start gap-3'>
                    <FormField
                        control={form.control}
                        name='preferred_date'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Preferred Date</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' type='date' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='joined_group'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Joined Group</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='role'
                        render={({ field }) => (
                            <FormItem className='w-[31%]'>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Input {...field} className='bg-white' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                {isLoading ? <LoadingButton /> : <Button type='submit' className='bg-orange-500'>Submit</Button>}
            </form>
        </Form>
    )
}

export default UserProfileForm