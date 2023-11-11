'use strict'

const { getClient, createGaugeMetricsFromDbStats, updateGaugeMetricsWithDbStats } = require('./lib/prometheus')

const fastify = require('fastify')({ logger: true })
const client = getClient()
/**
 * 
 * @returns {fastify}
 */
const start = async function(mongoDbUri, mongoDbDatabases) {

  for (const [index, mongoDbDatabase] of mongoDbDatabases.entries()) {

    await fastify.register(require('@fastify/mongodb'), {
      forceClose: true,
      url: mongoDbUri,
      name: mongoDbDatabase,
      database: mongoDbDatabase
    })

    if (index === 0) {
      createGaugeMetricsFromDbStats(client, await fastify.mongo[mongoDbDatabase].db.stats())
    }
  }

  fastify.get('/-/metrics', async (request, reply) => {

    for (const mongoDbDatabase of mongoDbDatabases) {
      const { db: mongoDbClient } = fastify.mongo[mongoDbDatabase]
      const dbStats = await mongoDbClient.stats()
      updateGaugeMetricsWithDbStats(client, dbStats, mongoDbDatabase)
    }

    const metrics = await client.register.metrics()
    return reply.code(200).header('Content-Type', client.contentType).send(metrics)
  })

  await fastify.listen({ port: 3000 })
  return fastify
}

module.exports = start