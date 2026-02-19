# Pylon MCP Server

> **The Action Layer for AI Agents** — 20 capabilities, one MCP server, no API keys.

Give Claude, Cursor, or any MCP-compatible client instant access to Pylon's full API gateway. Pay per request via [x402](https://x402.org) micropayments (USDC on Base). No signup. No subscriptions.

## Install

```bash
npx @pylonapi/mcp
```

## Capabilities (20)

| Tool | Description | Price |
|------|-------------|-------|
| `screenshot` | Full-page screenshot of any webpage (PNG/JPEG) | $0.005 |
| `web_scrape` | Scrape content from any URL via headless browser (Crawlee + Playwright) | $0.005 |
| `web_extract` | Fast lightweight content extraction (Readability) → markdown/text | $0.003 |
| `web_search` | Search the web — titles, URLs, snippets | $0.003 |
| `pdf_parse` | Extract text and metadata from PDFs | $0.003 |
| `ocr` | Extract text from images (optical character recognition) | $0.005 |
| `translate` | Translate text between 30+ languages with auto-detection | $0.003 |
| `email_validate` | Validate email — format, MX records, SMTP deliverability | $0.002 |
| `email_send` | Send transactional emails (CAN-SPAM compliant) | $0.01 |
| `domain_intel` | WHOIS, DNS records, SSL cert, tech stack detection | $0.005 |
| `dns_lookup` | DNS records for any domain (A, AAAA, MX, CNAME, TXT, etc.) | $0.002 |
| `ip_geolocation` | Geographic location of any IP address | $0.002 |
| `qr_code` | Generate QR code PNG from text/URL | $0.002 |
| `image_resize` | Resize, crop, convert images (PNG, JPEG, WebP) | $0.003 |
| `md_to_pdf` | Render markdown as styled PDF | $0.003 |
| `html_to_pdf` | Render HTML as PDF (full Chromium engine) | $0.005 |
| `document_generation` | Generate PDFs from templates (invoice, receipt, report, letter) | $0.005 |
| `file_storage` | Upload files, get public URL (up to 50MB, 30-day expiry) | $0.005 |
| `url_shortener` | Shorten URLs with click tracking, custom slugs | $0.002 |
| `data_formatter` | Convert between JSON, CSV, XML, YAML | $0.002 |

## Setup

### Claude Desktop / Cursor

Add to your MCP config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "pylon": {
      "command": "npx",
      "args": ["-y", "@pylonapi/mcp"]
    }
  }
}
```

### Standalone

```bash
npx @pylonapi/mcp
```

The server communicates via stdio using the MCP protocol. Capabilities are auto-discovered from the Pylon gateway at startup.

## How It Works

1. Your AI agent calls a Pylon tool (e.g. `web_scrape`)
2. The MCP server routes the request to `api.pylonapi.com/do`
3. Payment is handled automatically via x402 (USDC on Base)
4. Results are returned to your agent

No API keys to manage. No billing dashboards. No rate limit negotiations. The x402 protocol handles authentication via payment — if you can pay, you can call.

## x402 Payments

All requests are paid via the [x402 protocol](https://x402.org) — HTTP-native micropayments on Base (L2). Each call costs fractions of a cent in USDC.

**Live on Base Mainnet.**

## Links

- **Gateway:** [api.pylonapi.com](https://api.pylonapi.com)
- **Website:** [pylonapi.com](https://pylonapi.com)
- **Protocol:** [x402.org](https://x402.org)
- **GitHub:** [github.com/pylon-apis/pylon](https://github.com/pylon-apis/pylon)
- **npm:** [@pylonapi/mcp](https://www.npmjs.com/package/@pylonapi/mcp)

## License

MIT
