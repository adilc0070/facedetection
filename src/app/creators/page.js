import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { User } from "@/lib/models/User";
import CreatorCard from "@/components/CreatorCard";
import CreatorsFilter from "@/components/CreatorsFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creators — Lumina",
  description: "Browse AI video creators from the Lumina course community.",
};

export default async function CreatorsPage({ searchParams }) {
  const params = await searchParams;
  await connectDB();
  await ensureSeeded();

  const filter = { role: "creator" };
  if (params.skill) filter.skills = params.skill;
  if (params.q) {
    filter.$or = [
      { name: { $regex: params.q, $options: "i" } },
      { headline: { $regex: params.q, $options: "i" } },
      { skills: { $regex: params.q, $options: "i" } },
    ];
  }

  const creators = await User.find(filter)
    .select("-passwordHash")
    .sort({ featured: -1, rating: -1 })
    .lean();

  return (
    <div className="section-pad pt-10">
      <div className="container-x">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Creators</h1>
          <p className="mt-3 text-[var(--ink-soft)]">
            Hire course-trained AI video freelancers. Payment goes to Lumina, then to them on approval.
          </p>
        </div>
        <div className="mt-8">
          <CreatorsFilter initialQ={params.q || ""} initialSkill={params.skill || ""} />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={String(creator._id)} creator={creator} />
          ))}
        </div>
        {creators.length === 0 ? (
          <p className="mt-16 text-center text-[var(--ink-soft)]">No creators match that search.</p>
        ) : null}
      </div>
    </div>
  );
}
