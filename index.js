// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const { create } = require('ipfs-http-client');

const ipfs = create('http://ipfs_host:5001');

// Declare a route
fastify.get('/', async (request, reply) => {
    return JSON.stringify(await ipfs.pubsub.ls())
})

fastify.post('/:id', async (request, reply) => {
    let channel = `__openpubsubnetwork.${request.params.id}`

    // Add body to IPFS.
    let output = await ipfs.add(Buffer.from(JSON.stringify(request.body)));

    // And publish on our channel
    await ipfs.pubsub.publish(`__openpubsubnetwork.addChannel`, channel);
    await ipfs.pubsub.publish(`__openpubsubnetwork.pin`, output.path);
    await ipfs.pubsub.publish(channel, output.path);
    return {}
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(80, '0.0.0.0')
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()
