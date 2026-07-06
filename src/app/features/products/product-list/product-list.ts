import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cart } from '../../../core/services/cart';
import { Product as ProductService } from '../../../core/services/product';
import { Product } from '../../../shared/models/product';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(Cart);
  private readonly router = inject(Router);

  private readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly selectedCategory = signal('all');

  readonly categories = computed(() => {
    const unique = new Set(this.products().map((p) => p.category));
    return ['all', ...unique];
  });

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.products().filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || product.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  constructor() {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos. Verifica que json-server esté activo.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }

  viewDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
  }
}
