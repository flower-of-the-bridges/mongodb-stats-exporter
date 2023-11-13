'use strict'

const Server = require('./lib/server')

async function main(config) {
	const { MONGODB_URL, MONGODB_NAMES } = config

	const server = await new Server()
		.setup(MONGODB_URL, MONGODB_NAMES.split(','))
        
	return server.start()
}

if(require.main === module) {
	main({ ...process.env })
}

module.exports = main