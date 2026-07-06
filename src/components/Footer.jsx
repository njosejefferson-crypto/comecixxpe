import { useState } from 'react';
import './Footer.css';

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__row">
        <span className="footer__brand">🍗 ComeCix</span>
        <span className="footer__copy">
          © {year} ComeCix. Proyecto académico, no afiliado a KFC, Popeyes ni Pizza Hut.
        </span>
        <button className="footer__link" type="button" onClick={() => setShowTerms((v) => !v)}>
          Términos y condiciones
        </button>
      </div>

      {showTerms && (
        <div className="footer__terms">
          <h3 className="footer__terms-title">Términos y condiciones</h3>
          <ol className="footer__terms-list">
            <li>
              ComeCix es una aplicación demostrativa desarrollada con fines académicos; los
              productos, precios y marcas mostrados son referenciales.
            </li>
            <li>
              Los pagos en efectivo se abonan directamente al recibir el pedido; los pagos por
              Yape requieren código de operación y captura de pantalla como comprobante.
            </li>
            <li>
              El pedido queda registrado como "pendiente de verificación" hasta confirmar el pago
              por Yape.
            </li>
            <li>
              La sesión del usuario se guarda localmente en el navegador (localStorage) y puede
              cerrarse en cualquier momento.
            </li>
            <li>ComeCix no almacena datos de tarjetas ni comparte tu información con terceros.</li>
          </ol>
          <button className="footer__link" type="button" onClick={() => setShowTerms(false)}>
            Cerrar
          </button>
        </div>
      )}
    </footer>
  );
}
