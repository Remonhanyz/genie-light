export declare function getFeaturedCaseStudies(): Promise<({
    images: {
        order: number;
        id: string;
        url: string;
        caption: string | null;
        caseStudyId: string;
    }[];
} & {
    client: string;
    id: string;
    slug: string;
    title: string;
    sector: string;
    location: string;
    completionDate: Date | null;
    summary: string;
    challenges: string;
    solutions: string;
    standards: string | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getAllCaseStudies(): Promise<({
    _count: {
        images: number;
    };
    images: {
        order: number;
        id: string;
        url: string;
        caption: string | null;
        caseStudyId: string;
    }[];
} & {
    client: string;
    id: string;
    slug: string;
    title: string;
    sector: string;
    location: string;
    completionDate: Date | null;
    summary: string;
    challenges: string;
    solutions: string;
    standards: string | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getCaseStudyById(id: string): Promise<({
    images: {
        order: number;
        id: string;
        url: string;
        caption: string | null;
        caseStudyId: string;
    }[];
} & {
    client: string;
    id: string;
    slug: string;
    title: string;
    sector: string;
    location: string;
    completionDate: Date | null;
    summary: string;
    challenges: string;
    solutions: string;
    standards: string | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function getCaseStudyBySlug(slug: string): Promise<({
    images: {
        order: number;
        id: string;
        url: string;
        caption: string | null;
        caseStudyId: string;
    }[];
} & {
    client: string;
    id: string;
    slug: string;
    title: string;
    sector: string;
    location: string;
    completionDate: Date | null;
    summary: string;
    challenges: string;
    solutions: string;
    standards: string | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function createCaseStudy(data: {
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
    images?: {
        url: string;
        caption?: string;
        order?: number;
    }[];
}): Promise<{
    images: {
        order: number;
        id: string;
        url: string;
        caption: string | null;
        caseStudyId: string;
    }[];
} & {
    client: string;
    id: string;
    slug: string;
    title: string;
    sector: string;
    location: string;
    completionDate: Date | null;
    summary: string;
    challenges: string;
    solutions: string;
    standards: string | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateCaseStudy(id: string, data: {
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
    images?: {
        url: string;
        caption?: string;
        order?: number;
    }[];
}): Promise<{
    images: {
        order: number;
        id: string;
        url: string;
        caption: string | null;
        caseStudyId: string;
    }[];
} & {
    client: string;
    id: string;
    slug: string;
    title: string;
    sector: string;
    location: string;
    completionDate: Date | null;
    summary: string;
    challenges: string;
    solutions: string;
    standards: string | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteCaseStudy(id: string): Promise<{
    client: string;
    id: string;
    slug: string;
    title: string;
    sector: string;
    location: string;
    completionDate: Date | null;
    summary: string;
    challenges: string;
    solutions: string;
    standards: string | null;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=case-study.d.ts.map