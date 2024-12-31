const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();

// Asegúrate de usar aquí el dominio de tu hosting
app.use(cors({ origin: 'https://claro---consumo-grafana---desa.web.app' }));

const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery({
  projectId: 'claro-consumo-grafana-d',
  keyFilename: 'service-account.json'
});

const DATASET_ID = "billing_reports";
const TABLE_ID = "budget";

// Manejo de CORS para las peticiones
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', 'https://claro---consumo-grafana---desa.web.app');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  next();
});

/**
 * Este es nuestro endpoint principal: POST /
 * Aquí recibimos los "Budgets" del front-end y los escribimos en BigQuery.
 */
app.post('/', async (req, res) => {
  try {
    const allBudgets = req.body;
    functions.logger.info(`Presupuestos recibidos: ${allBudgets.length} documentos.`);

    // 1. Borramos la tabla para hacer "full replace"
    try {
      await bigquery.dataset(DATASET_ID).table(TABLE_ID).delete();
      functions.logger.info(`Tabla ${TABLE_ID} eliminada en BigQuery (full replace).`);
    } catch (err) {
      functions.logger.warn(`No se pudo borrar la tabla (quizá no existe). Error: `, err.message);
    }

    // 2. Insertamos todos los registros nuevamente
    const options = {
      ignoreUnknownValues: true,
      skipInvalidRows: true,
    };
    await bigquery.dataset(DATASET_ID).table(TABLE_ID).insert(allBudgets, options);
    functions.logger.info(`Tabla ${TABLE_ID} recargada exitosamente en BigQuery.`);

    // 3. Respondemos OK
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

// Exportamos la Cloud Function. 
// La ruta base será algo como: 
//   https://us-central1-[TU_PROYECTO].cloudfunctions.net/pushAllBudgetsToBigQuery
exports.pushAllBudgetsToBigQuery = functions.https.onRequest(app);
