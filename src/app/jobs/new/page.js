import NewJobForm from "@/components/NewJobForm";

export const metadata = {
  title: "Post a job — Lumina",
};

export default function NewJobPage() {
  return (
    <div className="section-pad pt-10">
      <div className="container-x max-w-2xl">
        <h1 className="font-display text-4xl font-semibold">Post a job</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Describe the AI video work you need. Creators propose, you hire, and payment goes to Lumina escrow.
        </p>
        <NewJobForm />
      </div>
    </div>
  );
}
