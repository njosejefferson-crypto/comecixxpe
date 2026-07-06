import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';

const STORAGE_KEY = 'ecommerce_cart';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private readonly itemsSignal = signal<CartItem[]>(this.readStoredCart());

  readonly items = this.itemsSignal.asReadonly();
  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly totalPrice = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity * item.product.price, 0),
  );

  addToCart(product: Product): void {
    const items = this.itemsSignal();
    const existing = items.find((item) => item.product.id === product.id);

    if (existing) {
      this.setItems(
        items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      this.setItems([...items, { product, quantity: 1 }]);
    }
  }

  increment(productId: number): void {
    this.setItems(
      this.itemsSignal().map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  decrement(productId: number): void {
    const items = this.itemsSignal()
      .map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);
    this.setItems(items);
  }

  removeItem(productId: number): void {
    this.setItems(this.itemsSignal().filter((item) => item.product.id !== productId));
  }

  clear(): void {
    this.setItems([]);
  }

  private setItems(items: CartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private readStoredCart(): CartItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  }
}
