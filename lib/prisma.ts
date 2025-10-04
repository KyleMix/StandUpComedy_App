import {
  addFavorite,
  createApplication,
  createComedianProfile,
  createGig,
  createUser,
  createVerificationRequest,
  getApplicationById,
  getGigById,
  getComedianProfile,
  listComedianProfiles,
  listComedianVideosForUser,
  listComedianAppearancesForUser,
  getPromoterProfile,
  getUserByEmail,
  getUserById,
  getVerificationRequestById,
  getVenueProfile,
  listApplicationsForUser,
  listFavoritesForUser,
  listGigs,
  listGigsForUser,
  listVerificationRequests,
  listVerificationRequestsByUser,
  updateApplication,
  updateGig,
  updatePromoterProfile,
  updateVerificationRequest,
  updateVenueProfile,
  deleteGig
} from "@/lib/dataStore";
import { PrismaClient } from "@prisma/client";
import type {
  Application,
  ComedianAppearance,
  ComedianProfile,
  ComedianVideo,
  Favorite,
  Gig,
  PromoterProfile,
  User,
  VerificationRequest,
  VenueProfile
} from "@/lib/dataStore";
import type { ApplicationStatus, GigCompensationType, GigStatus, Role, VerificationStatus } from "@/lib/prismaEnums";

type VerificationUserInclude = true | { include?: { promoter?: boolean; venue?: boolean } };

type PrismaUser = User & {
  comedian?: ComedianProfile | null;
  promoter?: PromoterProfile | null;
  venue?: VenueProfile | null;
  applications?: Application[];
  gigs?: Gig[];
  favorites?: Favorite[];
};

type PrismaApplicationWithGig = Application & { gig: Gig | null };

type PrismaComedianProfile = ComedianProfile & {
  user?: User | null;
  videos?: ComedianVideo[];
  appearances?: ComedianAppearance[];
};

interface ComedianInclude {
  user?: boolean;
  videos?: { take?: number; orderBy?: { postedAt?: "asc" | "desc" } };
  appearances?: { take?: number; orderBy?: { performedAt?: "asc" | "desc" } };
}

interface FindManyComedianArgs {
  include?: ComedianInclude;
}

interface FindUniqueComedianArgs {
  where: { userId: string };
  include?: ComedianInclude;
}

interface FindUniqueUserArgs {
  where: { id?: string; email?: string };
  include?: {
    comedian?: boolean;
    promoter?: boolean;
    venue?: boolean;
    applications?: { take?: number; orderBy?: { createdAt?: "asc" | "desc" } };
    gigs?: { take?: number; orderBy?: { createdAt?: "asc" | "desc" } };
    favorites?: { take?: number; orderBy?: { createdAt?: "asc" | "desc" } };
  };
}

interface CreateUserArgs {
  data: {
    name?: string | null;
    email: string;
    hashedPassword?: string | null;
    role: Role;
  };
}

interface FindManyGigArgs {
  where?: {
    isPublished?: boolean;
    title?: { contains: string; mode?: "insensitive" | "default" };
    city?: { contains: string; mode?: "insensitive" | "default" };
    state?: string;
    compensationType?: GigCompensationType;
    status?: GigStatus;
    payoutUsd?: { gte?: number };
  };
  orderBy?: { dateStart?: "asc" | "desc" };
  skip?: number;
  take?: number;
}

interface CreateGigArgs {
  data: {
    createdByUserId: string;
    title: string;
    description: string;
    compensationType: GigCompensationType;
    payoutUsd: number | null;
    dateStart: Date | string;
    dateEnd: Date | string | null;
    timezone: string;
    city: string;
    state: string;
    minAge: number | null;
    isPublished: boolean;
    status: GigStatus;
  };
}

interface UpdateGigArgs {
  where: { id: string };
  data: Partial<CreateGigArgs["data"]>;
}

type VerificationRequestWithUser = VerificationRequest & { user: PrismaUser | null };

type VerificationQueryArgs<IncludeUser extends boolean | VerificationUserInclude | undefined = undefined> = {
  where?: { userId?: string };
  orderBy?: { createdAt?: "asc" | "desc" };
  include?: {
    user?: IncludeUser;
  };
};

type VerificationQueryResult<IncludeUser extends boolean | VerificationUserInclude | undefined> = IncludeUser extends
  | true
  | { include?: { promoter?: boolean; venue?: boolean } }
  ? VerificationRequestWithUser
  : VerificationRequest;

interface CreateVerificationArgs {
  data: {
    userId: string;
    roleRequested: Role;
    message: string;
    documents: unknown;
    status: VerificationStatus;
  };
}

interface UpdateVerificationArgs {
  where: { id: string };
  data: Partial<{
    roleRequested: Role;
    message: string;
    documents: unknown;
    status: VerificationStatus;
    reviewedBy: string | null;
  }>;
}

interface CreateApplicationArgs {
  data: {
    gigId: string;
    comedianUserId: string;
    message: string;
    status: ApplicationStatus;
  };
}

interface UpdateApplicationArgs {
  where: { id: string };
  data: { status?: ApplicationStatus; message?: string };
}

