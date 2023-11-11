'use strict'

/**
 * @typedef {import('prom-client')} PromClient
 */

const labelNames = ['database']

class Metrics {

    constructor() {
        this.client = require('prom-client')
        this.client.collectDefaultMetrics()
        
        this.gauges = {}
    }

    /**
     * Create the db metrics exposed by the database
     * @param {PromClient} client 
     * @param {unknown} stats 
     * @returns 
     */
    setGaugesFromDbStats(stats) {
        this.gauges = Object.keys(stats).reduce((accumulator, key) => {
            if (typeof stats[key] === 'number') {
                accumulator[key] = new this.client.Gauge({
                    name: key,
                    help: `metric measuring ${key} value from db().stats`,
                    labelNames,
                })
            }
            return accumulator
        }, {})
    }

    /**
     * Update a gauge metric with a mongodb stat document
     * @param {unknown} stats document retrieved from mongodb
     * @param {string} database name of the database to update in client
     */
    updateGaugeWithDbStats(stats, database) {

        for (const key in stats) {
            const gaugeMetric = this.client.register.getSingleMetric(key)
            if(gaugeMetric) {
                gaugeMetric.set({ database }, stats[key])
            }
        }
    }
}






module.exports = Metrics
