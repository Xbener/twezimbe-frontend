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