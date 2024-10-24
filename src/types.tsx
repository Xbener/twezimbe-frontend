export type User = {
    _id?: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    birthday: string;
    home_address?: string;
    office_address?: string;
    primary_interest?: string;
    current_challenges?: string;
    is_demo: number;
    preferred_date?: string;
    last_login: Date;
    date_joined: Date;
    del_falg: number;
    verified: boolean;
    salt: string;
    role: "GroupUser" | "GroupModerator" | "GroupManager";
    otp: number;
    otpExpiryTime: Date;
    profile_pic?: string;

    title?: "Mr." | "Ms." | "Mrs." | "Dr." | "Prof.";
    gender?: "Male" | "Female" | "Other";
    religion?: string;
    place_of_birth?: string;
    current_parish?: string;
    national_id_number?: string;
    national_id_photo?: string;
    home_location_map?: string;
    district_of_birth?: string;
    parish_of_birth?: string;
    village_of_birth?: string;
    marital_status?: "Single" | "Married" | "Divorced" | "Widowed";
    occupation?: string;
    job_title?: string;
    next_of_kin_name?: string;
    next_of_kin_phone?: string;
    next_of_kin_email?: string;
    next_of_kin_national_id?: string;
    monthly_income_level?: "Less than UGX 1,000,000" | "UGX 1,000,000 - 5,000,000" | "UGX 5,000,000 - 15,000,000" | "Above UGX 15,000,000";
    bank_name?: string;
    bank_account_number?: string;
    bank_mobile_account?: string;
    bank_email?: string;
    highest_education_level?: "Secondary (Ordinary Level)" | "Secondary (Advanced Level)" | "Tertiary" | "University" | "Other (Specify)";
    employment_status?: "Employed" | "Self-employed" | "Unemployed" | "Retired";
    current_work_address?: string;
    employer_name?: string;
    current_salary?: string;
    side_hustle_income?: string;
    securityQuestions: {
        question: string;
        answer: string;
    }[];
    is_complete: boolean;
    socketId?: string;
    isActive?: boolean;
    createdAt?: Date;
    id: string;
};


export type CreateRoleTypes = {
    role_name: string;
    description: string;
};

export type CreateUserTypes = {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    role: string;
}

export type UpdateUserTypes = {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    birthday?: string;
    home_address?: string;
    office_address?: string;
    primary_interest?: string;
    current_challenges?: string;
    preferred_date?: string;
    is_active?: boolean;
    last_login?: Date;
    date_joined?: Date;
    del_falg?: number;
    verified?: boolean;
    otp?: number;
    otpExpiryTime?: Date;
    profile_pic?: string;

    title?: "Mr." | "Ms." | "Mrs." | "Dr." | "Prof.";
    gender?: "Male" | "Female" | "Other";
    religion?: string;
    place_of_birth?: string;
    current_parish?: string;
    national_id_number?: string;
    national_id_photo?: string;
    home_location_map?: string;
    district_of_birth?: string;
    parish_of_birth?: string;
    village_of_birth?: string;
    marital_status?: "Single" | "Married" | "Divorced" | "Widowed";
    occupation?: string;
    job_title?: string;
    next_of_kin_name?: string;
    next_of_kin_phone?: string;
    next_of_kin_email?: string;
    next_of_kin_national_id?: string;
    monthly_income_level?: "Less than UGX 1,000,000" | "UGX 1,000,000 - 5,000,000" | "UGX 5,000,000 - 15,000,000" | "Above UGX 15,000,000";
    bank_name?: string;
    bank_account_number?: string;
    bank_mobile_account?: string;
    bank_email?: string;
    highest_education_level?: "Secondary (Ordinary Level)" | "Secondary (Advanced Level)" | "Tertiary" | "University" | "Other (Specify)";
    employment_status?: "Employed" | "Self-employed" | "Unemployed" | "Retired";
    current_work_address?: string;
    employer_name?: string;
    current_salary?: string;
    side_hustle_income?: string;
    securityQuestions?: {
        question: string;
        answer: string;
    }[]
};

export type SignInTypes = {
    email: string;
    password: string;
}

export type OPTTypes = {
    otp: string;
}

export type Application = {
    _id?: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    email: string;
    userId: string;
    phone: string;
    dateOfBirth: Date;
    gender: "Male" | "Female" | "Other";
    maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
    numberOfDependencies: number;
    workSchool: string;
    position: string;
    monthlySalary: number;
    amountRequested: number;
    repaymentReriod: number;
    amountToPayPerMonth: number;
    bankAccountNumber: string;
    proofOffEmployment: string;
    copyOfNationalId: string;
    loanStatus: "Pending" | "Update required" | "Approved" | "Rejected";
    createdAt: Date;
};

export type CreateApplicationTypes = {
    firstName: string;
    lastName: string;
    nationalId: string;
    email: string;
    userId: string;
    phone: string;
    dateOfBirth: Date;
    gender: "Male" | "Female" | "Other";
    maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
    numberOfDependencies: number;
    workSchool: string;
    position: string;
    monthlySalary: number;
    amountRequested: number;
    amountToPayPerMonth: number;
    repaymentReriod: number;
    bankAccountNumber: string;
    proofOffEmployment: string;
    copyOfNationalId: string;
};

