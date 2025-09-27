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

export const gigFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.nativeEnum(GigStatus).optional(),
  compensationType: z.nativeEnum(GigCompensationType).optional(),
  minPayout: z.coerce.number().optional(),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
  page: z.coerce.number().default(1)
});

export const gigFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(20),
  compensationType: z.nativeEnum(GigCompensationType),
  payoutUsd: z.number().int().nonnegative().nullable().optional(),
  dateStart: z.coerce.date(),
  dateEnd: z.coerce.date().optional().nullable(),
  timezone: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  minAge: z.number().int().nonnegative().nullable().optional(),
  isPublished: z.boolean().optional()
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
