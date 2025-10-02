import { z } from "zod";
import {
  ApplicationStatus,
  GigCompensationType,
  GigStatus,
  Role,
  VerificationStatus
} from "@/lib/prismaEnums";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const verificationRequestSchema = z.object({
  role: z.enum([Role.PROMOTER, Role.VENUE]),
  message: z.string().min(10),
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        size: z.number().nonnegative()
      })
    )
    .min(1)
    .max(3)
});

const citySchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z\s'\-]{2,60}$/u, "City must contain only letters and common punctuation")
  .optional();

const stateSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{2}$/u, "State must be a 2-letter code")
  .optional();

export const gigFiltersSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  city: citySchema,
  state: stateSchema,
  status: z.nativeEnum(GigStatus).optional(),
  compensationType: z.nativeEnum(GigCompensationType).optional(),
  minPayout: z.coerce.number().nonnegative().optional(),
  dateStart: z.coerce.date().optional(),
  dateEnd: z.coerce.date().optional(),
  page: z.coerce.number().default(1)
}).refine((data) => {
  if (data.dateStart && data.dateEnd) {
    return data.dateEnd >= data.dateStart;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["dateEnd"]
});

export const gigFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(4000),
  compensationType: z.nativeEnum(GigCompensationType),
  payoutUsd: z.number().int().positive().nullable().optional(),
  dateStart: z.coerce.date(),
  dateEnd: z.coerce.date().optional().nullable(),
  timezone: z.string().min(2),
  city: z.string().trim().regex(/^[a-zA-Z\s'\-]{2,60}$/u, "City must contain only letters and common punctuation"),
  state: z.string().trim().regex(/^[A-Z]{2}$/u, "State must be 2 uppercase letters"),
  minAge: z.number().int().nonnegative().nullable().optional(),
  isPublished: z.boolean().optional()
}).refine((data) => {
  if (data.dateEnd) {
    if (!data.dateStart) {
      return true;
    }
    return data.dateEnd >= data.dateStart;
  }
  return true;
}, {
  message: "End date must be on or after the start date",
  path: ["dateEnd"]
});

export const applicationSchema = z.object({
  gigId: z.string().cuid(),
  message: z.string().min(20)
});

export const applicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus)
});

export const verificationDecisionSchema = z.object({
  status: z.nativeEnum(VerificationStatus),
  message: z.string().optional()
});
