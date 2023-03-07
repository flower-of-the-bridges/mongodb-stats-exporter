'use strict'

const client = require('prom-client')

function getClient() {
    client.collectDefaultMetrics()
    return client
}

function createGaugeMetricsFromDbStats(client, stats) {

    const statKeys = Object.keys(stats)
    const gaugeMetrics = statKeys.reduce((accumulator, key) => {
        if (typeof stats[key] === 'number') {
            accumulator[key] = new client.Gauge({
                name: key,
                help: `metric measuring ${key} value from database stats.`,
                labelNames: ['database']
            })
        }
        return accumulator
    }, {})

    return gaugeMetrics
}

function updateGaugeMetricsWithDbStats(client, stats, database) {

    const statKeys = Object.keys(stats)
    for (const key of statKeys) {
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
