import { z } from "zod";
import {
  ApplicationStatus,
  BookingStatus,
  CancellationPolicy,
  GigCompensationType,
  GigStatus,
  Role,
  VerificationStatus
} from "@/lib/prismaEnums";
import { COMMUNITY_BOARD_CATEGORIES } from "@/lib/dataStore";
import type {
  AdSlotPage,
  AdSlotPlacement,
  CommunityBoardCategory,
} from "@/types/database";
import type { FeatureFlagKey } from "@/lib/config/flags";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role)
});

export const comedianSignUpSchema = z.object({
  stageName: z.string().trim().min(2, "Stage name is required").max(80, "Stage name is too long"),
  legalName: z.string().trim().min(2, "Tell us who we are working with").max(120, "Legal name is too long"),
  email: z.string().trim().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().trim().max(600, "Keep your bio under 600 characters").optional(),
  homeCity: z.string().trim().max(80, "City names are capped at 80 characters").optional(),
  homeState: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/u, "Use a two-letter state or province code")
    .optional(),
  travelRadiusMiles: z.number().int().positive().max(1000, "Choose a travel radius under 1000 miles").optional(),
  website: z.string().trim().url("Enter a valid website").optional(),
  instagram: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._]{2,30}$/u, "Instagram handles can include letters, numbers, underscores, and periods")
    .optional(),
  tiktok: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._]{2,30}$/u, "TikTok handles can include letters, numbers, underscores, and periods")
    .optional(),
  youtube: z.string().trim().url("Enter a full YouTube channel or reel URL").optional(),
  credits: z.string().trim().max(160, "Keep credits under 160 characters").optional(),
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9()+\-\s]{7,20}$/u, "Use a phone number with 7-20 digits and basic punctuation")
  .nullable()
  .optional();

const boardCategoryEnum = z.enum(COMMUNITY_BOARD_CATEGORIES as [CommunityBoardCategory, ...CommunityBoardCategory[]]);
const cleanRatingEnum = z.enum(["CLEAN", "PG13", "R"] as const);
const adSlotPageEnum = z.enum(["home", "search", "profile"] as [AdSlotPage, ...AdSlotPage[]]);
const adSlotPlacementEnum = z.enum([
  "top",
  "inline",
  "sidebar",
] as [AdSlotPlacement, ...AdSlotPlacement[]]);
const featureFlagKeyEnum = z.enum(
  ["premiumBoost", "premiumEarlyApply", "adsEnabled"] as [FeatureFlagKey, ...FeatureFlagKey[]]
);

const tagArraySchema = z
  .array(
    z
      .string()
      .trim()
      .min(2)
      .max(60)
  )
  .max(20)
  .optional();

const urlArraySchema = z
  .array(
    z
      .string()
      .trim()
      .url()
  )
  .max(20)
  .optional();

const dataImageRegex = /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/iu;
const httpImageRegex = /^https?:\/\//iu;

export const profileAvatarSchema = z.object({
  avatar: z
    .union([
      z
        .string()
        .trim()
        .min(1, "Upload an image or paste an image URL.")
        .max(2_500_000, "Avatar images must be smaller than 2.5MB.")
        .refine(
          (value) => httpImageRegex.test(value) || dataImageRegex.test(value),
          "Provide an https image URL or upload an image file."
        ),
      z.literal(null),
    ])
    .optional(),
});

const availabilityEntrySchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .optional(),
  userId: z
    .string()
    .trim()
    .min(1)
    .optional(),
  date: z
    .union([z.string().datetime(), z.date()])
    .transform((value) => (value instanceof Date ? value.toISOString() : value)),
  status: z.enum(["free", "busy"] as const),
});