function sortByDate<T extends { createdAt: Date }>(items: T[], direction: "asc" | "desc" = "desc") {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aTime = a.createdAt.getTime();
    const bTime = b.createdAt.getTime();
    return direction === "asc" ? aTime - bTime : bTime - aTime;
  });
  return sorted;
}

function applyPagination<T>(items: T[], take?: number, skip?: number) {
  const start = skip ?? 0;
  const end = take ? start + take : undefined;
  return items.slice(start, end);
}

async function hydrateComedianProfile(
  profile: ComedianProfile,
  include?: ComedianInclude
): Promise<PrismaComedianProfile> {
  const result: PrismaComedianProfile = { ...profile };
  if (include?.user) {
    result.user = await getUserById(profile.userId);
  }
  if (include?.videos) {
    const config = include.videos;
    let videos = await listComedianVideosForUser(profile.userId);
    if (config.orderBy?.postedAt === "asc") {
      videos = [...videos].sort((a, b) => a.postedAt.getTime() - b.postedAt.getTime());
    }
    if (config.take !== undefined) {
      videos = videos.slice(0, config.take);
    }
    result.videos = videos;
  }
  if (include?.appearances) {
    const config = include.appearances;
    let appearances = await listComedianAppearancesForUser(profile.userId);
    if (config.orderBy?.performedAt === "asc") {
      appearances = [...appearances].sort((a, b) => a.performedAt.getTime() - b.performedAt.getTime());
    }
    if (config.take !== undefined) {
      appearances = appearances.slice(0, config.take);
    }
    result.appearances = appearances;
  }
  return result;
}

const prismaClient: PrismaClient & { __patched?: true } = (globalThis as any).__prismaClient ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  (globalThis as any).__prismaClient = prismaClient;
}

