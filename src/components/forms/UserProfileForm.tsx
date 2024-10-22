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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UpdateUserTypes, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingButton from "../LoadingButton";
import Image from "next/image";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useState } from "react";
import { GeneralLink } from "../groups/group-nav";
import { useUpdateUserAccount } from "@/api/auth";
import { CheckCircle, XCircleIcon, XIcon } from "lucide-react";

const formSchema = z.object({
    title: z.enum(["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."]),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
    religion: z.string(),
    place_of_birth: z.string(),
    current_parish: z.string(),
    birthday: z.string().min(10, "Birthday is required"),
    national_id_number: z.string(),
    national_id_photo: z.string().optional(),
    phone: z.string().min(10, "Phone number is required"),
    home_address: z.string(),
    home_location_map: z.string(),
    district_of_birth: z.string(),
    parish_of_birth: z.string(),
    village_of_birth: z.string(),
    marital_status: z.enum(["Single", "Married", "Divorced", "Widowed"]),
    occupation: z.string(),
    job_title: z.string(),
    next_of_kin: z.object({
        national_id_link: z.string(),
        name: z.string(),
        phone: z.string(),
        email: z.string(),
    }),
    monthly_income_level: z.enum([
        "Less than UGX 1,000,000",
        "UGX 1,000,000 - 5,000,000",
        "UGX 5,000,000 - 15,000,000",
        "Above UGX 15,000,000",
    ]),
    bank_name: z.string(),
    bank_account_number: z.string(),
    bank_mobile_account: z.string(),
    bank_email: z.string(),
    highest_education_level: z.enum([
        "Secondary (Ordinary Level)",
        "Secondary (Advanced Level)",
        "Tertiary",
        "University",
        "Other (Specify)",
    ]),
    employment_status: z.enum([
        "Employed",
        "Self-employed",
        "Unemployed",
        "Retired",
    ]),
    current_work_address: z.string(),
    employer_name: z.string(),
    current_salary: z.string(),
    side_hustle_income: z.string(),
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
    const [isUpdating, setIsUpdating] = useState(false)
    const { updateAccount } = useUpdateUserAccount()
    // State to hold the answers to the security questions
    const [securityQuestions, setSecurityQuestions] = useState<{ question: string; answer: string; }[]>(currentUser.securityQuestions);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [token, setToken] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const setup2FA = async () => {
        const accessToken = Cookies.get('access-token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/2fa/setup`, {
                method: "GET",
                headers: {
                    'Content-Type': 'applications',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json()
            setQrCodeUrl(data.qrCodeUrl);
        } catch (error) {
            console.error('Error setting up 2FA:', error);
        }
    };


    const verify2FA = async () => {
        const accessToken = Cookies.get('access-token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/api/2fa/verify`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ token })
            });
            const data = await response.json()
            if (data.message === "2FA verification successful!") {
                setIsVerified(true);
                alert("2FA setup complete!");
            } else {
                alert("Invalid 2FA token. Try again.");
            }
        } catch (error) {
            console.error('Error verifying 2FA:', error);
        }
    };

    // Handle input change
    const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSecurityQuestions(prevQuestions => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[index].answer = value; // Update the answer for the correct question
            return updatedQuestions;
        });
    };

    const handleUpdateSecurityQuestion = async () => {
        try {
            setIsUpdating(true)
            const res = await updateAccount({ securityQuestions })
        } catch (err: any) {
            toast.error("Something went wrong. Please try again")
            console.log(err.message)
        } finally {
            setIsUpdating(false)
        }
    };


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
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSave)} className="space-y-2 bg-gray-50 rounded-lg md:p-10 w-full grid grid-cols-3 gap-5">
                    <FormDescription className="flex flex-col">
                        View and change your profile information here
                        <span className="flex w-full items-center justify-between p-2 border rounded-md mt-3">
                            Profile Complete
                            {currentUser?.is_complete ? <CheckCircle color="green" /> : <XCircleIcon color="red" />}
                        </span>
                    </FormDescription>
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
                                    <Select {...field} onValueChange={(e) => form.setValue("title", e as UserFormData["title"])}>
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
                                    <Select {...field} onValueChange={(e) => form.setValue("gender", e as UserFormData["gender"])}>
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
                    {/* <FormField
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
                /> */}

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
                                    <Select {...field} onValueChange={(e) => form.setValue("marital_status", e as UserFormData["marital_status"])}>
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
                                    <Select {...field} onValueChange={(e) => form.setValue("monthly_income_level", e as UserFormData["monthly_income_level"])}>
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
                                    <Select {...field} onValueChange={(e) => form.setValue("highest_education_level", e as UserFormData["highest_education_level"])}>
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
                                    <Select {...field} onValueChange={(e) => form.setValue("employment_status", e as UserFormData["employment_status"])}>
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

            <div className="w-full p-2">
                <h1 className="font-extrabold text-[1.2rem]">Other Settings</h1>

                <div className="w-full flex flex-col gap-4">
                    {/* Subscribe to Notifications */}
                    <div className="flex w-full justify-between items-center">
                        <h1>Subscribe to Notifications</h1>
                        <div>
                            <Button className="bg-orange-500 text-white font-bold">
                                Subscribe
                            </Button>
                        </div>
                    </div>

                    {/* Security Features */}
                    <div className="w-full">
                        <h1 className="font-extrabold text-[1.2rem]">Security Features</h1>
                        <div className="flex flex-col gap-2">
                            {/* Two-factor Authentication */}
                            <div className="flex w-full justify-between items-center">
                                <h1>Enable Two-Factor Authentication</h1>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button className="bg-green-500 text-white font-bold" onClick={setup2FA}>
                                            Set up 2FA
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-white">
                                        <DialogHeader className="font-bold text-[1.2rem]">
                                            Set up 2FA for improved security
                                        </DialogHeader>

                                        {qrCodeUrl && (
                                            <div className="flex flex-col gap-4">
                                                <h2 className="font-semibold">Scan this QR code with your Authenticator App:</h2>
                                                <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto" />

                                                <input
                                                    type="text"
                                                    className="w-full p-2 border rounded"
                                                    placeholder="Enter the token from the app"
                                                    value={token}
                                                    onChange={(e) => setToken(e.target.value)}
                                                />

                                                <Button className="bg-blue-500 text-white font-bold" onClick={verify2FA}>
                                                    Verify Token
                                                </Button>

                                                {isVerified && <p className="text-green-500">2FA is successfully enabled!</p>}
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {/* Security Questions */}
                            <div className="flex w-full justify-between items-center">
                                <h1>Set Security Questions</h1>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button className="bg-green-500 text-white font-bold">
                                            Set Questions
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-white" >
                                        <DialogHeader className="font-bold text-[1.2rem]">
                                            Answer these questions for account recovery
                                        </DialogHeader>
                                        <div className="flex flex-col gap-4">
                                            {securityQuestions.map((questionObj, index) => (
                                                <div className="flex flex-col gap-3" key={index}>
                                                    <label className="font-bold">Question {index + 1}:</label>
                                                    <p>{questionObj.question}</p>
                                                    <input
                                                        type="text"
                                                        className="w-full p-2 border rounded"
                                                        placeholder={`Answer question ${index + 1}`}
                                                        value={questionObj.answer}
                                                        onChange={(e) => handleInputChange(index, e)} // Handle input change for this question
                                                    />
                                                </div>
                                            ))}

                                            <div className="flex justify-end">
                                                <Button className="bg-blue-500 text-white font-bold" disabled={isUpdating} type="button" onClick={(e) => {
                                                    e.preventDefault()
                                                    handleUpdateSecurityQuestion()
                                                }}>
                                                    Submit
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* Consent and Agreements */}
                    <div className="w-full">
                        <h1 className="font-extrabold text-[1.2rem]">Consent and Agreements</h1>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                                <input type="checkbox" id="terms" className="mr-2" />
                                <label htmlFor="terms">I agree to the Terms and Conditions</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="privacy" className="mr-2" />
                                <label htmlFor="privacy">I agree to the Privacy Policy</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="data-sharing" className="mr-2" />
                                <label htmlFor="data-sharing">I agree to Data Sharing Agreements</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default UserProfileForm;
