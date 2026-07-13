export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: "USER" | "FACULTY" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}
