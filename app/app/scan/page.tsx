'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  parseCSVFile,
  getCSVHeaders,
  detectBank,
  normalizeTransactions,
  type ColumnMapping,
} from '@/lib/utils/csv-parser'

export default function ScanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sprintId = searchParams.get('sprint')

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  // Column mapping state
  const [headers, setHeaders] = useState<string[]>([])
  const [detectedBank, setDetectedBank] = useState<string>('')
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null)
  const [showMapping, setShowMapping] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      handleFileSelect(droppedFile)
    } else {
      setError('Please upload a CSV file')
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setError('')

    try {
      // Get headers and detect bank
      const csvHeaders = await getCSVHeaders(selectedFile)
      const rows = await parseCSVFile(selectedFile)
      const detection = detectBank(csvHeaders, rows)

      setHeaders(csvHeaders)
      setDetectedBank(detection.name)
      setColumnMapping(detection.suggestedMapping)

      // If confidence is low, show mapping UI
      if (detection.confidence < 0.8) {
        setShowMapping(true)
      }
    } catch (err) {
      setError('Failed to parse CSV file. Please check the format.')
      console.error(err)
    }
  }

  const handleUpload = async () => {
    if (!file || !sprintId || !columnMapping) return

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      // Parse CSV
      const rows = await parseCSVFile(file)
      const transactions = normalizeTransactions(rows, columnMapping)

      if (transactions.length === 0) {
        setError('No valid transactions found in CSV. Please check column mapping.')
        setUploading(false)
        return
      }

      // Upload file to Supabase Storage
      const filePath = `${user.id}/${sprintId}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('csv-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Failed to upload file')
        setUploading(false)
        return
      }

      // Create upload record
      const { data: upload, error: uploadRecordError } = await supabase
        .from('uploads')
        .insert({
          sprint_id: sprintId,
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          file_path: filePath,
          bank_name: detectedBank,
          upload_type: 'initial',
          column_mapping: columnMapping,
          transaction_count: transactions.length,
        })
        .select()
        .single()

      if (uploadRecordError) {
        console.error('Upload record error:', uploadRecordError)
        setError('Failed to save upload record')
        setUploading(false)
        return
      }

      // Start processing in background
      setProcessing(true)
      await processTransactions(upload.id, sprintId, transactions)

      // Redirect to results
      router.push(`/app/results?sprint=${sprintId}`)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const processTransactions = async (
    uploadId: string,
    sprintId: string,
    transactions: any[]
  ) => {
    const supabase = createClient()

    // Insert transactions in batches
    const batchSize = 100
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize).map((t) => ({
        upload_id: uploadId,
        sprint_id: sprintId,
        transaction_date: t.date,
        raw_description: t.description,
        normalized_description: t.description.toUpperCase(),
        amount: t.amount,
        transaction_type: t.transactionType,
        balance: t.balance,
        merchant_candidate: extractMerchantSimple(t.description),
      }))

      await supabase.from('transactions').insert(batch)
    }

    // Mark upload as processed
    await supabase
      .from('uploads')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('id', uploadId)
  }

  const extractMerchantSimple = (description: string): string => {
    // Simple extraction for now - will be enhanced by backend job
    const cleaned = description.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').trim()
    const firstToken = cleaned.split(/\s+/)[0]
    return firstToken || cleaned.substring(0, 20)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Upload Your Bank CSV</h1>
        <p className="mb-8 text-lg text-khaki-400">
          We'll scan for recurring charges and show your potential savings
        </p>

        {/* Drag & Drop Zone */}
        {!file && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-all ${
              dragActive
                ? 'border-lime-500 bg-army-green-900'
                : 'border-army-green-700 bg-army-green-950 hover:border-army-green-600'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            <div className="pointer-events-none">
              <div className="mb-4 text-6xl">📄</div>
              <div className="mb-2 text-xl font-semibold text-foreground">
                Drop your CSV here, or click to browse
              </div>
              <div className="text-khaki-500">
                Works with ANZ, BNZ, SBS, and most NZ banks
              </div>
            </div>
          </div>
        )}

        {/* File Selected */}
        {file && (
          <div className="space-y-6">
            <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold text-foreground">{file.name}</div>
                  <div className="text-sm text-khaki-500">
                    {(file.size / 1024).toFixed(1)} KB • {headers.length} columns
                  </div>
                  {detectedBank && (
                    <div className="mt-2 inline-block rounded bg-lime-600/20 px-2 py-1 text-sm text-lime-400">
                      Detected: {detectedBank}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    setHeaders([])
                    setDetectedBank('')
                    setColumnMapping(null)
                    setShowMapping(false)
                  }}
                  className="text-khaki-500 hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {/* Column Mapping */}
              {showMapping && columnMapping && (
                <div className="space-y-3 border-t border-army-green-800 pt-4">
                  <div className="text-sm font-semibold text-foreground">Column Mapping</div>
                  <div className="text-xs text-khaki-500">
                    Verify these mappings are correct:
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between rounded bg-army-green-900 p-2">
                      <span className="text-sm text-khaki-400">Date:</span>
                      <span className="text-sm text-foreground">{columnMapping.date}</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-army-green-900 p-2">
                      <span className="text-sm text-khaki-400">Description:</span>
                      <span className="text-sm text-foreground">{columnMapping.description}</span>
                    </div>
                    {columnMapping.amount && (
                      <div className="flex items-center justify-between rounded bg-army-green-900 p-2">
                        <span className="text-sm text-khaki-400">Amount:</span>
                        <span className="text-sm text-foreground">{columnMapping.amount}</span>
                      </div>
                    )}
                    {columnMapping.debit && columnMapping.credit && (
                      <>
                        <div className="flex items-center justify-between rounded bg-army-green-900 p-2">
                          <span className="text-sm text-khaki-400">Debit:</span>
                          <span className="text-sm text-foreground">{columnMapping.debit}</span>
                        </div>
                        <div className="flex items-center justify-between rounded bg-army-green-900 p-2">
                          <span className="text-sm text-khaki-400">Credit:</span>
                          <span className="text-sm text-foreground">{columnMapping.credit}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setShowMapping(false)}
                    className="text-sm text-lime-500 hover:text-lime-400"
                  >
                    Looks good ✓
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || processing || !columnMapping}
              className="w-full rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500 disabled:opacity-50"
            >
              {uploading
                ? 'Uploading...'
                : processing
                  ? 'Processing transactions...'
                  : 'Scan for Savings'}
            </button>

            <p className="text-center text-sm text-khaki-500">
              This will take 10-30 seconds to analyze your recurring charges
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
