import { prisma } from "@genie-light/database";

export async function getFeaturedCaseStudies() {
  return prisma.projectCaseStudy.findMany({
    where: { featured: true },
    include: {
      images: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllCaseStudies() {
  return prisma.projectCaseStudy.findMany({
    include: {
      images: { orderBy: { order: "asc" } },
      _count: { select: { images: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCaseStudyById(id: string) {
  return prisma.projectCaseStudy.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function getCaseStudyBySlug(slug: string) {
  return prisma.projectCaseStudy.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function createCaseStudy(data: {
  title: string;
  slug?: string;
  client: string;
  sector: string;
  location: string;
  summary: string;
  challenges: string;
  solutions: string;
  standards?: string | null;
  featured?: boolean;
  images?: { url: string; caption?: string; order?: number }[];
}) {
  const slug =
    data.slug ||
    data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  return prisma.projectCaseStudy.create({
    data: {
      title: data.title,
      slug,
      client: data.client,
      sector: data.sector,
      location: data.location,
      summary: data.summary,
      challenges: data.challenges,
      solutions: data.solutions,
      standards: data.standards || null,
      featured: data.featured ?? false,
      images: data.images && data.images.length > 0
        ? {
            create: data.images.map((img, idx) => ({
              url: img.url,
              caption: img.caption || null,
              order: img.order ?? idx,
            })),
          }
        : undefined,
    },
    include: {
      images: true,
    },
  });
}

export async function updateCaseStudy(
  id: string,
  data: {
    title?: string;
    slug?: string;
    client?: string;
    sector?: string;
    location?: string;
    summary?: string;
    challenges?: string;
    solutions?: string;
    standards?: string | null;
    featured?: boolean;
    images?: { url: string; caption?: string; order?: number }[];
  }
) {
  const updateData: any = { ...data };
  if (data.title && !data.slug) {
    updateData.slug = data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  if (data.images && data.images.length > 0) {
    await prisma.projectImage.deleteMany({ where: { caseStudyId: id } });
    updateData.images = {
      create: data.images.map((img, idx) => ({
        url: img.url,
        caption: img.caption || null,
        order: img.order ?? idx,
      })),
    };
  }

  return prisma.projectCaseStudy.update({
    where: { id },
    data: updateData,
    include: {
      images: true,
    },
  });
}

export async function deleteCaseStudy(id: string) {
  return prisma.projectCaseStudy.delete({
    where: { id },
  });
}
