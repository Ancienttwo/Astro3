import { getKnowledgeQueue, getKnowledgeQueueEvents } from './connection'
import { ingestNotion, NotionIngestOptions } from '@/lib/connectors/notion'
import { ingestDrive, DriveIngestOptions } from '@/lib/connectors/drive'

export type IngestJobData =
  | { type: 'notion'; options: NotionIngestOptions }
  | { type: 'drive'; options: DriveIngestOptions }

export async function enqueueIngestJob(data: IngestJobData) {
  const queue = await getKnowledgeQueue()
  const job = await queue.add(data.type, data, { removeOnComplete: true, removeOnFail: false })
  return job.id as string
}

// Worker processor (used by scripts/knowledge-worker.ts)
export async function processIngestJob(job: any) {
  const data = job.data
  if (data.type === 'notion') {
    await job.updateProgress({ stage: 'start', type: 'notion' })
    const res = await ingestNotion({ ...data.options })
    await job.updateProgress({ stage: 'done', ...res })
    return res
  }
  if (data.type === 'drive') {
    await job.updateProgress({ stage: 'start', type: 'drive' })
    const res = await ingestDrive({ ...data.options })
    await job.updateProgress({ stage: 'done', ...res })
    return res
  }
  throw new Error(`Unknown job type: ${(data as any).type}`)
}