export const comedianProfileFormSchema = z.object({
  legalName: z.string().trim().min(2).max(120),
  stageName: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(600).nullable().optional(),
  credits: z.string().trim().max(160).nullable().optional(),
  website: z.string().trim().url().nullable().optional(),
  reelUrl: z.string().trim().url().nullable().optional(),
  instagram: z.string().trim().max(60).nullable().optional(),
  tiktokHandle: z.string().trim().max(60).nullable().optional(),
  youtubeChannel: z.string().trim().url().nullable().optional(),
  travelRadiusMiles: z.union([z.number().int().positive().max(1000), z.null()]).optional(),
  homeCity: z.string().trim().max(80).nullable().optional(),
  homeState: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/u, "Use a two-letter state or province code")
    .nullable()
    .optional(),
  styles: tagArraySchema.transform((value) => value ?? []),
  cleanRating: cleanRatingEnum.optional(),
  rateMin: z.union([z.number().int().min(0).max(10000), z.null()]).optional(),
  rateMax: z.union([z.number().int().min(0).max(10000), z.null()]).optional(),
  reelUrls: urlArraySchema.transform((value) => value ?? []),
  photoUrls: urlArraySchema.transform((value) => value ?? []),
  notableClubs: tagArraySchema.transform((value) => value ?? []),
  availability: z
    .array(availabilityEntrySchema)
    .max(180)
    .optional()
    .transform((entries) => entries ?? []),
});

export const promoterProfileFormSchema = z.object({
  organization: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  website: z.string().trim().url().nullable().optional(),
});

export const venueProfileFormSchema = z.object({
  venueName: z.string().trim().min(2).max(120),
  address1: z.string().trim().min(3).max(160),
  address2: z.string().trim().max(160).nullable().optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().regex(/^[A-Z]{2}$/u, "Use a two-letter state or province code"),
  postalCode: z.string().trim().min(3).max(20),
  capacity: z.union([z.number().int().positive().max(100000), z.null()]).optional(),
  contactEmail: z.string().trim().email(),
  phone: phoneSchema,
});

export const communityBoardMessageSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  category: boardCategoryEnum,
  gigTitle: z.string().trim().min(3).max(120).optional(),
  gigAddress: z.string().trim().min(5).max(200).optional(),
  gigCity: z.string().trim().min(2).max(80).optional(),
  gigState: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/u, "State must be a 2-letter code")
    .optional(),
  gigContactName: z.string().trim().min(2).max(120).optional(),
  gigContactEmail: z.string().trim().email().optional(),
  gigSlotsAvailable: z.coerce.number().int().min(1).max(50).optional(),
}).superRefine((data, ctx) => {
  if (data.category === "OFFER") {
    const requiredFields: Array<[keyof typeof data, unknown, string]> = [
      ["gigTitle", data.gigTitle, "Provide a short gig title."],
      ["gigAddress", data.gigAddress, "Include the street address for the gig."],
      ["gigCity", data.gigCity, "Add the city where the show takes place."],
      ["gigState", data.gigState, "Select the state or province for the gig."],
      ["gigContactName", data.gigContactName, "Name the primary point of contact."],
      ["gigContactEmail", data.gigContactEmail, "Add an email address for applications."],
      ["gigSlotsAvailable", data.gigSlotsAvailable, "Share how many slots are open."],
    ];
    for (const [field, value, message] of requiredFields) {
      if (value === undefined || value === null || value === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message,
        });
      }
    }
  }
});

export const communityBoardMessageUpdateSchema = z
  .object({
    content: z.string().trim().min(1).max(1000).optional(),
    category: boardCategoryEnum.optional(),
    isPinned: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Provide at least one field to update" });

export const communityPostSchema = z.object({
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(2000),
});

export const communityReplySchema = z.object({
  content: z.string().trim().min(1).max(1500),
});

export const communityVoteSchema = z.object({
  targetType: z.enum(["POST", "REPLY"] as const),
  targetId: z.string().trim().min(1),
  value: z
    .number()
    .int()
    .refine((val) => val === -1 || val === 0 || val === 1, {
      message: "Vote must be -1, 0, or 1",
    }),
});

export const offerCreateSchema = z.object({
  threadId: z.string().trim().min(1),
  amount: z.number().int().positive(),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .optional(),
  terms: z.string().trim().min(1),
  eventDateISO: z.string().datetime(),
  expiresAtISO: z.string().datetime().optional(),
});

export const offerStatusSchema = z
  .object({
    status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"] as const),
    gigId: z.string().trim().min(1).optional(),
    comedianId: z.string().trim().min(1).optional(),
    promoterId: z.string().trim().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "ACCEPTED") {
      if (!data.gigId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gigId"],
          message: "gigId is required when accepting an offer",
        });
      }
      if (!data.comedianId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["comedianId"],
          message: "comedianId is required when accepting an offer",
        });
      }
      if (!data.promoterId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["promoterId"],
          message: "promoterId is required when accepting an offer",
        });
      }
    }
  });

