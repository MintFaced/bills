import Papa from 'papaparse'

export interface EtherscanTransaction {
  txhash: string
  blockno: string
  unixTimestamp: string
  datetime: string
  from: string
  to: string
  contractAddress?: string
  value: string
  valueOut?: string
  currentValue?: string
  txnFee?: string
  txnFeeUSD?: string
  historicalPrice?: string
  status: string
  errCode?: string
  method: string
}

export interface ParsedCSVResult {
  data: EtherscanTransaction[]
  errors: string[]
}

export function parseEtherscanCSV(csvContent: string): ParsedCSVResult {
  const errors: string[] = []

  try {
    const result = Papa.parse<EtherscanTransaction>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize common Etherscan header variations
        const normalized = header.trim().toLowerCase()
        const headerMap: Record<string, string> = {
          'txhash': 'txhash',
          'transaction hash': 'txhash',
          'hash': 'txhash',
          'blockno': 'blockno',
          'block': 'blockno',
          'block number': 'blockno',
          'unixtimestamp': 'unixTimestamp',
          'timestamp': 'unixTimestamp',
          'datetime (utc)': 'datetime',
          'datetime': 'datetime',
          'date time (utc)': 'datetime',
          'from': 'from',
          'to': 'to',
          'contractaddress': 'contractAddress',
          'contract address': 'contractAddress',
          'value_in(eth)': 'value',
          'value': 'value',
          'value_out(eth)': 'valueOut',
          'currentvalue @ $': 'currentValue',
          'txnfee(eth)': 'txnFee',
          'txn fee': 'txnFee',
          'txnfee(usd)': 'txnFeeUSD',
          'historical $price/eth': 'historicalPrice',
          'status': 'status',
          'errcode': 'errCode',
          'method': 'method',
        }
        return headerMap[normalized] || header
      },
    })

    if (result.errors.length > 0) {
      errors.push(...result.errors.map(e => e.message))
    }

    return {
      data: result.data,
      errors,
    }
  } catch (error) {
    return {
      data: [],
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}
