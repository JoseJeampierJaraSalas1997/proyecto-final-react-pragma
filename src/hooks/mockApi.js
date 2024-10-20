const mockApi = {
    getBoletas: async () => {
      try {
        const response = await fetch('/src/components/invoices/invoice.json');
        if (!response.ok) {
          throw new Error(`Error al cargar las boletas: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Datos obtenidos:', data);
        return data.documento;
      } catch (error) {
        console.error('Error en getBoletas:', error);
        return null;
      }
    },
  };
  export default mockApi;