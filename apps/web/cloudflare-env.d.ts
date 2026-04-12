// Global interface consumed by getCloudflareContext().env
// Add bindings here as they are added to wrangler.jsonc
declare global {
  interface CloudflareEnv {
    ASSETS: Fetcher
  }
}

export {}
