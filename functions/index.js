const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const cors = require('cors')({ origin: true });
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

const DATASET_ID = "billing_reports";
const TABLE_ID = "budget";

exports.pushAllBudgetsToBigQuery = functions.https.onRequest((req, res) => {
  // Usamos cors(...) directamente en el callback,
  // sin hacer el bloque if (req.method === 'OPTIONS')...
  return cors(req, res, async () => {
    try {
      // Este array es el que envías desde fetch(...)
      const allBudgets = req.body;

      functions.logger.info(
        `Presupuestos recibidos: ${allBudgets.length} documentos.`
      );

      // Borramos la tabla en BigQuery (full replace)
      try {
        await bigquery.dataset(DATASET_ID).table(TABLE_ID).delete();
        functions.logger.info(`Tabla ${TABLE_ID} eliminada en BigQuery (full replace).`);
      } catch (err) {
        functions.logger.warn(
          `No se pudo borrar la tabla (quizá no existe). Error: `,
          err.message
        );
      }

      // Insertamos nuevamente
      const options = {
        ignoreUnknownValues: true,
        skipInvalidRows: true,
      };
      await bigquery.dataset(DATASET_ID).table(TABLE_ID).insert(allBudgets, options);
      functions.logger.info(`Tabla ${TABLE_ID} recargada exitosamente en BigQuery.`);

      // Devuelve OK (200)
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
