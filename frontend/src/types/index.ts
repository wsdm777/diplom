export interface User {
  id: number;
  email: string;
  name: string;
  gender: "male" | "female";
  height: number;
  birth_date: string;
}

export interface WeightEntry {
  id: number;
  user_id: number;
  weight: number;
  measured_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  gender: "male" | "female";
  height: number;
  birth_date: string;
}

export interface LoginData {
  email: string;
  password: string;
}
