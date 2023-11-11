'use strict'

const { getDbStatsHandler } = require('../handlers/dbStats')
const Metrics = require('./metrics')

const fastify = require('fastify')({ logger: true })

class Server {
  constructor(dbUri, databases) {
    this.fastify = fastify
    this.metrics = new Metrics()
    this.databases = [...databases]
    this.dbUri = dbUri
  }

  async setup() {
    for (const [index, mongoDbDatabase] of this.databases.entries()) {

      await this.fastify.register(require('@fastify/mongodb'), {
        forceClose: true,
        url: this.dbUri,
        name: mongoDbDatabase,
        database: mongoDbDatabase
      })
  
      if (index === 0) {
        this.metrics.setGaugesFromDbStats(this.metrics, await fastify.mongo[mongoDbDatabase].db.stats())
      }
    }
    return this
  }

  async start() {

    this.fastify.get('/-/metrics', getDbStatsHandler(this.fastify.mongo, this.metrics, this.databases))
    await this.fastify.listen({ port: 3000 })
    return this
  }  
}


module.exports = Server
