import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { createOrder } from '../api/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import './Checkout.css';

const YAPE_PHONE = '907 744 644';

function buildYapeQrUrl(total) {
  const data = `yape:${YAPE_PHONE.replace(/\s/g, '')}:${total.toFixed(2)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`;
}

function compressImage(file, maxBase64Length = 90_000) {
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
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Checkout() {
  const { currentUser } = useAuth();
  const { items, totalPrice, clear } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [useCustomQr, setUseCustomQr] = useState(true);
  const [yapeOperationCode, setYapeOperationCode] = useState('');
  const [yapeCaptureName, setYapeCaptureName] = useState(null);
  const [yapeCaptureData, setYapeCaptureData] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  function selectPaymentMethod(method) {
    setPaymentMethod(method);
    setErrorMessage(null);
  }

  function handleCaptureSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    compressImage(file)
      .then((dataUrl) => {
        setYapeCaptureName(file.name);
        setYapeCaptureData(dataUrl);
      })
      .catch(() => setErrorMessage('No se pudo procesar la imagen. Intenta con otra captura.'));
  }

  async function confirmOrder() {
    if (items.length === 0) return;

    if (paymentMethod === 'yape') {
      if (!yapeOperationCode.trim()) {
        setErrorMessage('Ingresa el código de operación de Yape.');
        return;
      }
      if (!yapeCaptureData) {
        setErrorMessage('Adjunta la captura del pago por Yape.');
        return;
      }
    }

    setErrorMessage(null);
    setSubmitting(true);

    const order = {
      userEmail: currentUser?.email ?? '',
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total: totalPrice,
      paymentMethod,
      status: paymentMethod === 'efectivo' ? 'confirmado' : 'pendiente_verificacion',
      createdAt: new Date().toISOString(),
      ...(paymentMethod === 'yape'
        ? {
            yapeCode: yapeOperationCode.trim(),
            yapeCaptureName: yapeCaptureName ?? undefined,
            yapeCaptureData: yapeCaptureData ?? undefined,
          }
        : {}),
    };

    try {
      await createOrder(order);
      clear();
      setSuccessMessage(
        paymentMethod === 'efectivo'
          ? '¡Pedido confirmado! Paga en efectivo al recibirlo.'
          : '¡Pedido registrado! Verificaremos tu pago de Yape en breve.',
      );
      setTimeout(() => navigate('/products'), 2500);
    } catch {
      setErrorMessage('No se pudo registrar el pedido. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="checkout">
      <a className="checkout__back" href="/cart" onClick={(e) => { e.preventDefault(); navigate('/cart'); }}>
        &larr; Volver al carrito
      </a>

      <h1 className="checkout__title">Pagar pedido</h1>

      {successMessage ? (
        <div className="checkout__success">
          <p>{successMessage}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="checkout__empty">
          <p>Tu carrito está vacío.</p>
          <a className="checkout__link" href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
            Ir al catálogo
          </a>
        </div>
      ) : (
        <div className="checkout__layout">
          <div className="checkout__summary">
            <h2 className="checkout__subtitle">Resumen del pedido</h2>
            <ul className="checkout__items">
              {items.map((item) => (
                <li className="checkout__item" key={item.product.id}>
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>{formatCurrency(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="checkout__total">
              <span>Total a pagar</span>
              <strong>{formatCurrency(totalPrice)}</strong>
            </div>
          </div>

          <div className="checkout__payment">
            <h2 className="checkout__subtitle">Método de pago</h2>

            <div className="checkout__methods">
              <button
                type="button"
                className={'checkout__method' + (paymentMethod === 'efectivo' ? ' checkout__method--active' : '')}
                onClick={() => selectPaymentMethod('efectivo')}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                className={'checkout__method' + (paymentMethod === 'yape' ? ' checkout__method--active' : '')}
                onClick={() => selectPaymentMethod('yape')}
              >
                📱 Yape
              </button>
            </div>

            {paymentMethod === 'efectivo' ? (
              <div className="checkout__panel">
                <p>
                  Pagarás <strong>{formatCurrency(totalPrice)}</strong> en efectivo al recibir tu
                  pedido.
                </p>
              </div>
            ) : (
              <div className="checkout__panel checkout__panel--yape">
                {useCustomQr ? (
                  <img
                    className="yape-card__image"
                    src="yape-qr.jpg"
                    onError={() => setUseCustomQr(false)}
                    alt="Código QR de Yape"
                  />
                ) : (
                  <div className="yape-card">
                    <div className="yape-card__frame">
                      <img className="checkout__qr" src={buildYapeQrUrl(totalPrice)} alt="Código QR de Yape" />
                      <span className="yape-card__badge">S/</span>
                    </div>
                    <span className="yape-card__cta">Paga aquí con Yape</span>
                  </div>
                )}
                <p className="checkout__yape-phone">
                  Yapea al <strong>{YAPE_PHONE}</strong>
                </p>
                <p className="checkout__yape-amount">Monto: {formatCurrency(totalPrice)}</p>

                <label className="checkout__label" htmlFor="yapeCode">
                  Código de operación
                </label>
                <input
                  className="checkout__input"
                  id="yapeCode"
                  type="text"
                  placeholder="Ej. 000123456"
                  value={yapeOperationCode}
                  onChange={(e) => setYapeOperationCode(e.target.value)}
                />

                <label className="checkout__label" htmlFor="yapeCapture">
                  Captura del pago
                </label>
                <input
                  className="checkout__input checkout__input--file"
                  id="yapeCapture"
                  type="file"
                  accept="image/*"
                  onChange={handleCaptureSelected}
                />
                {yapeCaptureData && (
                  <img className="checkout__capture-preview" src={yapeCaptureData} alt="Captura del comprobante" />
                )}
              </div>
            )}

            {errorMessage && <p className="checkout__error">{errorMessage}</p>}

            <button className="checkout__confirm" type="button" disabled={submitting} onClick={confirmOrder}>
              {submitting ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
