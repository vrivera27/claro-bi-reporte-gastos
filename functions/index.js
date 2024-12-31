const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const cors = require('cors')({ origin: true });
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

const DATASET_ID = "billing_reports";
const TABLE_ID = "budget";

exports.pushAllBudgetsToBigQuery = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
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

      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');

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
});
