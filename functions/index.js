const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();
app.use(cors({ origin: 'https://claro---consumo-grafana---desa.web.app' }));

const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

const DATASET_ID = "billing_reports";
const TABLE_ID = "budget";

app.post('/pushAllBudgetsToBigQuery', async (req, res) => {
  try {
    const allBudgets = req.body;
    functions.logger.info(`Presupuestos recibidos: ${allBudgets.length} documentos.`);

    try {
      await bigquery.dataset(DATASET_ID).table(TABLE_ID).delete();
      functions.logger.info(`Tabla ${TABLE_ID} eliminada en BigQuery (full replace).`);
    } catch (err) {
      functions.logger.warn(`No se pudo borrar la tabla (quizá no existe). Error: `, err.message);
    }

    const options = {
      ignoreUnknownValues: true,
      skipInvalidRows: true,
    };
    await bigquery.dataset(DATASET_ID).table(TABLE_ID).insert(allBudgets, options);
    functions.logger.info(`Tabla ${TABLE_ID} recargada exitosamente en BigQuery.`);

    return res.status(200).json({
      message: "Datos actualizados en BigQuery!",
      total: allBudgets.length
    });
  } catch (error) {
    functions.logger.error("Error actualizando tabla en BigQuery:", error);
    return res.status(500).json({
      error: error.message || "Error desconocido"
    });
  }
});

exports.pushAllBudgetsToBigQuery = functions.https.onRequest(app);