export type UpdateApplicationTypes = {
    _id: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    email: string;
    userId: string;
    phone: string;
    dateOfBirth: Date;
    gender: "Male" | "Female" | "Other";
    maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
    numberOfDependencies: number;
    workSchool: string;
    position: string;
    monthlySalary: number;
    amountRequested: number;
    repaymentReriod: number;
    amountToPayPerMonth: number;
    bankAccountNumber: string;
    proofOfEmployment: string;
    copyOfNationalId: string;
    loanStatus: "Pending" | "Update required" | "Approved" | "Rejected";
    createdAt: Date;
};

export type Response = {
    _id: string;
    loanId: string;
    loanStatus: "Pending" | "Update required" | "Approved" | "Rejected";
    message: string;
    response: string;
    status: "Resolved" | "Denied" | "In progress";

};

export type FriendTypes = {
    _id: string;
    title?: string;
    surName: string;
    givenName: string;
    otherNames?: string;
    photograph?: string; // assuming it's a file upload
    gender: "Male" | "Female" | "Other";
    tribe: string;
    religion: string;
    placeOfBirth: string;
    currentParish: string;
    birthday: Date;
    nationalIDNumber: string;
    nationalIDPhoto?: string; // assuming it's a file upload
    phone: string;
    email: string;
    homeAddress: string;
    homeLocation: string;
    districtOfBirth: string;
    birthParish: string;
    birthVillage: string;
    birthHome: string;
    maritalStatus?: string;
    profession: string;
    placeOfWorkAddress?: string;
    userID?: string;
    is_active: boolean;
    userId?: string;
    friendId?: string;
    groupId?: string;
    roomId?: string;
    role_name?: string;
};



export type GroupTypes = {
    _id: string
    group_name: string;
    group_type: string;
    group_picture: string;
    description: string;
    created_by: any;
    del_flag: number;
    createdAt: Date;
    memberCount: number;
    members: User[];
    isSacco?: boolean;
    invite_link: string;
    group_state: string;
    upgraded: boolean;
    tags: string;
};

export type CreateGroupTypes = {
    name: string;
    group_type?: string;
    group_state?: string;
    selectedUsers_Id?: string[];
    group_picture?: string;
    tags?: string;
    description?: string;
    created_by?: string;
};


export type UpdateGroupTypes = {
    name?: string;
    group_type?: string;
    description?: string;
    created_by?: string;
    group_state?: string;
    upgraded?: boolean;
    group_id: string;
    isSacco?: boolean;
};

export type JoinedGroupTypes = {
    _id?: string;
    group_id: string;
    role_name: string;
    group_name: string;
    group_type: string;
    isSacco?: boolean;
    group_state: string;
    group_picture: string;
    description: string;
    tags: string;
    created_by: string;
    del_flag: number;
    createdAt: Date;
    updatedAt: Date;
};

export type JoinGroupTypes = {
    user_id?: string;
    group_id?: string;
};


export type GroupJoinRequestTypes = {
    userId: any,
    user: User
    group: GroupTypes,
    _id: string;
    createdAt?: string;
    updatedAt?: string;
}


// flutterwave.d.ts
declare var FlutterwaveCheckout: (options: any) => void;



export type CreateChannelTypes = {
    name: string;
    description: string;
    state: string;
    groupId?: string;
    members?: User[]
}

export type ChannelTypes = {
    _id?: string;
    name?: string;
    description?: string;
    state?: string;
    created_by?: User;
    createdAt?: Date;
    chatroom?: ChatRoomTypes;
    members?: string[] | string | any;
    groupId?: string;
    membersDetails?: User[]
}

export type ChatRoomTypes = {
    _id?: string;
    name?: string;
    ref?: string;
    members: string[];
    memberDetails: User[]
}

export type Reaction = {
    _id?: string;
    emoji?: string;
    user_id?: string;
};

export type Message = {
    _id?: string;
    sender?: User;
    receiver_id?: User[];
    chatroom?: string;
    content?: string;
    messageType?: 'text' | 'image' | 'video' | 'sticker' | 'gif';
    attachmentUrl?: string;
    read?: boolean;
    status?: 'sending' | 'sent' | 'delivered' | 'seen';
    reactions?: Reaction[];
    replyingTo?: Message;
    edited?: boolean;
    editedAt?: Date;
    createdAt?: Date;
    sender_id?: string;
    pinned?: boolean;
};




export interface ChatroomMember {
    _id: string;
    profileID: string;
    email: string;
    firstName: string;
    lastName: string;
    profile_pic?: string;
}

export interface Chatroom {
    _id: string;
    name: string;
    type: "dm" | "channel";
    members: string[];
    memberDetails: ChatroomMember[];
}


export interface UnreadMessage {
    messageId?: string;
    userId?: string;
    isRead: boolean;
    readAt: boolean;
    message: Message;
    chatroom: Chatroom;
}