export const prisma = {
  user: {
    async findUnique(args: FindUniqueUserArgs): Promise<PrismaUser | null> {
      const { where, include } = args;
      let user = null;
      if (where.id) {
        user = await getUserById(where.id);
      } else if (where.email) {
        user = await getUserByEmail(where.email);
      }
      if (!user) return null;
      const needsPromoter = include?.promoter;
      const needsVenue = include?.venue;
      const result: PrismaUser = { ...user };
      const promoterProfile = needsPromoter ? await getPromoterProfile(user.id) : undefined;
      const venueProfile = needsVenue ? await getVenueProfile(user.id) : undefined;
      if (include?.comedian) {
        result.comedian = await getComedianProfile(user.id);
      }
      if (include?.promoter) {
        result.promoter = promoterProfile ?? null;
      }
      if (include?.venue) {
        result.venue = venueProfile ?? null;
      }
      if (include?.applications) {
        const applications = sortByDate(
          await listApplicationsForUser(user.id),
          include.applications.orderBy?.createdAt ?? "desc"
        );
        result.applications = applyPagination(applications, include.applications.take, 0);
      }
      if (include?.gigs) {
        const gigs = sortByDate(await listGigsForUser(user.id), include.gigs.orderBy?.createdAt ?? "desc");
        result.gigs = applyPagination(gigs, include.gigs.take, 0);
      }
      if (include?.favorites) {
        const favorites = await listFavoritesForUser(user.id, {
          take: include.favorites.take,
          order: include.favorites.orderBy?.createdAt ?? "desc"
        });
        result.favorites = favorites;
      }
      return result;
    },
    async create(args: CreateUserArgs) {
      return createUser(args.data);
    }
  },
  gig: {
    async findMany(args: FindManyGigArgs = {}) {
      const { where, orderBy, skip, take } = args;
      return listGigs({
        isPublished: where?.isPublished,
        titleContains: where?.title?.contains
          ? { value: where.title.contains, mode: where.title.mode ?? "default" }
          : undefined,
        cityContains: where?.city?.contains ? { value: where.city.contains, mode: where.city.mode ?? "default" } : undefined,
        state: where?.state,
        compensationType: where?.compensationType,
        status: where?.status,
        minPayout: where?.payoutUsd?.gte,
        orderByDateStart: orderBy?.dateStart,
        skip,
        take
      });
    },
    async findUnique(args: { where: { id: string } }) {
      return getGigById(args.where.id);
    },
    async create(args: CreateGigArgs) {
      return createGig({
        ...args.data,
        dateStart:
          args.data.dateStart instanceof Date ? args.data.dateStart.toISOString() : args.data.dateStart,
        dateEnd:
          args.data.dateEnd instanceof Date
            ? args.data.dateEnd.toISOString()
            : args.data.dateEnd ?? null,
        minAge: args.data.minAge,
        payoutUsd: args.data.payoutUsd,
        isPublished: args.data.isPublished,
        status: args.data.status
      });
    },
    async update(args: UpdateGigArgs) {
      const payload = { ...args.data } as Parameters<typeof updateGig>[1];
      if (args.data.dateStart instanceof Date) {
        payload.dateStart = args.data.dateStart.toISOString();
      }
      if (args.data.dateEnd instanceof Date) {
        payload.dateEnd = args.data.dateEnd.toISOString();
      } else if (args.data.dateEnd === null) {
        payload.dateEnd = null;
      }
      return updateGig(args.where.id, payload);
    },
    async delete(args: { where: { id: string } }) {
      await deleteGig(args.where.id);
      return { id: args.where.id };
    }
  },
  comedian: {
    async findMany(args: FindManyComedianArgs = {}) {
      const profiles = await listComedianProfiles();
      return Promise.all(profiles.map((profile) => hydrateComedianProfile(profile, args.include)));
    },
    async findUnique(args: FindUniqueComedianArgs) {
      const profile = await getComedianProfile(args.where.userId);
      if (!profile) return null;
      return hydrateComedianProfile(profile, args.include);
    }
  },
  comedianProfile: {
    async create(args: { data: { userId: string; stageName: string } }) {
      return createComedianProfile(args.data);
    },
    async findUnique(args: { where: { userId: string } }) {
      return getComedianProfile(args.where.userId);
    }
  },
  promoterProfile: {
    async findUnique(args: { where: { userId: string } }) {
      return getPromoterProfile(args.where.userId);
    },
    async update(args: { where: { userId: string }; data: { verificationStatus?: VerificationStatus } }) {
      return updatePromoterProfile(args.where.userId, args.data);
    }
  },
  venueProfile: {
    async findUnique(args: { where: { userId: string } }) {
      return getVenueProfile(args.where.userId);
    },
    async update(args: { where: { userId: string }; data: { verificationStatus?: VerificationStatus } }) {
      return updateVenueProfile(args.where.userId, args.data);
    }
  },
  verificationRequest: {
    async findMany<IncludeUser extends boolean | VerificationUserInclude | undefined = undefined>(
      args: VerificationQueryArgs<IncludeUser> = {}
    ): Promise<VerificationQueryResult<IncludeUser>[]> {
      const items = args.where?.userId
        ? await listVerificationRequestsByUser(args.where.userId)
        : await listVerificationRequests({ orderBy: args.orderBy });
      if (!args.include?.user) {
        return items as VerificationQueryResult<IncludeUser>[];
      }
      const include = args.include.user;
      const requestsWithUser = await Promise.all(
        items.map(async (request) => {
          const user = await prisma.user.findUnique({
            where: { id: request.userId },
            include: typeof include === "object" ? include.include : undefined
          });
          return { ...request, user };
        })
      );
      return requestsWithUser as VerificationQueryResult<IncludeUser>[];
    },
    async findFirst<IncludeUser extends boolean | VerificationUserInclude | undefined = undefined>(
      args: VerificationQueryArgs<IncludeUser> = {}
    ): Promise<VerificationQueryResult<IncludeUser> | null> {
      const records = await prisma.verificationRequest.findMany({ ...args });
      return records[0] ?? null;
    },
    async findUnique<IncludeUser extends boolean | VerificationUserInclude | undefined = undefined>(
      args: { where: { id: string }; include?: VerificationQueryArgs<IncludeUser>["include"] }
    ): Promise<VerificationQueryResult<IncludeUser> | null> {
      const request = await getVerificationRequestById(args.where.id);
      if (!request) return null;
      if (!args.include?.user) return request as VerificationQueryResult<IncludeUser>;
      const include = args.include.user;
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
        include: typeof include === "object" ? include.include : undefined
      });
      return { ...request, user } as VerificationQueryResult<IncludeUser>;
    },
    async create(args: CreateVerificationArgs) {
      return createVerificationRequest(args.data);
    },
    async update(args: UpdateVerificationArgs) {
      return updateVerificationRequest(args.where.id, args.data);
    }
  },
  application: {
    async create(args: CreateApplicationArgs) {
      return createApplication({
        gigId: args.data.gigId,
        comedianUserId: args.data.comedianUserId,
        message: args.data.message,
        status: args.data.status
      });
    },
    async findUnique<IncludeGig extends boolean | undefined = undefined>(
      args: { where: { id: string }; include?: { gig?: IncludeGig } }
    ): Promise<(IncludeGig extends true ? PrismaApplicationWithGig : Application) | null> {
      const application = await getApplicationById(args.where.id);
      if (!application) return null;
      if (args.include?.gig) {
        const gig = await prisma.gig.findUnique({ where: { id: application.gigId } });
        return { ...application, gig } as IncludeGig extends true ? PrismaApplicationWithGig : Application;
      }
      return application as IncludeGig extends true ? PrismaApplicationWithGig : Application;
    },
    async update(args: UpdateApplicationArgs) {
      return updateApplication(args.where.id, args.data);
    }
  },
  favorite: {
    async create(args: { data: { userId: string; gigId?: string | null; venueId?: string | null } }) {
      return addFavorite(args.data);
    }
  },
  openMic: prismaClient.openMic,
  ingestLog: prismaClient.ingestLog,
  $transaction: prismaClient.$transaction.bind(prismaClient),
  $disconnect: prismaClient.$disconnect.bind(prismaClient),
  $connect: prismaClient.$connect.bind(prismaClient)
};
