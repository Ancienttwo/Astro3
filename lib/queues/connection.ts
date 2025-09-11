const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const connection = { url: redisUrl }

let queueSingleton: any = null
let eventsSingleton: any = null

async function getBullMQ() {
  // Lazy import to avoid build-time dependency
  const mod = await (eval('import'))('bullmq')
  return mod
}

export async function getKnowledgeQueue() {
  if (!queueSingleton) {
    const { Queue } = await getBullMQ()
    queueSingleton = new Queue('knowledge-ingest', { connection })
  }
  return queueSingleton
}

export async function getKnowledgeQueueEvents() {
  if (!eventsSingleton) {
    const { QueueEvents } = await getBullMQ()
    eventsSingleton = new QueueEvents('knowledge-ingest', { connection })
  }
  return eventsSingleton
}
