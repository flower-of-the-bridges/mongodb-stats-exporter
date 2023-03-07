'use strict'

const fastify = require('fastify')({ logger: true })
const client = require('prom-client')
client.collectDefaultMetrics()

/**
 * 
 * @returns {fastify}
 */
const start = async (mongoDbUri, mongoDbDatabases, mongoDbCollections) => {
  const objectsGauge = new client.Gauge({
    name: 'objects',
    help: 'metric_help',
    labelNames: ['database']
  })
  try {
    for (const mongoDbDatabase of mongoDbDatabases) {
      await fastify.register(require('@fastify/mongodb'), {
        forceClose: true,
        url: mongoDbUri,
        name: mongoDbDatabase,
        database: mongoDbDatabase
      })

    }

    fastify.get('/-/metrics', async (request, reply) => {

      for await (const mongoDbDatabase of mongoDbDatabases) {
        const { db: mongoDbClient } = fastify.mongo[mongoDbDatabase]
        const dbStats = await mongoDbClient.stats()
        console.log(dbStats)
        objectsGauge.set({ database: mongoDbDatabase }, dbStats.objects)
      }

      const metrics = await client.register.metrics()

      return reply.code(200).header('Content-Type', client.contentType).send(metrics)
    })

    await fastify.listen({ port: 3000 })
    return fastify
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

module.exports = start