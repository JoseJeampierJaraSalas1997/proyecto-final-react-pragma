export const getInvoices = () => {
    return JSON.parse(localStorage.getItem('invoices')) || [];
};

export const addInvoice = (newDocument) => {
    const existingInvoices = getInvoices();
    console.log("Existing invoices before adding new document:", existingInvoices);

    if (!existingInvoices || existingInvoices.length === 0 || !existingInvoices[0].documentos) {
        existingInvoices[0] = { documentos: [] };
        console.log("Initialized invoices structure:", existingInvoices);
    }

    existingInvoices[0].documentos.push(newDocument);
    console.log("New document added:", newDocument);
    localStorage.setItem('invoices', JSON.stringify(existingInvoices));

    alert("Factura enviada y guardada en memoria.");
    console.log("Updated invoices after adding new document:", existingInvoices);
    return existingInvoices;
};

