import { PlanType } from "@/app/components/settings-panel"; // Adjust the path as necessary

export type StoragePlan = {
    name: "free" | "pro" | "enterprise"
    maxStorage: number // in bytes
  }
  
  export type StorageStats = {
    usedStorage: number // in bytes
    maxStorage: number // in bytes
    isMemoryEnabled: boolean
  }
  
  type PlanTypeKey = Exclude<PlanType, null>; // Creates a type without null

  export const STORAGE_LIMITS: {
    free: number;
    pro: number;
    enterprise: number;
  } = {
    free: 5,
    pro: 20,
    enterprise: 100,
  }
  
  