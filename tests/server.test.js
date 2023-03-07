const { MongoClient } = require('mongodb')
const tap = require('tap')
const { GenericContainer } = require('testcontainers')
const server = require('./../server')
const mocks = require('./mocks')
const parsePrometheusTextFormat = require('parse-prometheus-text-format')

tap.test('server', async test => {
    const mongoContainer = await new GenericContainer('mongo:4.4')
        .withExposedPorts(27017)
        .start()

    const mongoUri = `mongodb://${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}`

    const mongoClient = new MongoClient(mongoUri)
    await mongoClient.connect()

    const dbName = `db-stats-exporter-${Date.now()}`
    const mongoDbClient = mongoClient.db(dbName)

    for(const mock of mocks) {
        await mongoDbClient.collection(mock.name).insertMany(Array.from({length: mock.length}, () => mock.generator()))
    }

    const fastify = await server(mongoUri, [dbName])

    test.teardown(async () => {
        await fastify.close()
        await mongoContainer.stop()
        await mongoClient.close()
    })

    test.test('/-/metrics', async t => {
        t.test('ok', async assert => {
            const { payload, statusCode } = await fastify.inject({
                method: 'GET',
                path: '/-/metrics'
            })
            
            const parsedPrometheusMetrics = parsePrometheusTextFormat(payload)
            const metrics = parsedPrometheusMetrics.filter(metric => metric.name === 'objects')
            const objectsMetric = metrics.find(metric => metric.name === 'objects')

            for(const mock of mocks) {
                const mockDbRecords = await mongoDbClient.collection(mock.name).find({}).toArray()
                const objectsMetricDbValue = objectsMetric.metrics.find(metric => metric.labels.database === dbName)
                assert.strictSame(mockDbRecords.length, Number(objectsMetricDbValue.value))
            } 

            assert.strictSame(statusCode, 200)
        })
    })

})