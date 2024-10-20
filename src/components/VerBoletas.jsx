import React, { useState, useEffect } from 'react';
import mockApi from '../hooks/mockApi';
import './VerBoletas.css';

function VerBoletas() {
  const [boleta, setBoleta] = useState(null);
  const [detalleBoleta, setDetalleBoleta] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);

  useEffect(() => {
    mockApi.getBoletas()
      .then(response => {
        console.log('Respuesta de boletas:', response);
        setBoleta(response);
        setDetalleBoleta(response);
      })
      .catch(error => console.error('Error fetching boletas:', error));
  }, []);

  const handleToggleDetalle = () => {
    setShowDetalle(!showDetalle);
  };
  
  return (
    <div>
      <h1>Boleta Emitida</h1>
      {boleta && (
        <div style={{ cursor: 'pointer' }}>
          <table className="boleta-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{boleta.receptor.NOM_RZN_SOC_RECP}</td>
                <td>{boleta.montos.MNT_TOT}</td>
                <td>{boleta.emision.FEC_EMIS}</td>
                <td>
                    <button className="buttondetail" onClick={() => handleToggleDetalle(boleta)}>
                    {showDetalle && detalleBoleta === boleta ? 'Ocultar' : 'Detalles'}
                    </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {showDetalle && detalleBoleta && (
        <div className="detalle-boleta">
          <h2>Detalle de la Boleta</h2>
          <table className="detalle-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{detalleBoleta.receptor.NOM_RZN_SOC_RECP}</td>
                <td>{detalleBoleta.montos.MNT_TOT}</td>
                <td>{detalleBoleta.emision.FEC_EMIS}</td>
              </tr>
            </tbody>
          </table>
          <h3>Items:</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Monto Bruto</th>
              </tr>
            </thead>
            <tbody>
              {detalleBoleta.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.TXT_DESC_ITEM}</td>
                  <td>{item.CANT_UNID_ITEM}</td>
                  <td>{item.PRC_VTA_UNIT_ITEM}</td>
                  <td>{item.MNT_BRUTO}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VerBoletas;
