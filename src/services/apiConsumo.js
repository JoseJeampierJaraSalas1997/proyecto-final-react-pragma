import axios from 'axios';

export const enviarFactura = async (dataToSubmit) => {
    try {
        const response = await axios.post('https://demo.mifact.net.pe/api/invoiceService.svc/SendInvoice', dataToSubmit);
        return response.data; // Retorna la respuesta si necesitas manejarla
    } catch (error) {
        throw new Error('Error al emitir el documento: ' + error.message); // Lanza un error si falla
    }
};
