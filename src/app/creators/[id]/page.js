import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { User } from "@/lib/models/User";
import { Review } from "@/lib/models/Review";
import { formatCurrency } from "@/lib/utils";
import HireButton from "@/components/HireButton";

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage({ params }) {
  const { id } = await params;
  await connectDB();
  await ensureSeeded();

  const creator = await User.findOne({ _id: id, role: "creator" })
    .select("-passwordHash")
    .lean();
  if (!creator) notFound();

  const reviews = await Review.find({ creator: id })
    .populate("client", "name company avatar")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return (
    <div className="section-pad pt-10">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative h-28 w-28 overflow-hidden rounded-[28px] bg-[#ddd]">
                {creator.avatar ? (
                  <Image src={creator.avatar} alt={creator.name} fill className="object-cover" />
                ) : null}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-4xl font-semibold">{creator.name}</h1>
                  {creator.verified ? <BadgeCheck className="text-[var(--accent)]" /> : null}
                </div>
                <p className="mt-2 text-lg text-[var(--ink-soft)]">{creator.headline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--ink-faint)]">
                  {creator.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} /> {creator.location}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="fill-current text-[#f5a623]" />
                    {creator.rating} ({creator.reviewCount} reviews)
                  </span>
                  <span>{creator.completedOrders} orders</span>
                </div>
                {creator.courseGraduate ? (
                  <span className="badge mt-4">AI Creative Course graduate</span>
                ) : null}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">About</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-[var(--ink-soft)]">{creator.bio}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {(creator.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            {(creator.portfolio || []).length > 0 ? (
              <div className="mt-12">
                <h2 className="font-display text-2xl font-semibold">Selected work</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {creator.portfolio.map((item, i) => (
                    <div
                      key={`${item.title}-${i}`}
                      className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-white"
                    >
                      <div className="relative aspect-video">
                        <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                      </div>
                      <p className="p-4 text-sm font-medium">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold">Reviews</h2>
              <div className="mt-5 space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-[var(--ink-soft)]">No reviews yet.</p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={String(review._id)}
                      className="rounded-[20px] border border-[var(--line)] bg-white/80 p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{review.client?.name}</p>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star size={14} className="fill-current text-[#f5a623]" />
                          {review.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[28px] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-28">
            <p className="text-sm text-[var(--ink-faint)]">Starting at</p>
            <p className="font-display text-4xl font-semibold">
              {formatCurrency(creator.startingPrice || creator.hourlyRate || 0)}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Response time: {creator.responseTime || "Within 24 hours"}
            </p>
            <div className="mt-6 space-y-3">
              <HireButton creatorId={String(creator._id)} creatorName={creator.name} rate={creator.startingPrice} />
              <Link href="/jobs" className="btn btn-ghost w-full">
                Invite to a job
              </Link>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[var(--ink-faint)]">
              You pay Lumina. We hold funds in escrow and release the creator payout after you approve delivery.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
