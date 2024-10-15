export type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    birthday: string;
    home_address: string;
    office_address: string;
    primary_interest: string;
    current_challenges: string;
    is_demo: number;
    preferred_date: string;
    is_active: boolean;
    last_login: Date;
    date_joined: Date;
    del_falg: number;
    verified: boolean;
    salt: string;
    role: "User" | "Manager" | "Admin";
    otp: number;
    otpExpiryTime: Date;
    // _doc: UserDoc;

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
    email?: string;
    firstName: string;
    lastName: string;
    phone: string;
}

export type SignInTypes = {
    email: string;
    password: string;
}

export type OPTTypes = {
    otp: string;
}

export type Application = {
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
    name: string;
    group_type: string;
    group_avatar: string;
    tags: string;
    description: string;
    created_by: string;
    del_flag: number;
    createdAt: Date;
    memberCount: number;
    members: User[]
};

export type CreateGroupTypes = {
    name: string;
    group_type?: string;
    group_state?: string;
    selectedUsers_Id?: string[];
    group_avatar?: string;
    tags?: string;
    description?: string;
    created_by?: string;
};

export type UpdateGroupTypes = {
    name: string;
    group_type?: string;
    description?: string;
    created_by?: string;
};

export type JoinedGroupTypes = {
    _id?: string;
    group_id: string;
    role_name: string;
    group_name: string;
    group_type: string;
    group_state: string;
    group_avatar: string;
    description: string;
    tags: string;
    created_by: string;
    del_flag: number;
    createdAt: Date;
    updatedAt: Date;
};

export type JoinGroupTypes = {
    user_id?: string;
    groud_id?: string;
};
