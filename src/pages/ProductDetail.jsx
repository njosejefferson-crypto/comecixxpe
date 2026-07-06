import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { getProductById } from '../api/productService';
import { formatCurrency } from '../utils/formatCurrency';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo encontrar el producto solicitado.');
        setLoading(false);
      });
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  }

  return (
    <section className="product-detail">
      <Link className="product-detail__back" to="/products">
        &larr; Volver al catálogo
      </Link>

      {loading ? (
        <p className="product-detail__state">Cargando producto...</p>
      ) : error ? (
        <p className="product-detail__state product-detail__state--error">{error}</p>
      ) : (
        product && (
          <div className="product-detail__card">
            <img className="product-detail__image" src={product.image} alt={product.name} />

            <div className="product-detail__info">
              <span className="product-detail__category">{product.category}</span>
              <h1 className="product-detail__name">{product.name}</h1>
              <p className="product-detail__description">{product.description}</p>
              <p className="product-detail__price">{formatCurrency(product.price)}</p>
              <p className="product-detail__stock">Stock disponible: {product.stock}</p>

              <button className="product-detail__btn" type="button" onClick={handleAddToCart}>
                Añadir al carrito
              </button>

              {addedMessage && <p className="product-detail__added">Producto añadido al carrito.</p>}
            </div>
          </div>
        )
      )}
    </section>
  );
}
