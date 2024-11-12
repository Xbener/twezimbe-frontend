'use client'
import React, { useContext, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Select from 'react-tailwindcss-select';
import { AdminContext } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { useUpdateGroup } from '@/api/group';
import { useParams } from 'next/navigation';

export type GroupTypes = {
    _id: string;
    group_name: string;
    group_type: string;
    group_picture: string;
    group_state: string;
    tags: string;
    description: string;
};

type Props = {};

const Page: React.FC<Props> = () => {
    const { selectedGroup } = useContext(AdminContext);
    const { updateGroup } = useUpdateGroup()
    const { groupId } = useParams()
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<GroupTypes>({
        defaultValues: selectedGroup || {}
    });

    const [groupType, setGroupType] = useState({
        value: selectedGroup?.group_type || 'Social',
        label: selectedGroup?.group_type || 'Social'
    });

    const [groupState, setGroupState] = useState({
        value: selectedGroup?.group_state || 'Public',
        label: selectedGroup?.group_state || 'Public'
    });

    useEffect(() => {
        if (selectedGroup) {
            setValue('group_type', selectedGroup.group_type);
            setValue('group_state', selectedGroup.group_state);
            setValue('tags', selectedGroup.tags);
            setValue('description', selectedGroup.description);
        }
    }, [selectedGroup, setValue]);

    const onSubmit: SubmitHandler<GroupTypes> = async (data) => {
        const res = updateGroup({ ...data, name: data.group_name, isSacco: false, group_id: groupId as string })
        window.location.href = '/manager_pages/groups'
    };

    return (
        <div className='flex flex-col w-full gap-2'>
            <div className='w-full flex items-center justify-between'>
                <h1>Update group {selectedGroup?.group_name}</h1>
                <Button disabled={isSubmitting} className='bg-blue-500 disabled:cursor-not-allowed text-white' onClick={handleSubmit(onSubmit)}>
                    Update
                </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full text-neutral-600 p-4 space-y-4">
                <div className="W-full flex flex-col gap-2">
                    <label>Group name</label>
                    <input
                        {...register('group_name')}
                        className="bg-white border-2 placeholder:text-gray-600 p-2"
                        placeholder="Group name"
                    />
                    {errors.group_name && <p>{errors.group_name?.message}</p>}
                </div>
                
                <div className='w-full flex items-center gap-3'>
                    <div className="W-full flex flex-col gap-2 w-full">
                        <label>Group Type</label>
                        <Select
                            value={groupType}
                            onChange={(e: any) => {
                                setGroupType(e);
                                setValue('group_type', e.value);
                            }}
                            options={[
                                { value: "Social", label: "Social" },
                                { value: "Professional", label: "Professional" },
                                { value: "Educational", label: "Educational" },
                                { value: "Other", label: "Other" },
                            ]}
                            primaryColor="blue"
                        />
                    </div>

                    <div className="W-full flex flex-col gap-2 w-full">
                        <label>Group State</label>
                        <Select
                            value={groupState}
                            onChange={(e: any) => {
                                setGroupState(e);
                                setValue('group_state', e.value);
                            }}
                            options={[
                                { value: "Public", label: "Public" },
                                { value: "Private", label: "Private" },
                            ]}
                            primaryColor="#e3e2de"
                        />
                    </div>
                </div>

                <div className="W-full flex flex-col gap-2">
                    <label>Group Tags</label>
                    <input
                        {...register('tags')}
                        className="bg-white border-2 placeholder:text-gray-600 p-2"
                        placeholder="Group Tags"
                    />
                    {errors.tags && <p>{errors.tags.message}</p>}
                </div>

                <div className="W-full flex flex-col gap-2">
                    <label>Group Description</label>
                    <textarea
                        {...register('description')}
                        className="bg-white border-2 placeholder:text-gray-600 p-2"
                        cols={30}
                        placeholder="Group Description"
                    />
                    {errors.description && <p>{errors.description.message}</p>}
                </div>


            </form>
        </div>
    );
};

export default Page;
