/**
 * @param {{ [name: string]: import('mongodb').Db }} databaseClients 
 * @param {import('./../lib/metrics')} metrics
 * @param {string[]} databaseNames
 */
module.exports.getDbStatsHandler = function(databaseClients, metrics, databaseNames) {
    /**
     *
     * @param {import('fastify').FastifyRequest} request 
     * @param {import('fastify').FastifyReply} reply 
     */
    const handler = async (request, reply) => {
        const { log } = request

        try {
          for (const mongoDbDatabase of databaseNames) {
            const { db: mongoDbClient } = databaseClients[mongoDbDatabase]
            const dbStats = await mongoDbClient.stats()
            metrics.updateGaugeWithDbStats(dbStats, mongoDbDatabase)
          }
    
          const metricStrings = await metrics.client.register.metrics()
          return reply.code(200).header('Content-Type', metrics.client.contentType).send(metricStrings)
        } catch(err) {
          log.error({ err }, 'received error')
          return reply.code(500).send('Internal Server Error.')
        }
    }

    return handler
}
