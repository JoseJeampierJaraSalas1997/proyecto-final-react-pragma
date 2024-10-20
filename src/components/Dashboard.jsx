import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import invoiceData from '../components/invoices/invoiceEmited.json';
import { getInvoices } from '../hooks/addInvoice';

function Dashboard() {
  const [stats, setStats] = useState({ totalBoletas: 0, totalMonto: 0, datosGrafico: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [verificnadoDtos, setVerificnadoDtos] = useState([]);
  const [validator, setValidator] = useState(false)

  useEffect(() => {
    try {
      const storedInvoices = getInvoices();
      if (storedInvoices.length > 0) {
        alert("Se encontraron datos en memoria");
        console.log("local store", storedInvoices);
      }

      const documentosFromLocalStorage = storedInvoices.flatMap(invoice => invoice.documentos);
      const documentos = documentosFromLocalStorage.length > 0 ? documentosFromLocalStorage : invoiceData.documentos;

      if (documentosFromLocalStorage.length > 0) {
        setValidator(true)
      }
      setVerificnadoDtos(documentos);

      const totalBoletas = documentos.length;

      const totalMonto = documentos.reduce((acc, documento) => {
        if (documento && documento.montos) {
          const montoTotal = parseFloat(documento.montos.MNT_TOT) || 0;
          return acc + montoTotal;
        } else {
          console.warn('Montos no definidos para el documento:', documento);
          return acc; // Retorna el acumulador sin cambios
        }
      }, 0);

      // Filtrar documentos para eliminar los undefined y los vacíos
      const documentosFiltrados = documentos.filter(documento => documento && documento.documento_identificacion && documento.montos);

      const datosGrafico = documentosFiltrados.map((documento) => ({
        name: `${documento.documento_identificacion.NUM_SERIE_CPE || 'Desconocido'} ${documento.documento_identificacion.NUM_CORRE_CPE || 'Desconocido'}`,
        value: parseFloat(documento.montos.MNT_TOT) || 0,
      }));

      // Agregar la lógica para manejar documentos que no cumplen con los criterios
      const datosGraficoFinal = documentos.map((documento) => {
        if (!documento || !documento.documento_identificacion) {
          return {
            name: 'F004',
            value: 0
          };
        }

        return {
          name: `${documento.documento_identificacion.NUM_SERIE_CPE || 'Desconocido'} ${documento.documento_identificacion.NUM_CORRE_CPE || 'Desconocido'}`,
          value: documento.montos ? parseFloat(documento.montos.MNT_TOT) : 0,
        };
      });

      setStats({ totalBoletas, totalMonto, datosGrafico: datosGraficoFinal });
      setLoading(false);
    } catch (err) {
      console.error('Error processing invoice data:', err);
      setError('Error al procesar los datos de las boletas');
      setLoading(false);
    }
  }, []);


  const filteredDocuments = invoiceData.documentos.filter(documento =>
    documento.documento_identificacion?.NUM_SERIE_CPE?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentDocuments = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
  let allCurrentDoc
  if (validator == true) {
     allCurrentDoc = [...currentDocuments, ...verificnadoDtos].filter(documento => documento);
  }else{
     allCurrentDoc = [...currentDocuments].filter(documento => documento);
  }
  
  const allCurrentDocuments = allCurrentDoc;

  console.log("Emision de factura: ", allCurrentDocuments); // Muestra todos los documentos actuales y los combinados

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredDocuments.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"><span className="sr-only">Cargando...</span></div></div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h1 className="card-title text-center mb-4">Dashboard</h1>

          {/* Resumen de boletas */}
          <div className="row text-center mb-4">
            <div className="col-md-6">
              <div className="card bg-light p-3">
                <h5>Total Boletas Emitidas</h5>
                <p className="display-4">{stats.totalBoletas}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-light p-3">
                <h5>Monto Total</h5>
                <p className="display-4">S/ {stats.totalMonto.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title text-center mb-3">Datos de Boletas</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.datosGrafico}>
                      <XAxis dataKey="name" textAnchor="middle" style={{ fontSize: '12px' }} dy={10} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          <br />

          {/* Buscador */}
          <div className="row mb-4">
            <div className="col-md-12">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número de serie"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Boletas */}
          <div className="row">
            {allCurrentDocuments.map((documento, index) => (
              <div className="col-md-6 mb-3" key={index}>
                <div className="card">
                  <div className="card-body">
                  Boleta: {
                      documento.documento_identificacion
                        ? (documento.documento_identificacion.NUM_SERIE_CPE === "0000"
                            ? documento.documento_identificacion.NUM_CORRE_CPE
                            : documento.documento_identificacion.NUM_SERIE_CPE)
                        : 'Desconocido'
                    }
                    <p><strong>Monto Total:</strong> S/ {documento.montos ? parseFloat(documento.montos.MNT_TOT).toFixed(2) : '0.00'}</p>
                    <p><strong>Enviado a:</strong> {documento.correo_envio || 'No definido'}</p>
                    <a 
                      href={documento.url_boleta} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                    >
                      Ver Detalle
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button onClick={() => paginate(currentPage - 1)} className="page-link">Anterior</button>
            </li>
            {pageNumbers.map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button onClick={() => paginate(number)} className="page-link">{number}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
              <button onClick={() => paginate(currentPage + 1)} className="page-link">Siguiente</button>
            </li>
          </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