export const bookingCreateSchema = z.object({
  gigId: z.string().trim().min(1),
  comedianId: z.string().trim().min(1),
  promoterId: z.string().trim().min(1),
  offerId: z.string().trim().min(1),
});

export const bookingUpdateSchema = z
  .object({
    status: z.nativeEnum(BookingStatus).optional(),
    payoutProtection: z.boolean().optional(),
    cancellationPolicy: z.nativeEnum(CancellationPolicy).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
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

const styleArraySchema = z
  .array(z.string().trim().min(1).max(60))
  .transform((styles) => Array.from(new Set(styles.map((style) => style.trim()))));

export const comedianSearchFiltersSchema = z
  .object({
    search: z.string().trim().min(1).max(100).optional(),
    city: citySchema,
    state: stateSchema,
    styles: styleArraySchema.optional(),
    cleanRating: cleanRatingEnum.optional(),
    rateMin: z.coerce.number().nonnegative().optional(),
    rateMax: z.coerce.number().nonnegative().optional(),
    minExperience: z.coerce.number().int().nonnegative().optional(),
    sort: z.enum(["rating", "distance", "responsiveness", "premium"] as const).default("rating"),
    page: z.coerce.number().int().min(1).default(1)
  })
  .refine(
    (data) => {
      if (data.rateMin !== undefined && data.rateMax !== undefined) {
        return data.rateMax >= data.rateMin;
      }
      return true;
    },
    {
      message: "Max rate must be greater than min rate",
      path: ["rateMax"],
    }
  );

const gigFormBaseSchema = z.object({
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
});

const gigDateRangeRefinement = {
  message: "End date must be on or after the start date",
  path: ["dateEnd"] as (string | number)[]
};

const isValidGigDateRange = (data: z.infer<typeof gigFormBaseSchema>) => {
  if (data.dateEnd) {
    if (!data.dateStart) {
      return true;
    }
    return data.dateEnd >= data.dateStart;
  }
  return true;
};

export const gigFormSchema = gigFormBaseSchema.refine(isValidGigDateRange, gigDateRangeRefinement);

export const gigFormUpdateSchema = gigFormBaseSchema
  .partial()
  .refine(
    (data) => {
      if (data.dateEnd && data.dateStart) {
        return data.dateEnd >= data.dateStart;
      }
      return true;
    },
    gigDateRangeRefinement
  );

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

export const reviewCreateSchema = z.object({
  subjectUserId: z.string().trim().min(1, "subjectUserId is required"),
  gigId: z.string().trim().min(1, "gigId is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "comment must be at least 10 characters"),
});

export const threadMessageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("TEXT"),
    body: z.string().trim().min(1),
    fileUrl: z.string().trim().url().optional(),
  }),
  z.object({
    kind: z.literal("FILE"),
    body: z.string().trim().optional(),
    fileUrl: z.string().trim().url(),
  }),
  z.object({
    kind: z.literal("OFFER"),
    body: z.string().trim().optional(),
    offer: z.object({
      amount: z.number().int().min(1),
      currency: z.string().trim().length(3).default("USD"),
      terms: z.string().trim().min(5),
      eventDate: z.string().datetime(),
      expiresAt: z.string().datetime().optional(),
    }),
  }),
]);

export const adSlotCreateSchema = z.object({
  page: adSlotPageEnum,
  placement: adSlotPlacementEnum,
  html: z.string().trim().max(4000).nullable().optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  linkUrl: z.string().trim().url().nullable().optional(),
  active: z.boolean().optional(),
  priority: z.number().int().min(0).max(1000).optional(),
});

export const adSlotUpdateSchema = z.object({
  page: adSlotPageEnum.optional(),
  placement: adSlotPlacementEnum.optional(),
  html: z.string().trim().max(4000).nullable().optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  linkUrl: z.string().trim().url().nullable().optional(),
  active: z.boolean().optional(),
  priority: z.number().int().min(0).max(1000).optional(),
});

export const premiumToggleSchema = z.object({
  userId: z.string().trim().min(1),
  enabled: z.boolean(),
});

export const featureFlagToggleSchema = z.object({
  key: featureFlagKeyEnum,
  enabled: z.boolean(),
});
