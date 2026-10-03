import { productRepository } from "../repositories/product.repository";
import { ProductFilterQuery } from "../validators/product.validator";
import { NotFoundError } from "../utils/errors";

export class ProductService {
  /**
   * Fetch paginated and filtered product listing
   */
  async getProducts(filters: ProductFilterQuery) {
    return productRepository.findManyWithFilters(filters);
  }

  /**
   * Fetch single product by slug with validation
   */
  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundError(`Product with slug "${slug}" not found`);
    }
    return product;
  }

  /**
   * Fetch product by ID
   */
  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product not found`);
    }
    return product;
  }
}

export const productService = new ProductService();
