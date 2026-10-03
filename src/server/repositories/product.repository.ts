import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProductFilterQuery } from "../validators/product.validator";
import { PaginatedResult } from "../validators/pagination.validator";

export class ProductRepository {
  /**
   * Find products with dynamic filters, search, sorting, and pagination
   */
  async findManyWithFilters(filters: ProductFilterQuery): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 12,
      sortBy = "relevance",
      category,
      gender,
      collection,
      minPrice,
      maxPrice,
      sizes,
      colors,
      occasions,
      search,
      inStockOnly,
      isFeatured,
      isNewArrival,
      isBestSeller,
    } = filters;

    const skip = (page - 1) * limit;

    // Build Prisma Where Clause
    const where: Prisma.ProductWhereInput = {
      isArchived: false,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (gender) {
      where.category = {
        ...(where.category as Prisma.CategoryWhereInput),
        gender: gender,
      };
    }

    if (collection) {
      where.collection = { slug: collection };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    if (occasions && occasions.length > 0) {
      where.occasion = { in: occasions };
    }

    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;
    if (isBestSeller !== undefined) where.isBestSeller = isBestSeller;

    // Filter by Variants (Size, Color, In-Stock)
    const variantWhere: Prisma.ProductVariantWhereInput = {};
    if (sizes && sizes.length > 0) variantWhere.size = { in: sizes };
    if (colors && colors.length > 0) variantWhere.color = { in: colors };
    if (inStockOnly) variantWhere.stock = { gt: 0 };

    if (Object.keys(variantWhere).length > 0) {
      where.variants = { some: variantWhere };
    }

    // Keyword Search on Title and Description
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Determine Sorting Strategy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (sortBy) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "popularity":
        orderBy = { rating: "desc" };
        break;
      case "discount":
        orderBy = { discountPercent: "desc" };
        break;
      case "relevance":
      default:
        orderBy = { isFeatured: "desc" };
        break;
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true, gender: true } },
          collection: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { displayOrder: "asc" },
            take: 2,
          },
          variants: {
            where: { isAvailable: true },
            select: { id: true, size: true, color: true, colorHex: true, price: true, mrp: true, stock: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find product by unique slug with all relations for detail page
   */
  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug, isArchived: false },
      include: {
        category: true,
        collection: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: {
          orderBy: { price: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Find product by ID
   */
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id, isArchived: false },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });
  }

  /**
   * Find variant by ID with parent product info
   */
  async findVariantById(variantId: string) {
    return prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
      },
    });
  }
}

export const productRepository = new ProductRepository();
