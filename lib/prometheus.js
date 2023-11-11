'use strict'

/**
 * @typedef {import('prom-client')} PromClient
 */

const client = require('prom-client')
const labelNames = ['database']

/**
 * Returns default prometheus client
 * @returns {PromClient}
 */
function getClient() {
    client.collectDefaultMetrics()
    return client
}

/**
 * Create the db metrics exposed by the database
 * @param {PromClient} client 
 * @param {unknown} stats 
 * @returns 
 */
function createGaugeMetricsFromDbStats(client, stats) {
    const gaugeMetrics = Object.keys(stats).reduce((accumulator, key) => {
        if (typeof stats[key] === 'number') {
            accumulator[key] = new client.Gauge({
                name: key,
                help: `metric measuring ${key} value from db().stats`,
                labelNames,
            })
        }
        return accumulator
    }, {})

    return gaugeMetrics
}

/**
 * Update a gauge metric with a mongodb stat document
 * @param {PromClient} client prom client
 * @param {unknown} stats document retrieved from mongodb
 * @param {string} database name of the database to update in client
 */
function updateGaugeMetricsWithDbStats(client, stats, database) {

    for (const key in stats) {
        const gaugeMetric = client.register.getSingleMetric(key)
        if(gaugeMetric) {
            gaugeMetric.set({ database }, stats[key])
        }
    }
}

module.exports = {
    getClient,
    createGaugeMetricsFromDbStats,
    updateGaugeMetricsWithDbStats
} 
