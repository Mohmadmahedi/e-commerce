import prisma from "@/lib/prisma";

export class CategoryRepository {
  /**
   * Retrieve all categories, optionally filtered by gender, with product counts
   */
  async findAll(gender?: string) {
    return prisma.category.findMany({
      where: {
        ...(gender ? { gender } : {}),
      },
      include: {
        children: true,
        _count: {
          select: { products: { where: { isArchived: false } } },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });
  }

  /**
   * Find single category by slug
   */
  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { products: { where: { isArchived: false } } },
        },
      },
    });
  }
}

export const categoryRepository = new CategoryRepository();
