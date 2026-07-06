import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getAllProducts } from '../api/productService';
import { formatCurrency } from '../utils/formatCurrency';
import './ProductList.css';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los productos. Verifica que json-server esté activo.');
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return ['all', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesTerm && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  function viewDetail(product) {
    navigate(`/products/${product.id}`);
  }

  function handleAddToCart(event, product) {
    event.stopPropagation();
    addToCart(product);
  }

  return (
    <section className="product-list">
      <HeroCarousel />

      <h1 className="product-list__title">Nuestro catálogo</h1>

      <div className="product-list__filters">
        <input
          className="product-list__search"
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="product-list__select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas las categorías' : category}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="product-list__state">Cargando productos...</p>
      ) : error ? (
        <p className="product-list__state product-list__state--error">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="product-list__state">No se encontraron productos con esos criterios.</p>
      ) : (
        <div className="product-list__grid">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="product-card"
              onClick={() => viewDetail(product)}
            >
              <img className="product-card__image" src={product.image} alt={product.name} />
              <div className="product-card__body">
                <h2 className="product-card__name">{product.name}</h2>
                <span className="product-card__category">{product.category}</span>
                <p className="product-card__price">{formatCurrency(product.price)}</p>
                <button
                  className="product-card__btn"
                  type="button"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  Añadir al carrito
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
