const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const cors = require('cors')({ origin: true });
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

const DATASET_ID = "billing_reports";
const TABLE_ID = "budget";

/**
 * EJEMPLO: Función HTTP que recibe un array de budgets desde el front-end,
 *          borra la tabla en BigQuery (full replace) y la vuelve a insertar
 */
exports.pushAllBudgetsToBigQuery = functions.https.onRequest(async (req, res) => {
  if (req.method === 'OPTIONS') {
    // Habilitar CORS para OPTIONS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  // Involucrar el middleware cors
  cors(req, res, async () => {
    try {
      const allBudgets = req.body;
      
      functions.logger.info(
        `Presupuestos recibidos: ${allBudgets.length} documentos.`
      );

      // Borramos la tabla en BigQuery (full replace)
      try {
        await bigquery.dataset(DATASET_ID).table(TABLE_ID).delete();
        functions.logger.info(`Tabla ${TABLE_ID} eliminada en BigQuery.`);
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

      return res.status(200).send({
        message: "Datos actualizados en BigQuery!",
        total: allBudgets.length,
      });
    } catch (error) {
      functions.logger.error("Error actualizando tabla en BigQuery:", error);
      return res.status(500).send({
        error: error.message || "Error desconocido"
      });
    }
  });
});
