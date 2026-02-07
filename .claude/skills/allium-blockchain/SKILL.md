---
name: allium-blockchain
description: Query blockchain data across 150+ chains using Allium's enterprise-grade data infrastructure
version: 1.0.0
tags:
  - blockchain
  - web3
  - data
  - analytics
---

# Allium Blockchain Data Skill

## Overview

This skill enables querying blockchain data across 150+ chains (EVM, Solana, Bitcoin, and more) using Allium's enterprise-grade data infrastructure. Allium provides historical and real-time data including wallet balances, token prices, transaction history, NFT activity, and protocol metrics.

## MCP Server Configuration

The Allium MCP server is configured in the project's `.claude/settings.json`. It uses the Model Context Protocol to provide structured tool calls for blockchain data queries.

### Available Tools

- **explorer_run_query**: Execute saved Allium Explorer SQL queries by query ID
- Query wallet balances, token prices, transaction history
- Access NFT minting events, sales data, and smart contract deployments
- Cross-chain data across 150+ blockchains

## Usage Patterns

### Artist Timeline Queries

To build an artist timeline, query for:

1. **NFT Minting Events**: First mints, collection launches, notable 1/1s
2. **Top Sales**: Highest value secondary sales and primary sales
3. **Smart Contract Deployments**: New collection contracts, custom contracts
4. **Wallet Activity**: Cross-chain activity, DeFi interactions
5. **Collection Metrics**: Floor prices, volume, holder counts over time

### Example Query Pattern

```sql
-- Find NFT minting events for an artist wallet
SELECT
  block_timestamp,
  transaction_hash,
  contract_address,
  token_id,
  chain
FROM nft_transfers
WHERE from_address = '0x0000000000000000000000000000000000000000'
  AND to_address = :wallet_address
ORDER BY block_timestamp ASC
```

## Data Sources

- **Allium Explorer**: Interactive SQL query interface at app.allium.so
- **Allium MCP Server**: mcp.allium.so for programmatic access
- **Allium Developer APIs**: REST APIs for wallet balances, token prices, transaction data

## Authentication

Requires an Allium API key. Set the `ALLIUM_API_KEY` environment variable or configure it in the MCP server settings.

## Reference

- Documentation: https://docs.allium.so
- MCP Server: https://docs.allium.so/assistant/allium-mcp
- AgentHub: https://agents.allium.so
