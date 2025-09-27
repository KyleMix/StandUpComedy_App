import { PrismaClient, Role, VerificationStatus, GigCompensationType, GigStatus, ApplicationStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.application.deleteMany();
  await prisma.show.deleteMany();
  await prisma.gig.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.comedianProfile.deleteMany();
  await prisma.promoterProfile.deleteMany();
  await prisma.venueProfile.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@thefunny.local",
      hashedPassword: await hash("password", 10),
      role: Role.ADMIN
    }
  });

  const promoter = await prisma.user.create({
    data: {
      name: "Laugh Booker",
      email: "promoter@thefunny.local",
      hashedPassword: await hash("password", 10),
      role: Role.PROMOTER,
      promoter: {
        create: {
          organization: "Laugh Riot Events",
          contactName: "Laugh Booker",
          verificationStatus: VerificationStatus.APPROVED
        }
      }
    },
    include: { promoter: true }
  });

  const venue = await prisma.user.create({
    data: {
      name: "Comedy Room",
      email: "venue@thefunny.local",
      hashedPassword: await hash("password", 10),
      role: Role.VENUE,
      venue: {
        create: {
          venueName: "Comedy Room",
          address1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          contactEmail: "venue@thefunny.local",
          verificationStatus: VerificationStatus.APPROVED
        }
      }
    },
    include: { venue: true }
  });

  const otherVenue = await prisma.user.create({
    data: {
      name: "Giggle House",
      email: "venue2@thefunny.local",
      hashedPassword: await hash("password", 10),
      role: Role.VENUE,
      venue: {
        create: {
          venueName: "Giggle House",
          address1: "55 Pine Ave",
          city: "Chicago",
          state: "IL",
          postalCode: "60601",
          contactEmail: "venue2@thefunny.local",
          verificationStatus: VerificationStatus.APPROVED
        }
      }
    }
  });

  const comedians = await Promise.all(
    Array.from({ length: 5 }).map(async (_, index) => {
      return prisma.user.create({
        data: {
          name: `Comic ${index + 1}`,
          email: `comic${index + 1}@thefunny.local`,
          hashedPassword: await hash("password", 10),
          role: Role.COMEDIAN,
          comedian: {
            create: {
              stageName: `Comic ${index + 1}`,
              bio: "Stand-up comedian ready to tour.",
              homeCity: "Los Angeles",
              homeState: "CA"
            }
          }
        }
      });
    })
  );

  const gigs = await Promise.all(
    Array.from({ length: 8 }).map(async (_, index) => {
      return prisma.gig.create({
        data: {
          createdByUserId: promoter.id,
          title: `Showcase Night #${index + 1}`,
          description: "A curated night of comedy with fresh acts.",
          compensationType: Object.values(GigCompensationType)[index % 4],
          payoutUsd: 150 + index * 25,
          dateStart: new Date(Date.now() + index * 1000 * 60 * 60 * 24 * 7),
          dateEnd: new Date(Date.now() + index * 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 120),
          timezone: "America/New_York",
          city: index % 2 === 0 ? "New York" : "Chicago",
          state: index % 2 === 0 ? "NY" : "IL",
          minAge: 21,
          isPublished: true,
          status: GigStatus.OPEN
        }
      });
    })
  );

  await prisma.application.create({
    data: {
      gigId: gigs[0].id,
      comedianUserId: comedians[0].id,
      message: "I'd love to perform!",
      status: ApplicationStatus.SUBMITTED
    }
  });

  await prisma.favorite.create({
    data: {
      userId: comedians[0].id,
      gigId: gigs[1].id
    }
  });

  await prisma.favorite.create({
    data: {
      userId: promoter.id,
      venueId: venue.id
    }
  });

  console.log("Seed data created", { admin: admin.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
