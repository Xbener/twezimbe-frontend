"use client";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingButton from "../LoadingButton";
import Image from "next/image";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useState } from "react";

const formSchema = z.object({
    title: z.enum(["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."]).optional(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    religion: z.string().optional(),
    place_of_birth: z.string().optional(),
    current_parish: z.string().optional(),
    birthday: z.string().min(10, "Birthday is required"),
    national_id_number: z.string().optional(),
    national_id_photo: z.string().optional(),
    phone: z.string().min(10, "Phone number is required"),
    home_address: z.string().optional(),
    home_location_map: z.string().optional(),
    district_of_birth: z.string().optional(),
    parish_of_birth: z.string().optional(),
    village_of_birth: z.string().optional(),
    marital_status: z.enum(["Single", "Married", "Divorced", "Widowed"]).optional(),
    occupation: z.string().optional(),
    job_title: z.string().optional(),
    next_of_kin: z.object({
        national_id_link: z.string().optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
    }).optional(),
    monthly_income_level: z.enum([
        "Less than UGX 1,000,000",
        "UGX 1,000,000 - 5,000,000",
        "UGX 5,000,000 - 15,000,000",
        "Above UGX 15,000,000",
    ]).optional(),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    bank_mobile_account: z.string().optional(),
    bank_email: z.string().optional(),
    highest_education_level: z.enum([
        "Secondary (Ordinary Level)",
        "Secondary (Advanced Level)",
        "Tertiary",
        "University",
        "Other (Specify)",
    ]).optional(),
    employment_status: z.enum([
        "Employed",
        "Self-employed",
        "Unemployed",
        "Retired",
    ]).optional(),
    current_work_address: z.string().optional(),
    employer_name: z.string().optional(),
    current_salary: z.string().optional(),
    side_hustle_income: z.string().optional(),
});

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

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file !== undefined) setFile(file as File)
        setImagePreview(URL.createObjectURL(file as File));
    };


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
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-2 bg-gray-50 rounded-lg md:p-10 w-full grid grid-cols-3 gap-5">
                <FormDescription>View and change your profile information here</FormDescription>
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

                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    <SelectTrigger className="bg-white w-full">
                                        <SelectValue placeholder="Select Title" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem className="cursor-pointer" value="Mr.">Mr.</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Ms.">Ms.</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Mrs.">Mrs.</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Dr.">Dr.</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Prof.">Prof.</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Full Name */}
                <div className="flex flex-wrap w-full justify-between gap-3">
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>
                {/* Gender */}
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    <SelectTrigger className="bg-white w-full">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem className="cursor-pointer" value="Male">Male</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Female">Female</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Religion */}
                <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Religion</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Place of Birth */}
                <FormField
                    control={form.control}
                    name="place_of_birth"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Place of Birth</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Current Parish */}
                <FormField
                    control={form.control}
                    name="current_parish"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Current Parish</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Date of Birth */}
                <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Input {...field} type="date" className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* National ID Details */}
                <FormField
                    control={form.control}
                    name="national_id_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>National ID Number</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="national_id_photo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload National ID Photo</FormLabel>
                            <FormControl>
                                <Input {...field} type="file" accept="image/*" className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Contact Information */}
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" disabled className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Address Information */}
                <FormField
                    control={form.control}
                    name="home_address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Home Address</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="home_location_map"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Home Location on Google Map</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Birth Information */}
                <div className="flex flex-wrap w-full justify-between gap-3">
                    <FormField
                        control={form.control}
                        name="district_of_birth"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>District of Birth</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="parish_of_birth"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Parish of Birth</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="village_of_birth"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Village of Birth</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Marital Status */}
                <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Marital Status</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    <SelectTrigger className="bg-white w-full">
                                        <SelectValue placeholder="Select Marital Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem className="cursor-pointer" value="Single">Single</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Married">Married</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Divorced">Divorced</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Widowed">Widowed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Occupation */}
                <div className="flex flex-wrap w-full justify-between gap-3">
                    <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Profession</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="job_title"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Job Title/Description</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Next of Kin/Beneficiaries */}
                <FormField
                    control={form.control}
                    name="next_of_kin.national_id_link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link to National ID</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-wrap w-full justify-between gap-3">
                    <FormField
                        control={form.control}
                        name="next_of_kin.name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Next of Kin Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="next_of_kin.phone"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Next of Kin Phone</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="next_of_kin.email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Next of Kin Email</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Financial Information */}
                <FormField
                    control={form.control}
                    name="monthly_income_level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Income Level</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    <SelectTrigger className="bg-white w-full">
                                        <SelectValue placeholder="Select Income Level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem className="cursor-pointer" value="Less than UGX 1,000,000">Less than UGX 1,000,000</SelectItem>
                                        <SelectItem className="cursor-pointer" value="UGX 1,000,000 - 5,000,000">UGX 1,000,000 - 5,000,000</SelectItem>
                                        <SelectItem className="cursor-pointer" value="UGX 5,000,000 - 15,000,000">UGX 5,000,000 - 15,000,000</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Above UGX 15,000,000">Above UGX 15,000,000</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Bank Account Details */}
                <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name of Bank</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bank_account_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bank_mobile_account"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registered Mobile Account with Bank</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bank_email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registered Email with Bank</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Educational Information */}
                <FormField
                    control={form.control}
                    name="highest_education_level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Highest Level of Education</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    <SelectTrigger className="bg-white w-full">
                                        <SelectValue placeholder="Select Education Level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem className="cursor-pointer" value="Secondary (Ordinary Level)">Secondary (Ordinary Level)</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Secondary (Advanced Level)">Secondary (Advanced Level)</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Tertiary">Tertiary</SelectItem>
                                        <SelectItem className="cursor-pointer" value="University">University</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Other (Specify)">Other (Specify)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Employment Information */}
                <FormField
                    control={form.control}
                    name="employment_status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Employment Status</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    <SelectTrigger className="bg-white w-full">
                                        <SelectValue placeholder="Select Employment Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem className="cursor-pointer" value="Employed">Employed</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Self-employed">Self-employed</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Unemployed">Unemployed</SelectItem>
                                        <SelectItem className="cursor-pointer" value="Retired">Retired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="current_work_address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Place of Work Address</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="employer_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name of Employer</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-wrap w-full justify-between gap-3">
                    <FormField
                        control={form.control}
                        name="current_salary"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Current Salary (Gross)</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="side_hustle_income"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Other Side Hustle Income (Gross)</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                    {isLoading ? <LoadingButton /> : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
};

export default UserProfileForm;
