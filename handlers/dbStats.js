const ALLOWED_CONTENT_TYPES = ['*/*', 'text/plain', 'application/json']
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
		const { log, headers } = request

		try {
			for (const mongoDbDatabase of databaseNames) {
				const { db: mongoDbClient } = databaseClients[mongoDbDatabase]
				const dbStats = await mongoDbClient.stats()
				metrics.updateGaugeWithDbStats(dbStats, mongoDbDatabase)
			}
    
			const { accept } = headers

			if(accept && ALLOWED_CONTENT_TYPES.filter(contentType => accept.includes(contentType)).length === 0) {
				log.warn({ accept }, 'response content type not supported by the client.')
				return reply.status(403).send()
			}
			const { register, contentType } = await metrics.getRegister({ 
				json: accept?.includes('application/json') 
			})
			return reply.code(200).header('Content-Type', contentType).send(register)
		} catch(err) {
			log.error({ err }, 'received error')
			return reply.code(500).send('Internal Server Error.')
		}
	}

	return handler
}
