import Image from "next/image";
import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CreatorCard({ creator }) {
  const id = creator._id || creator.id;
  return (
    <Link
      href={`/creators/${id}`}
      className="group block overflow-hidden rounded-[22px] border border-[var(--line)] bg-white/80 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e8ebf0]">
        <Image
          src={
            creator.portfolio?.[0]?.thumbnail ||
            creator.avatar ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop"
          }
          alt={creator.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#ddd]">
            {creator.avatar ? (
              <Image src={creator.avatar} alt="" fill className="object-cover" sizes="44px" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-base font-semibold">{creator.name}</h3>
              {creator.verified ? <BadgeCheck size={16} className="text-[var(--accent)]" /> : null}
            </div>
            <p className="truncate text-sm text-[var(--ink-soft)]">{creator.headline}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1 font-medium">
            <Star size={14} className="fill-current text-[#f5a623]" />
            {creator.rating?.toFixed?.(1) || creator.rating || "New"}
            <span className="text-[var(--ink-faint)]">({creator.reviewCount || 0})</span>
          </span>
          <span className="font-semibold">From {formatCurrency(creator.startingPrice || 0)}</span>
        </div>
        {creator.courseGraduate ? (
          <span className="badge mt-4">Course graduate</span>
        ) : null}
      </div>
    </Link>
  );
}
