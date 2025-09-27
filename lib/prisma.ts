import {
  addFavorite,
  createApplication,
  createGig,
  createUser,
  createVerificationRequest,
  getApplicationById,
  getGigById,
  getComedianProfile,
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
import type { ApplicationStatus, GigCompensationType, GigStatus, Role, VerificationStatus } from "@/lib/prismaEnums";

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
  select?: {
    id?: boolean;
    name?: boolean;
    email?: boolean;
    role?: boolean;
    promoter?: { select?: { verificationStatus?: boolean } } | boolean;
    venue?: { select?: { verificationStatus?: boolean } } | boolean;
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

interface VerificationQueryArgs {
  where?: { userId?: string };
  orderBy?: { createdAt?: "asc" | "desc" };
  include?: {
    user?: {
      include?: {
        promoter?: boolean;
        venue?: boolean;
      };
    } | boolean;
  };
}

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

export const prisma = {
  user: {
    async findUnique(args: FindUniqueUserArgs) {
      const { where, include, select } = args;
      let user = null;
      if (where.id) {
        user = await getUserById(where.id);
      } else if (where.email) {
        user = await getUserByEmail(where.email);
      }
      if (!user) return null;
      const needsPromoter = include?.promoter || select?.promoter;
      const needsVenue = include?.venue || select?.venue;
      const result: Record<string, unknown> = { ...user };
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
      if (select) {
        const selected: Record<string, unknown> = {};
        if (select.id) selected.id = user.id;
        if (select.name) selected.name = user.name ?? null;
        if (select.email) selected.email = user.email;
        if (select.role) selected.role = user.role;
        if (select.promoter) {
          const profile = promoterProfile ?? null;
          if (typeof select.promoter === "object" && select.promoter.select?.verificationStatus) {
            selected.promoter = profile ? { verificationStatus: profile.verificationStatus } : null;
          } else {
            selected.promoter = profile;
          }
        }
        if (select.venue) {
          const profile = venueProfile ?? null;
          if (typeof select.venue === "object" && select.venue.select?.verificationStatus) {
            selected.venue = profile ? { verificationStatus: profile.verificationStatus } : null;
          } else {
            selected.venue = profile;
          }
        }
        return selected;
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
        dateStart: args.data.dateStart,
        dateEnd: args.data.dateEnd,
        minAge: args.data.minAge,
        payoutUsd: args.data.payoutUsd,
        isPublished: args.data.isPublished,
        status: args.data.status
      });
    },
    async update(args: UpdateGigArgs) {
      return updateGig(args.where.id, args.data);
    },
    async delete(args: { where: { id: string } }) {
      await deleteGig(args.where.id);
      return { id: args.where.id };
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
    async findMany(args: VerificationQueryArgs = {}) {
      const items = args.where?.userId
        ? await listVerificationRequestsByUser(args.where.userId)
        : await listVerificationRequests({ orderBy: args.orderBy });
      if (!args.include?.user) {
        return items;
      }
      return Promise.all(
        items.map(async (request) => {
          const user = await prisma.user.findUnique({
            where: { id: request.userId },
            include:
              typeof args.include?.user === "object"
                ? args.include.user.include
                : undefined
          });
          return { ...request, user };
        })
      );
    },
    async findFirst(args: VerificationQueryArgs = {}) {
      const records = await prisma.verificationRequest.findMany({ ...args });
      return records[0] ?? null;
    },
    async findUnique(args: { where: { id: string }; include?: VerificationQueryArgs["include"] }) {
      const request = await getVerificationRequestById(args.where.id);
      if (!request) return null;
      if (!args.include?.user) return request;
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
        include: typeof args.include.user === "object" ? args.include.user.include : undefined
      });
      return { ...request, user };
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
    async findUnique(args: { where: { id: string }; include?: { gig?: boolean } }) {
      const application = await getApplicationById(args.where.id);
      if (!application) return null;
      if (args.include?.gig) {
        const gig = await prisma.gig.findUnique({ where: { id: application.gigId } });
        return { ...application, gig };
      }
      return application;
    },
    async update(args: UpdateApplicationArgs) {
      return updateApplication(args.where.id, args.data);
    }
  },
  favorite: {
    async create(args: { data: { userId: string; gigId?: string | null; venueId?: string | null } }) {
      return addFavorite(args.data);
    }
  }
};
