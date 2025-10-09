"use client";

import { useMemo, useState } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { profiles } from "@/lib/sample";

const tabs = [
  { value: "all", label: "All" },
  { value: "comedian", label: "Comedians" },
  { value: "venue", label: "Venues" },
  { value: "fan", label: "Fans" }
] as const;

type TabValue = (typeof tabs)[number]["value"];

export default function ProfilesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesTab = activeTab === "all" || profile.role === activeTab;
      const matchesSearch = normalizedSearch
        ? `${profile.displayName} ${profile.city} ${profile.tagline ?? ""}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-manrope">Profiles</h1>
        <p className="text-base text-base-content/70">
          Discover comedians, venues, and superfans building the Pacific Northwest comedy scene.
        </p>
      </header>

      <section className="space-y-4">
        <div role="tablist" className="tabs tabs-boxed bg-base-200/60 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              type="button"
              onClick={() => setActiveTab(tab.value)}
              aria-selected={activeTab === tab.value}
              className={`tab whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring focus-visible:ring-secondary/60 ${
                activeTab === tab.value ? "tab-active" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="form-control">
          <label className="input input-bordered flex items-center gap-3 focus-within:ring focus-within:ring-primary/60">
            <span className="text-sm text-base-content/70">Search</span>
            <input
              type="text"
              className="grow bg-transparent focus:outline-none"
              placeholder="Search name or city"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search name or city"
            />
          </label>
        </div>
      </section>

      <section aria-live="polite" className="space-y-4">
        <p className="text-sm text-base-content/70">
          Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? "profile" : "profiles"}.
        </p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.slug} {...profile} />
          ))}
        </div>
        {filteredProfiles.length === 0 && (
          <div className="alert alert-info">
            <span>No profiles match that search yet—check back soon.</span>
          </div>
        )}
      </section>
    </div>
  );
}
