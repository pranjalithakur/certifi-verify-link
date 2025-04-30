
// This file contains configuration values
export const PINATA_CONFIG = {
  API_KEY: "add_api_key_here",
  API_SECRET: "add_api_secrets_here",
  GATEWAY: "add_gateway_here",
  JWT: "add_jwt_key_here"
};

export const SOLANA_CONFIG = {
PROGRAM_ID: "add_program_id_here",
NETWORK: "devnet",
RPC_URL: "https://api.devnet.solana.com"
}

export const ALLOWED_ISSUERS: Record<string,string> = {
"Issuer": "add_issuer_address_here",
"Solana Tech Institute": "add_issuer_address_here",
};

export const ALLOWED_ISSUER_ADDRESSES: string[] =
Object.values(ALLOWED_ISSUERS);
