import { Worker } from 'bullmq'
import { getKnowledgeQueueEvents } from '@/lib/queues/connection'
import { processIngestJob } from '@/lib/queues/knowledge-ingest-queue'

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

async function main() {
  const worker = new Worker('knowledge-ingest', processIngestJob, { connection: { url: redisUrl } })
  worker.on('completed', (job) => {
    console.log(`[completed] job=${job.id}`)
  })
  worker.on('failed', (job, err) => {
    console.error(`[failed] job=${job?.id} err=${err?.message}`)
  })

  const events = getKnowledgeQueueEvents()
  events.on('completed', ({ jobId, returnvalue }) => {
    console.log(`[events.completed] job=${jobId}`)
  })
  events.on('failed', ({ jobId, failedReason }) => {
    console.error(`[events.failed] job=${jobId} reason=${failedReason}`)
  })
}

main().catch((e) => { console.error(e); process.exit(1) })

