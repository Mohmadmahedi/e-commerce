import { categoryRepository } from "../repositories/category.repository";
import { NotFoundError } from "../utils/errors";

export class CategoryService {
  /**
   * Get all categories, optionally filtered by gender
   */
  async getAllCategories(gender?: string) {
    return categoryRepository.findAll(gender);
  }

  /**
   * Get single category by slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError(`Category with slug "${slug}" not found`);
    }
    return category;
  }
}

export const categoryService = new CategoryService();
