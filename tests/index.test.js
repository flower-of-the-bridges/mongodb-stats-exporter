'use strict'

const tap = require('tap')
const util = require('util')
const exec = util.promisify(require('child_process').execFile)
const index = require('./../index')

tap.test('index', async test => {
	test.test('fail if wrong config is provided', async t => {
		try {
			await index({ MONGODB_URL: 'invalid-url', MONGODB_NAMES: 'invalid-name' })
			t.fail('test should fail')
		}
		catch (error) {
			t.ok(error)
		}
	})

	test.test('fail from command line', async t => {
		try {
			await exec('node', ['./index.js'])
			t.fail('application should fail')
		}
		catch(error) {
			t.ok(error)
		}
	})
})
