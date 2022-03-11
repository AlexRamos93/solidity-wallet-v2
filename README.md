# Solidity Wallet V2

This project uses EIP-1167 (minimal proxy) for deploying a Wallet contract for each user.
Each Wallet has a human readable address associated with the actual address of the contract.
This readable addresses is controlled by the WalletController contract.

## Getting started

Rename the `.env.example` file to `.env` and replace the credentials necessary.

## Instaling

`$ npm install`

## Testing

`$ npm test`

### Deploy

`npm run deploy`

### Verify contract

`npm run verify "CONTRACT ADDRESS"`
