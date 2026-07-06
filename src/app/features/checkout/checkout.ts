import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Cart } from '../../core/services/cart';
import { Order as OrderService } from '../../core/services/order';
import { Order, PaymentMethod } from '../../shared/models/order';

const YAPE_PHONE = '907 744 644';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly auth = inject(Auth);
  private readonly cart = inject(Cart);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly items = this.cart.items;
  readonly total = this.cart.totalPrice;

  readonly yapePhone = YAPE_PHONE;
  readonly yapeQrUrl = computed(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        `yape:${YAPE_PHONE.replace(/\s/g, '')}:${this.total().toFixed(2)}`,
      )}`,
  );

  readonly useCustomQr = signal(true);

  onCustomQrError(): void {
    this.useCustomQr.set(false);
  }

  readonly paymentMethod = signal<PaymentMethod>('efectivo');
  readonly yapeOperationCode = signal('');
  readonly yapeCaptureName = signal<string | null>(null);
  readonly yapeCaptureData = signal<string | null>(null);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
    this.errorMessage.set(null);
  }

  onCaptureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.errorMessage.set(null);
    this.compressImage(file)
      .then((dataUrl) => {
        this.yapeCaptureName.set(file.name);
        this.yapeCaptureData.set(dataUrl);
      })
      .catch(() => {
        this.errorMessage.set('No se pudo procesar la imagen. Intenta con otra captura.');
      });
  }

  private compressImage(file: File, maxBase64Length = 90_000): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        img.onload = () => {
          const maxDimension = 480;
          const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas no soportado.'));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.7;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > maxBase64Length && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  confirmOrder(): void {
    if (this.items().length === 0) {
      return;
    }

    if (this.paymentMethod() === 'yape') {
      if (!this.yapeOperationCode().trim()) {
        this.errorMessage.set('Ingresa el código de operación de Yape.');
        return;
      }
      if (!this.yapeCaptureData()) {
        this.errorMessage.set('Adjunta la captura del pago por Yape.');
        return;
      }
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    const order: Order = {
      userEmail: this.auth.currentUser()?.email ?? '',
      items: this.items().map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total: this.total(),
      paymentMethod: this.paymentMethod(),
      status: this.paymentMethod() === 'efectivo' ? 'confirmado' : 'pendiente_verificacion',
      createdAt: new Date().toISOString(),
      ...(this.paymentMethod() === 'yape'
        ? {
            yapeCode: this.yapeOperationCode().trim(),
            yapeCaptureName: this.yapeCaptureName() ?? undefined,
            yapeCaptureData: this.yapeCaptureData() ?? undefined,
          }
        : {}),
    };

    this.orderService.create(order).subscribe({
      next: () => {
        this.submitting.set(false);
        this.cart.clear();
        this.successMessage.set(
          this.paymentMethod() === 'efectivo'
            ? '¡Pedido confirmado! Paga en efectivo al recibirlo.'
            : '¡Pedido registrado! Verificaremos tu pago de Yape en breve.',
        );
        setTimeout(() => this.router.navigateByUrl('/products'), 2500);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar el pedido. Intenta nuevamente.');
      },
    });
  }
}
