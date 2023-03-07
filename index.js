'use strict'

const server = require('./server')

async function main(config) {
    const { MONGODB_URL, MONGODB_NAMES } = config
    await server(MONGODB_URL, MONGODB_NAMES.split(','))
}

if(require.main === module) {
    main(process.env)
}

module.exports = main