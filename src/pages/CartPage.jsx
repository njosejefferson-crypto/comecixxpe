import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/formatCurrency';
import './CartPage.css';

export default function CartPage() {
  const { items, increment, decrement, removeItem, clear, totalItems, totalPrice } = useCart();

  return (
    <section className="cart-page">
      <h1 className="cart-page__title">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="cart-page__empty">
          <p>Tu carrito está vacío.</p>
          <Link className="cart-page__link" to="/products">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-page__list">
            {items.map((item) => (
              <article className="cart-item" key={item.product.id}>
                <img className="cart-item__image" src={item.product.image} alt={item.product.name} />

                <div className="cart-item__info">
                  <h2 className="cart-item__name">{item.product.name}</h2>
                  <p className="cart-item__price">{formatCurrency(item.product.price)}</p>
                </div>

                <div className="cart-item__quantity">
                  <button
                    className="cart-item__qty-btn"
                    type="button"
                    onClick={() => decrement(item.product.id)}
                  >
                    -
                  </button>
                  <span className="cart-item__qty-value">{item.quantity}</span>
                  <button
                    className="cart-item__qty-btn"
                    type="button"
                    onClick={() => increment(item.product.id)}
                  >
                    +
                  </button>
                </div>

                <p className="cart-item__subtotal">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>

                <button
                  className="cart-item__remove"
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
          </div>

          <div className="cart-page__summary">
            <button className="cart-page__clear" type="button" onClick={clear}>
              Vaciar carrito
            </button>
            <div className="cart-page__total">
              <span>{totalItems} artículo(s)</span>
              <strong>{formatCurrency(totalPrice)}</strong>
            </div>
          </div>

          <Link className="cart-page__checkout" to="/checkout">
            Pagar
          </Link>
        </>
      )}
    </section>
  );
}
