import { connectDB } from "./db";
import { hashPassword } from "./auth";
import { User } from "./models/User";
import { Job } from "./models/Job";
import { Proposal } from "./models/Proposal";
import { Order } from "./models/Order";
import { Review } from "./models/Review";
import { calcFees } from "./utils";

const globalForSeed = globalThis;

export async function ensureSeeded() {
  if (globalForSeed.__luminaSeeded) return;
  await connectDB();

  const count = await User.countDocuments();
  if (count > 0) {
    globalForSeed.__luminaSeeded = true;
    return;
  }

  const passwordHash = await hashPassword("password123");

  const creators = await User.insertMany([
    {
      name: "Ava Chen",
      email: "ava@lumina.studio",
      passwordHash,
      role: "creator",
      headline: "Cinematic AI product films",
      bio: "Course graduate specializing in photoreal product ads and luxury brand films using Midjourney, Kling, and Runway.",
      location: "Singapore",
      skills: ["Runway", "Kling", "Product Ads", "Color Grade"],
      hourlyRate: 85,
      startingPrice: 450,
      rating: 4.9,
      reviewCount: 48,
      completedOrders: 62,
      featured: true,
      verified: true,
      courseGraduate: true,
      responseTime: "Under 2 hours",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      portfolio: [
        {
          title: "Aurora Watch Drop",
          thumbnail:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop",
          url: "#",
        },
        {
          title: "Soft Beauty Reel",
          thumbnail:
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop",
          url: "#",
        },
      ],
    },
    {
      name: "Marcus Reed",
      email: "marcus@lumina.studio",
      passwordHash,
      role: "creator",
      headline: "High-converting UGC & social shorts",
      bio: "I craft scroll-stopping UGC-style AI videos for DTC brands. Trained through the AI Creative Course.",
      location: "Austin, TX",
      skills: ["UGC", "CapCut", "Hooks", "TikTok Ads"],
      hourlyRate: 65,
      startingPrice: 250,
      rating: 4.8,
      reviewCount: 91,
      completedOrders: 140,
      featured: true,
      verified: true,
      courseGraduate: true,
      responseTime: "Same day",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      portfolio: [
        {
          title: "Snack Brand Hooks",
          thumbnail:
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=500&fit=crop",
          url: "#",
        },
      ],
    },
    {
      name: "Sofia Alvarez",
      email: "sofia@lumina.studio",
      passwordHash,
      role: "creator",
      headline: "Motion systems & brand worlds",
      bio: "Abstract motion, generative environments, and brand identity films for tech and fashion.",
      location: "Barcelona",
      skills: ["After Effects", "Luma Dream Machine", "Motion", "Sound Design"],
      hourlyRate: 95,
      startingPrice: 600,
      rating: 5.0,
      reviewCount: 27,
      completedOrders: 34,
      featured: true,
      verified: true,
      courseGraduate: true,
      responseTime: "Within 12 hours",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      portfolio: [
        {
          title: "Nebula Brand Film",
          thumbnail:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop",
          url: "#",
        },
      ],
    },
    {
      name: "Jonah Park",
      email: "jonah@lumina.studio",
      passwordHash,
      role: "creator",
      headline: "Explainer videos that actually explain",
      bio: "Clear narrative + polished AI visuals for SaaS and fintech launches.",
      location: "Seoul",
      skills: ["Explainers", "Storyboarding", "ElevenLabs", "HeyGen"],
      hourlyRate: 70,
      startingPrice: 400,
      rating: 4.7,
      reviewCount: 39,
      completedOrders: 51,
      featured: false,
      verified: true,
      courseGraduate: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      portfolio: [],
    },
  ]);

  const [client] = await User.insertMany([
    {
      name: "Elena Rossi",
      email: "elena@brandco.com",
      passwordHash,
      role: "client",
      company: "BrandCo",
      headline: "Head of Growth at BrandCo",
      bio: "Hiring AI video talent for always-on social and product launches.",
      location: "Milan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    },
    {
      name: "Platform Admin",
      email: "admin@lumina.studio",
      passwordHash,
      role: "admin",
      headline: "Lumina operations",
      verified: true,
    },
  ]);

  const jobs = await Job.insertMany([
    {
      title: "30s AI product launch film for new earbuds",
      description:
        "We need a sleek, Apple-style product film showing our earbuds in cinematic lighting. Deliver 1 master cut + 3 social crops.",
      category: "product-ads",
      budgetMin: 800,
      budgetMax: 1500,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      skills: ["Product Ads", "Runway", "Color Grade"],
      client: client._id,
      status: "open",
      proposalCount: 1,
    },
    {
      title: "UGC-style TikTok pack (8 videos)",
      description:
        "Authentic AI UGC creatives for a clean beauty brand. Need hook-first edits optimized for paid social.",
      category: "ugc",
      budgetMin: 500,
      budgetMax: 900,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      skills: ["UGC", "TikTok Ads", "Hooks"],
      client: client._id,
      status: "open",
      proposalCount: 0,
    },
    {
      title: "SaaS feature explainer (60–90s)",
      description:
        "Explain our new analytics dashboard with voiceover, soft UI motion, and modern pacing.",
      category: "explainers",
      budgetMin: 700,
      budgetMax: 1200,
      skills: ["Explainers", "Storyboarding"],
      client: client._id,
      status: "open",
      proposalCount: 0,
    },
  ]);

  await Proposal.create({
    job: jobs[0]._id,
    creator: creators[0]._id,
    coverLetter:
      "I specialize in luxury product films and can deliver a refined earbuds spot with premium lighting and seamless social crops.",
    bidAmount: 1200,
    deliveryDays: 7,
    status: "pending",
  });

  const fees = calcFees(900);
  await Order.create({
    client: client._id,
    creator: creators[1]._id,
    title: "Pilot social shorts pack",
    description: "Demo escrow order — funded and in progress.",
    amount: 900,
    ...fees,
    status: "in_progress",
    paidAt: new Date(),
    paymentRef: "demo_pay_001",
  });

  await Review.create({
    order: (
      await Order.create({
        client: client._id,
        creator: creators[0]._id,
        title: "Completed beauty reel",
        amount: 650,
        ...calcFees(650),
        status: "completed",
        paidAt: new Date(Date.now() - 86400000 * 20),
        deliveredAt: new Date(Date.now() - 86400000 * 12),
        completedAt: new Date(Date.now() - 86400000 * 10),
        paymentRef: "demo_pay_000",
      })
    )._id,
    client: client._id,
    creator: creators[0]._id,
    rating: 5,
    comment: "Stunning work. Felt like a premium brand film.",
  });

  globalForSeed.__luminaSeeded = true;
  console.info("[lumina] Demo data seeded");
}
