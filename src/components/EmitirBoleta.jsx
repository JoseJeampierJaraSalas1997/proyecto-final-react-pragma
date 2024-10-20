import React, { useState, useEffect } from 'react';
import { predefinedItems } from './invoices/items-invoice';
import './EmitirDocumento.css';
import useFactura from '../hooks/useFactura'
import {addInvoice} from '../hooks/addInvoice'


const EmitirDocumento = () => {
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [itemDetails, setItemDetails] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [igvAmount, setIgvAmount] = useState(0);
  const [priceWithoutIgv, setPriceWithoutIgv] = useState(0);
  const { enviarFactura, loading, error } = useFactura();

  useEffect(() => {
    if (itemDetails) {
      const calculatedTotalPrice = (itemDetails.PRC_VTA_UNIT_ITEM * selectedQuantity).toFixed(2);
      const calculatedIgvAmount = (calculatedTotalPrice * (itemDetails.POR_IGV_ITEM / 100)).toFixed(2);
      const calculatedPriceWithoutIgv = (calculatedTotalPrice - calculatedIgvAmount).toFixed(2);

      setTotalPrice(calculatedTotalPrice);
      setIgvAmount(calculatedIgvAmount);
      setPriceWithoutIgv(calculatedPriceWithoutIgv);
    }
  }, [selectedQuantity, itemDetails]);

  const handleAddItem = () => {
    if (itemDetails) {
      const newItem = {
        ...itemDetails,
        CANT_UNID_ITEM: selectedQuantity,
        TOTAL: totalPrice,
      };
      setItems([...items, newItem]);
      setSelectedItem('');
      setSelectedQuantity(1);
      setItemDetails(null);
      setTotalPrice(0);
      setIgvAmount(0);
      setPriceWithoutIgv(0);
    }
  };

 

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const result = await enviarFactura(items, selectedQuantity);
          console.log(result);

          if (result.errors) {
              alert("Hubo un error al enviar la factura: " + result.errors);
          } else {
              const { cadena_para_codigo_qr, correlativo_cpe, url, estado_documento } = result;
              console.log(result);
              
              window.open(url, '_blank');
              alert(`Factura ${correlativo_cpe} enviada con éxito. Estado: ${estado_documento}`);
              const newDocument = {
                "documento_identificacion": {
                    "COD_TIP_CPE": "03",
                    "NUM_SERIE_CPE": correlativo_cpe.substring(0, 4),
                    "NUM_CORRE_CPE": 'F004'
                },
                "montos": {
                    "MNT_TOT_GRAVADO": "2000.00",
                    "MNT_TOT_TRIB_IGV": "360.00",
                    "MNT_TOT": "2360.00"
                },
                "url_boleta": url,
                "correo_envio": "cliente@outlook.com"
            };
            addInvoice(newDocument);
              window.location.href = "http://localhost:5173";
          }
      } catch (err) {
          console.error(err);
          alert("Ocurrió un error inesperado al enviar la factura.");
      }
  };



  const handleItemChange = (e) => {
    const selectedItemValue = e.target.value;
    setSelectedItem(selectedItemValue);

    const selectedItemDetails = predefinedItems.find(item => item.COD_ITEM === selectedItemValue);
    setItemDetails(selectedItemDetails);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Emitir Documento</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Seleccionar ítem:</label>
          <select
            className="form-select"
            value={selectedItem}
            onChange={handleItemChange}
          >
            <option value="">Seleccione un ítem</option>
            {predefinedItems.map((item, index) => (
              <option key={index} value={item.COD_ITEM}>
                {item.TXT_DESC_ITEM} - {item.VAL_UNIT_ITEM}
              </option>
            ))}
          </select>
        </div>

        {itemDetails && (
          <div className="border p-3 mb-3">
            <h4>Detalles del Producto:</h4>
            <div className="row">
              <div className="col-md-4 mb-2">
                <label className="form-label">Descripción:</label>
                <input
                  type="text"
                  className="form-control"
                  value={itemDetails.TXT_DESC_ITEM}
                  readOnly
                />
              </div>
              <div className="col-md-4 mb-2">
                <label className="form-label">Precio Unitario:</label>
                <input
                  type="number"
                  className="form-control"
                  value={itemDetails.PRC_VTA_UNIT_ITEM}
                  readOnly
                />
              </div>
              <div className="col-md-4 mb-2">
                <label className="form-label">IGV (%):</label>
                <input
                  type="text"
                  className="form-control"
                  value={itemDetails.POR_IGV_ITEM}
                  readOnly
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 mb-2">
                <label className="form-label">Precio sin IGV:</label>
                <input
                  type="number"
                  className="form-control"
                  value={priceWithoutIgv}
                  readOnly
                />
              </div>
              <div className="col-md-4 mb-2">
                <label className="form-label">Precio + IGV:</label>
                <input
                  type="number"
                  className="form-control"
                  value={totalPrice}
                  readOnly
                />
              </div>
              <div className="col-md-4 mb-2">
                <label className="form-label">Cantidad:</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedQuantity}
                  min="1"
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-2">
                <label className="form-label">Total IGV:</label>
                <input
                  type="number"
                  className="form-control"
                  value={igvAmount}
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary mb-3"
          onClick={handleAddItem}
          disabled={!itemDetails}
        >
          Agregar Ítem
        </button>

        <div className="mb-3">
          <h3>Ítems Agregados</h3>
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center border p-2 my-1">
                <p className="mb-0">{item.TXT_DESC_ITEM} - Cantidad: {item.CANT_UNID_ITEM} - Total: S/. {item.TOTAL}</p>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                  const newItems = items.filter((_, i) => i !== index);
                  setItems(newItems);
                }}>
                  Eliminar
                </button>
              </div>
            ))
          ) : (
            <p>No hay ítems agregados.</p>
          )}
        </div>
        <button type="submit" className="btn btn-success">
          Emitir Documento
        </button>
      </form>
    </div>
  );
};

export default EmitirDocumento;
