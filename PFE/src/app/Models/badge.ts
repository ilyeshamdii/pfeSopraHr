// badge.ts

export interface Badge {
    id: number;
    userId: number;
    username: string;
    matricule: string;
    status: string;
    photos :string
    isDeleted :boolean
    // Add other fields as needed
    user: {
      email: string;
      username :string
      // Add other user properties as needed
  }
  }
  