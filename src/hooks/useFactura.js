import { useState } from 'react';
import axios from 'axios';

const addDocument = async (newDocument) => {
    try {
        await axios.post('/path/to/your/invoiceEmited.json', newDocument, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("Documento agregado correctamente.");
    } catch (error) {
        console.error("Error al agregar documento:", error);
    }
};

const useFactura = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const enviarFactura = async (items, selectedQuantity, correlativoCPE = "00000031") => {
        setLoading(true);
        setError(null);

        const mappedItems = items.map(item => {
            const { 
                COD_ITEM, 
                VAL_UNIT_ITEM, 
                PRC_VTA_UNIT_ITEM, 
                MNT_IGV_ITEM, 
                TXT_DESC_ITEM, 
                VAL_VTA_ITEM 
            } = item;

            const cantidad = 1;
            const porcentajeIGV = 18;
            const valorIGV = (VAL_VTA_ITEM * porcentajeIGV) / 100;
            const precioVentaUnitario = parseFloat(VAL_VTA_ITEM) + parseFloat(valorIGV);

            return {
                "COD_ITEM": COD_ITEM,
                "COD_UNID_ITEM": "NIU",
                "CANT_UNID_ITEM": cantidad.toString(),
                "VAL_UNIT_ITEM": VAL_UNIT_ITEM.toString(),
                "PRC_VTA_UNIT_ITEM": precioVentaUnitario.toFixed(2),
                "VAL_VTA_ITEM": VAL_VTA_ITEM.toString(),
                "MNT_PV_ITEM": precioVentaUnitario.toFixed(2),
                "COD_TIP_PRC_VTA": "01",
                "COD_TIP_AFECT_IGV_ITEM":"10",
                "COD_TRIB_IGV_ITEM": "1000",
                "POR_IGV_ITEM": porcentajeIGV.toString(),
                "MNT_IGV_ITEM": valorIGV.toFixed(2),
                "TXT_DESC_ITEM": TXT_DESC_ITEM
            };
        });

        const totalGravado = mappedItems.reduce((sum, item) => sum + parseFloat(item.VAL_VTA_ITEM), 0);
        const totalIGV = mappedItems.reduce((sum, item) => sum + parseFloat(item.MNT_IGV_ITEM), 0);
        const totalVenta = totalGravado + totalIGV;

        const dataToSubmit = {
            "TOKEN": "gN8zNRBV+/FVxTLwdaZx0w==",
            "NUM_NIF_EMIS": "20100100100",
            "NOM_RZN_SOC_EMIS": "empresa demo",
            "NOM_COMER_EMIS": "mi nombre comercial es demo",
            "COD_UBI_EMIS": "103040",
            "TXT_DMCL_FISC_EMIS": "avenida abcd",
            "COD_TIP_NIF_RECP": "6",
            "NUM_NIF_RECP": "20601847834",
            "NOM_RZN_SOC_RECP": "osys company sac",
            "TXT_DMCL_FISC_RECEP": "direccion del cliente",
            "FEC_EMIS": new Date().toISOString().split('T')[0],
            "COD_TIP_CPE": "01",
            "NUM_SERIE_CPE": "F004",
            "NUM_CORRE_CPE": correlativoCPE,
            "COD_MND": "PEN",
            "TIP_CAMBIO": "1.000",
            "TXT_CORREO_ENVIO": "mifact@outlook.com",
            "COD_PRCD_CARGA": "001",
            "MNT_TOT_GRAVADO": totalGravado.toFixed(2),
            "MNT_TOT_TRIB_IGV": totalIGV.toFixed(2),
            "MNT_TOT": totalVenta.toFixed(2),
            "COD_PTO_VENTA": "jmifact",
            "ENVIAR_A_SUNAT": "true", 
            "RETORNA_XML_ENVIO": "true", 
            "RETORNA_XML_CDR": "false", 
            "RETORNA_PDF": "false", 
            "COD_FORM_IMPR": "001",
            "TXT_VERS_UBL": "2.1",
            "TXT_VERS_ESTRUCT_UBL": "2.0",
            "COD_ANEXO_EMIS": "0000",
            "COD_TIP_OPE_SUNAT": "0101",
            "NUM_PLACA": "HNT384", 
            "items": mappedItems,
            "datos_adicionales": [
                {
                    "COD_TIP_ADIC_SUNAT": "05",
                    "TXT_DESC_ADIC_SUNAT": "texto para alguna observación"
                }
            ]
        };

        try {
            const response = await axios.post('https://demo.mifact.net.pe/api/invoiceService.svc/SendInvoice', dataToSubmit);

            if (response.data.errors) {
                const errorMessage = response.data.errors;
                
                if (errorMessage.includes("documento ya existe en la BD")) {
                    console.log("Correlativo duplicado, aumentando en +10 y reintentando...");
                    const nuevoCorrelativo = (parseInt(correlativoCPE) + 10).toString().padStart(8, '0');
                    return await enviarFactura(items, selectedQuantity, nuevoCorrelativo);
                }

                setError('Error en la emisión: ' + errorMessage);
                throw new Error(errorMessage);
            }

            console.log(response);

            const newDocument = {
                "documento_identificacion": {
                    "COD_TIP_CPE": dataToSubmit.COD_TIP_CPE,
                    "NUM_SERIE_CPE": dataToSubmit.NUM_SERIE_CPE,
                    "NUM_CORRE_CPE": dataToSubmit.NUM_CORRE_CPE
                },
                "montos": {
                    "MNT_TOT_GRAVADO": totalGravado.toFixed(2),
                    "MNT_TOT_TRIB_IGV": totalIGV.toFixed(2),
                    "MNT_TOT": totalVenta.toFixed(2)
                },
                "url_boleta": response.data.url,
                "correo_envio": dataToSubmit.TXT_CORREO_ENVIO
            };

            // Agregar el nuevo documento al JSON
            await addDocument(newDocument);

            return response.data;

        } catch (err) {
            setError('Error al emitir el documento: ' + err.message);
            console.log(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { enviarFactura, loading, error };
};

export default useFactura;
