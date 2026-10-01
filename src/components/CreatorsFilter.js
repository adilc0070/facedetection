"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const skills = ["", "Runway", "UGC", "Product Ads", "Explainers", "Motion", "Kling"];

export default function CreatorsFilter({ initialQ, initialSkill }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [skill, setSkill] = useState(initialSkill);

  function apply(nextQ = q, nextSkill = skill) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextSkill) params.set("skill", nextSkill);
    router.push(`/creators?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
        <input
          className="field !pl-11"
          placeholder="Search creators or skills"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
      </div>
      <select
        className="field md:max-w-[200px]"
        value={skill}
        onChange={(e) => {
          setSkill(e.target.value);
          apply(q, e.target.value);
        }}
      >
        <option value="">All skills</option>
        {skills.filter(Boolean).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" onClick={() => apply()}>
        Search
      </button>
    </div>
  );
}
