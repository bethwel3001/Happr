import type { UserData } from "@/types";

export type { UserData };

export type User = UserData | null;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}
