"use client"

import React, { useState } from 'react'

export default function KnowledgeIngestPage() {
  const [category, setCategory] = useState('bazi')
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState('')
  const [metadata, setMetadata] = useState('{}')
  const [tags, setTags] = useState('')
  const [reembedSource, setReembedSource] = useState('')
  const [reembedCategory, setReembedCategory] = useState('')
  const [dedupeSource, setDedupeSource] = useState('')
  // Enqueue & Stream state
  const [notionDb, setNotionDb] = useState('')
  const [notionPages, setNotionPages] = useState('')
  const [notionTagProp, setNotionTagProp] = useState('')
  const [notionCatProp, setNotionCatProp] = useState('')
  const [notionOverrideCat, setNotionOverrideCat] = useState(false)
  const [driveFolder, setDriveFolder] = useState('')
  const [driveFiles, setDriveFiles] = useState('')
  const [jobLog, setJobLog] = useState('')
  const [jobId, setJobId] = useState('')
  const [jobState, setJobState] = useState('')
  const [jobList, setJobList] = useState<any[]>([])
  const [jobListState, setJobListState] = useState<'all'|'waiting'|'active'|'delayed'|'completed'|'failed'|'paused'>('all')
  const [jobListType, setJobListType] = useState<'all'|'notion'|'drive'>('all')
  const [notionConcurrency, setNotionConcurrency] = useState<number | ''>('' as any)
  const [notionPageSize, setNotionPageSize] = useState<number | ''>('' as any)
  const [driveConcurrency, setDriveConcurrency] = useState<number | ''>('' as any)
  let esRef: EventSource | null = null
  const [textInput, setTextInput] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [searchRes, setSearchRes] = useState<any[]>([])
  const [log, setLog] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<any | null>(null)
  const [maxChars, setMaxChars] = useState(2800)
  const [overlapChars, setOverlapChars] = useState(120)
  const [minChars, setMinChars] = useState(200)
  const [removeHeadersFooters, setRemoveHeadersFooters] = useState(true)

  const appendLog = (s: string) => setLog(prev => prev + (prev ? "\n" : '') + s)

  async function uploadFile() {
    if (!file) { appendLog('请选择文件'); return }
    setBusy(true)
    setLog('')
    try {
      const fd = new FormData()
      fd.set('file', file)
      fd.set('category', category)
      if (source) fd.set('source', source)
      if (metadata) fd.set('metadata', metadata)
      const res = await fetch('/api/knowledge/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '导入失败')
      appendLog(`导入成功: ${JSON.stringify(data.data)}`)
    } catch (e: any) {
      appendLog(`导入失败: ${e.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  async function importText() {
    if (!textInput.trim()) { appendLog('请输入文本'); return }
    setBusy(true)
    setLog('')
    try {
      const res = await fetch('/api/knowledge/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content: textInput, metadata: JSON.parse(metadata || '{}') })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '导入失败')
      appendLog(`导入成功: ${JSON.stringify(data.data)}`)
    } catch (e: any) {
      appendLog(`导入失败: ${e.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  async function doSearch() {
    if (!searchQ.trim()) { appendLog('请输入搜索词'); return }
    setBusy(true)
    setLog('')
    try {
      const u = new URL('/api/knowledge/search', window.location.origin)
      u.searchParams.set('q', searchQ)
      u.searchParams.set('category', category)
      u.searchParams.set('limit', '5')
      if (tags.trim()) u.searchParams.set('tags', tags.split(',').map(s => s.trim()).filter(Boolean).join(','))
      const res = await fetch(u.toString())
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '搜索失败')
      setSearchRes(data.data || [])
      appendLog('搜索完成')
    } catch (e: any) {
      appendLog(`搜索失败: ${e.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  async function previewChunks() {
    setBusy(true)
    setLog('')
    setPreview(null)
    try {
      let res: Response
      if (file) {
        const fd = new FormData()
        fd.set('file', file)
        fd.set('mode', 'auto')
        fd.set('maxChars', String(maxChars))
        fd.set('overlapChars', String(overlapChars))
        fd.set('minChars', String(minChars))
        fd.set('removeHeadersFooters', String(removeHeadersFooters))
        res = await fetch('/api/knowledge/preview-chunks', { method: 'POST', body: fd })
      } else if (textInput.trim()) {
        res = await fetch('/api/knowledge/preview-chunks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textInput, maxChars, overlapChars, minChars, removeHeadersFooters })
        })
      } else {
        appendLog('请选择文件或输入文本进行预览')
        setBusy(false)
        return
      }
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '预览失败')
      setPreview(data.data)
      appendLog(`预览完成：chunks=${data.data.chunkCount}, tokens≈${data.data.totalTokens}`)
    } catch (e: any) {
      appendLog(`预览失败: ${e.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  async function doReembed(selector: 'source' | 'category' | 'all') {
    setBusy(true)
    setLog('')
    try {
      const payload: any = {}
      if (selector === 'source') payload.source = reembedSource.trim()
      if (selector === 'category') payload.category = reembedCategory.trim()
      if (selector === 'all') payload.all = true
      const res = await fetch('/api/knowledge/reembed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '重嵌入失败')
      appendLog(`重嵌入完成: ${JSON.stringify(data.data)}`)
    } catch (e: any) {
      appendLog(`重嵌入失败: ${e.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  async function doDedupe() {
    setBusy(true)
    setLog('')
    try {
      const res = await fetch('/api/knowledge/dedupe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: dedupeSource.trim() }) })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '去重失败')
      appendLog(`去重完成: ${JSON.stringify(data.data)}`)
    } catch (e: any) {
      appendLog(`去重失败: ${e.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  async function deleteBySource() {
    setBusy(true)
    setLog('')
    try {
      const u = new URL('/api/knowledge/by-source', window.location.origin)
      u.searchParams.set('source', dedupeSource.trim())
      const res = await fetch(u.toString(), { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '删除失败')
      appendLog(`删除完成: ${JSON.stringify(data.data)}`)
    } catch (e: any) {
      appendLog(`删除失败: ${e.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">知识导入后台</h1>
      <div className="space-y-3">
        <label className="block text-sm">分类</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded p-2">
          <option value="bazi">bazi</option>
          <option value="ziwei">ziwei</option>
          <option value="guandi">guandi</option>
          <option value="general">general</option>
        </select>
      </div>

      <section className="p-4 border rounded space-y-3">
        <h2 className="font-semibold">文件上传（PDF/TXT）</h2>
        <input type="file" accept=".pdf,.txt" onChange={e => setFile(e.target.files?.[0] || null)} />
        <input placeholder="source(可选)" value={source} onChange={e => setSource(e.target.value)} className="border rounded p-2 w-full" />
        <textarea placeholder="metadata(JSON)" value={metadata} onChange={e => setMetadata(e.target.value)} className="border rounded p-2 w-full h-24" />
        <div className="flex gap-2 flex-wrap">
          <button disabled={busy} onClick={uploadFile} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">上传并导入</button>
          <button disabled={busy} onClick={previewChunks} className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50">预览切片</button>
        </div>
      </section>

      <section className="p-4 border rounded space-y-3">
        <h2 className="font-semibold">粘贴文本导入</h2>
        <textarea placeholder="粘贴中文文本..." value={textInput} onChange={e => setTextInput(e.target.value)} className="border rounded p-2 w-full h-40" />
        <div className="flex gap-2 flex-wrap">
          <button disabled={busy} onClick={importText} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">导入文本</button>
          <button disabled={busy} onClick={previewChunks} className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50">预览切片</button>
        </div>
      </section>

      <section className="p-4 border rounded space-y-3">
        <h2 className="font-semibold">批量入列（Notion / Drive）</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-3 border rounded">
            <div className="font-medium">Notion 入列</div>
            <input placeholder="Notion Database ID 或留空" value={notionDb} onChange={e => setNotionDb(e.target.value)} className="border rounded p-2 w-full" />
            <input placeholder="Page IDs(逗号分隔) 或留空" value={notionPages} onChange={e => setNotionPages(e.target.value)} className="border rounded p-2 w-full" />
            <input placeholder="tagPropertyName(可选)" value={notionTagProp} onChange={e => setNotionTagProp(e.target.value)} className="border rounded p-2 w-full" />
            <input placeholder="categoryPropertyName(可选)" value={notionCatProp} onChange={e => setNotionCatProp(e.target.value)} className="border rounded p-2 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="concurrency(可选)" type="number" value={notionConcurrency as any} onChange={e => setNotionConcurrency(e.target.value ? parseInt(e.target.value,10) : '' as any)} className="border rounded p-2 w-full" />
              <input placeholder="pageSize(可选)" type="number" value={notionPageSize as any} onChange={e => setNotionPageSize(e.target.value ? parseInt(e.target.value,10) : '' as any)} className="border rounded p-2 w-full" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={notionOverrideCat} onChange={e => setNotionOverrideCat(e.target.checked)} /> 使用 Notion 分类覆盖 category
            </label>
            <button disabled={busy} onClick={async () => {
              setBusy(true); setJobLog(''); setJobId(''); setJobState('')
              try {
                const options: any = { 
                  category,
                  tags: tags.split(',').map(s=>s.trim()).filter(Boolean)
                }
                if (notionDb) options.databaseId = notionDb
                if (notionPages) options.pageIds = notionPages.split(',').map(s=>s.trim()).filter(Boolean)
                if (notionTagProp) options.tagPropertyName = notionTagProp
                if (notionCatProp) options.categoryPropertyName = notionCatProp
                if (notionOverrideCat) options.overrideCategoryWithNotion = true
                if (notionConcurrency) options.concurrency = notionConcurrency
                if (notionPageSize) options.pageSize = notionPageSize
                const res = await fetch('/api/knowledge/jobs/enqueue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'notion', options }) })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.error || '入列失败')
                setJobId(data.data.jobId)
                const es = new EventSource(`/api/knowledge/jobs/stream?id=${encodeURIComponent(data.data.jobId)}`)
                es.onmessage = (ev) => {
                  try {
                    const obj = JSON.parse(ev.data)
                    if (obj.state) setJobState(obj.state)
                    setJobLog(prev => prev + (prev ? '\n' : '') + ev.data)
                    if (obj.done) es.close()
                  } catch { setJobLog(prev => prev + (prev ? '\n' : '') + ev.data) }
                }
                es.onerror = () => { es.close() }
              } catch (e:any) {
                appendLog(`入列失败: ${e.message || e}`)
              } finally { setBusy(false) }
            }} className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">入列 Notion 任务</button>
          </div>
          <div className="space-y-2 p-3 border rounded">
            <div className="font-medium">Drive 入列</div>
            <input placeholder="Folder ID 或留空" value={driveFolder} onChange={e => setDriveFolder(e.target.value)} className="border rounded p-2 w-full" />
            <input placeholder="File IDs(逗号分隔) 或留空" value={driveFiles} onChange={e => setDriveFiles(e.target.value)} className="border rounded p-2 w-full" />
            <input placeholder="concurrency(可选)" type="number" value={driveConcurrency as any} onChange={e => setDriveConcurrency(e.target.value ? parseInt(e.target.value,10) : '' as any)} className="border rounded p-2 w-full" />
            <button disabled={busy} onClick={async () => {
              setBusy(true); setJobLog(''); setJobId(''); setJobState('')
              try {
                const options: any = { category, tags: tags.split(',').map(s=>s.trim()).filter(Boolean) }
                if (driveFolder) options.folderId = driveFolder
                if (driveFiles) options.fileIds = driveFiles.split(',').map(s=>s.trim()).filter(Boolean)
                if (driveConcurrency) options.concurrency = driveConcurrency
                const res = await fetch('/api/knowledge/jobs/enqueue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'drive', options }) })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.error || '入列失败')
                setJobId(data.data.jobId)
                const es = new EventSource(`/api/knowledge/jobs/stream?id=${encodeURIComponent(data.data.jobId)}`)
                es.onmessage = (ev) => {
                  try {
                    const obj = JSON.parse(ev.data)
                    if (obj.state) setJobState(obj.state)
                    setJobLog(prev => prev + (prev ? '\n' : '') + ev.data)
                    if (obj.done) es.close()
                  } catch { setJobLog(prev => prev + (prev ? '\n' : '') + ev.data) }
                }
                es.onerror = () => { es.close() }
              } catch (e:any) {
                appendLog(`入列失败: ${e.message || e}`)
              } finally { setBusy(false) }
            }} className="px-3 py-2 bg-teal-600 text-white rounded disabled:opacity-50">入列 Drive 任务</button>
          </div>
        </div>
        <div className="text-sm text-gray-600">Job: {jobId || '-'} · 状态: {jobState || '-'}</div>
        <pre className="bg-black text-green-400 p-3 rounded whitespace-pre-wrap text-xs max-h-60 overflow-auto">{jobLog}</pre>
      </section>

      <section className="p-4 border rounded space-y-3">
        <h2 className="font-semibold">任务历史</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm">状态
            <select value={jobListState} onChange={e => setJobListState(e.target.value as any)} className="border rounded p-2 ml-2">
              {['all','waiting','active','delayed','completed','failed','paused'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-sm">类型
            <select value={jobListType} onChange={e => setJobListType(e.target.value as any)} className="border rounded p-2 ml-2">
              {['all','notion','drive'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button disabled={busy} onClick={async () => {
            setBusy(true)
            try {
              const u = new URL('/api/knowledge/jobs/list', window.location.origin)
              u.searchParams.set('state', jobListState)
              if (jobListType !== 'all') u.searchParams.set('type', jobListType)
              const res = await fetch(u.toString())
              const data = await res.json()
              if (!res.ok || !data.success) throw new Error(data.error || '获取任务失败')
              setJobList(data.data.items || [])
            } catch (e:any) {
              appendLog(`获取任务失败: ${e.message || e}`)
            } finally { setBusy(false) }
          }} className="px-3 py-2 bg-slate-700 text-white rounded disabled:opacity-50">刷新</button>
        </div>
        <div className="space-y-2 max-h-[420px] overflow-auto">
          {jobList.map((j: any) => (
            <div key={j.id} className="p-3 border rounded bg-gray-50">
              <div className="text-sm">#{j.id} · {j.name} · 状态: {j.state} · 进度: {typeof j.progress === 'object' ? JSON.stringify(j.progress) : (j.progress ?? '-')}</div>
              <div className="text-xs text-gray-600">{j.data?.type} · {j.data?.options?.category || j.data?.options?.category}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => {
                  const es = new EventSource(`/api/knowledge/jobs/stream?id=${encodeURIComponent(j.id)}`)
                  es.onmessage = (ev) => setJobLog(prev => prev + (prev ? '\n' : '') + ev.data)
                  es.onerror = () => es.close()
                }} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">跟踪</button>
                <button onClick={async () => {
                  try {
                    const u = new URL('/api/knowledge/jobs/cancel', window.location.origin)
                    u.searchParams.set('id', j.id)
                    const res = await fetch(u.toString(), { method: 'DELETE' })
                    const data = await res.json()
                    if (!res.ok || !data.success) throw new Error(data.error || '取消失败')
                    appendLog(`已取消: ${j.id}`)
                  } catch (e:any) {
                    appendLog(`取消失败: ${e.message || e}`)
                  }
                }} className="px-2 py-1 text-xs bg-red-600 text-white rounded">取消</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 border rounded space-y-3">
        <h2 className="font-semibold">切片参数</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block text-sm">maxChars
            <input type="number" value={maxChars} onChange={e => setMaxChars(parseInt(e.target.value || '0', 10))} className="border rounded p-2 w-full" />
          </label>
          <label className="block text-sm">overlapChars
            <input type="number" value={overlapChars} onChange={e => setOverlapChars(parseInt(e.target.value || '0', 10))} className="border rounded p-2 w-full" />
          </label>
          <label className="block text-sm">minChars
            <input type="number" value={minChars} onChange={e => setMinChars(parseInt(e.target.value || '0', 10))} className="border rounded p-2 w-full" />
          </label>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={removeHeadersFooters} onChange={e => setRemoveHeadersFooters(e.target.checked)} /> 去页眉/页脚（PDF）
        </label>
      </section>

      {preview && (
        <section className="p-4 border rounded space-y-3">
          <h2 className="font-semibold">切片预览（{preview.mode}）</h2>
          <div className="text-sm text-gray-600">chunks: {preview.chunkCount}, tokens≈{preview.totalTokens}</div>
          <div className="space-y-2 max-h-[480px] overflow-auto">
            {preview.chunks.map((c: any) => (
              <details key={c.index} className="p-3 border rounded bg-gray-50">
                <summary className="cursor-pointer text-sm">
                  #{c.index} · {c.length} chars · tokens≈{c.tokens} · 预览: {c.preview}
                </summary>
                <pre className="whitespace-pre-wrap text-sm mt-2">{c.content}</pre>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="p-4 border rounded space-y-3">
        <h2 className="font-semibold">检索验证</h2>
        <input placeholder="搜索关键词" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="border rounded p-2 w-full" />
        <input placeholder="标签(逗号分隔)" value={tags} onChange={e => setTags(e.target.value)} className="border rounded p-2 w-full" />
        <button disabled={busy} onClick={doSearch} className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50">搜索</button>
        <div className="space-y-2">
          {searchRes.map((r, i) => (
            <div key={i} className="p-3 border rounded bg-gray-50">
              <div className="text-sm text-gray-600">相似度: {typeof r.similarity === 'number' ? r.similarity.toFixed(3) : '-'}</div>
              <pre className="whitespace-pre-wrap text-sm">{r.content || r.pageContent || ''}</pre>
              {r.metadata && <div className="text-xs text-gray-500">{JSON.stringify(r.metadata)}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 border rounded space-y-3">
        <h2 className="font-semibold">维护工具</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2 p-3 border rounded">
            <div className="font-medium">按 Source 去重/删除</div>
            <input placeholder="source" value={dedupeSource} onChange={e => setDedupeSource(e.target.value)} className="border rounded p-2 w-full" />
            <div className="flex gap-2">
              <button disabled={busy} onClick={doDedupe} className="px-3 py-2 bg-amber-600 text-white rounded disabled:opacity-50">去重</button>
              <button disabled={busy} onClick={deleteBySource} className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50">删除</button>
            </div>
          </div>
          <div className="space-y-2 p-3 border rounded">
            <div className="font-medium">重嵌入</div>
            <input placeholder="按 source 重嵌入" value={reembedSource} onChange={e => setReembedSource(e.target.value)} className="border rounded p-2 w-full" />
            <input placeholder="按 category 重嵌入" value={reembedCategory} onChange={e => setReembedCategory(e.target.value)} className="border rounded p-2 w-full" />
            <div className="flex gap-2 flex-wrap">
              <button disabled={busy} onClick={() => doReembed('source')} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">按 Source</button>
              <button disabled={busy} onClick={() => doReembed('category')} className="px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50">按 Category</button>
              <button disabled={busy} onClick={() => doReembed('all')} className="px-3 py-2 bg-blue-400 text-white rounded disabled:opacity-50">全量</button>
            </div>
          </div>
        </div>
      </section>

      <section className="p-4 border rounded space-y-2">
        <h2 className="font-semibold">日志</h2>
        <pre className="bg-black text-green-400 p-3 rounded whitespace-pre-wrap text-xs">{log}</pre>
      </section>
    </div>
  )
}
