export interface User {
    id: number;
    username: string;
    email: string;
    roles: Role[];
    status: boolean;
    photos?:string;
    
}

export interface Role {
    id: number;
    name: string;
}
