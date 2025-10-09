import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileDetails } from "@/components/profile/ProfileDetails";
import { profiles } from "@/lib/sample";

interface ProfileDetailPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return profiles.map((profile) => ({ slug: profile.slug }));
}

export function generateMetadata({ params }: ProfileDetailPageProps): Metadata {
  const profile = profiles.find((candidate) => candidate.slug === params.slug);
  if (!profile) {
    return { title: "Profile not found" };
  }

  return {
    title: `${profile.displayName} • Profiles`,
    description: profile.tagline ?? profile.bio,
  };
}

export default function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const profile = profiles.find((candidate) => candidate.slug === params.slug);

  if (!profile) {
    notFound();
  }

  return (
    <main className="space-y-10">
      <ProfileDetails profile={profile} allProfiles={profiles} />
    </main>
  );
}
