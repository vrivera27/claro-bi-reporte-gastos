const functions = require('firebase-functions');
const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: 'claro-consumo-grafana-d',
  keyFilename: 'service-account.json'
});

exports.pushAllBudgetsToBigQuery = functions.https.onRequest(async (req, res) => {
  try {
    const allBudgets = req.body;
    console.log('* Iniciando push de Budgets a BigQuery. Total:', allBudgets.length);
    await bigquery.dataset('billing_reports').table('budget').delete();
    await bigquery.dataset('billing_reports').table('budget').insert(allBudgets);
    console.log('* Finalizado push de Budgets a BigQuery.');
    res.status(200).send('Success');
  } catch (error) {
    console.error('* Error durante el push a BigQuery:', error);
    res.status(500).send(error);
  }
});
