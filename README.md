# Pylon AI — Unified MCP Server

A single MCP (Model Context Protocol) server that exposes all 10 Pylon AI APIs as tools for AI agents.

## Tools

| Tool | Description | Key Params |
|------|-------------|------------|
| `pylon_screenshot` | Screenshot any webpage | `url` |
| `pylon_pdf_parse` | Extract text from PDF | `file_url` |
| `pylon_qr_code` | Generate QR code PNG | `text` |
| `pylon_domain_intel` | WHOIS + DNS lookup | `domain` |
| `pylon_email_validate` | Validate email address | `email` |
| `pylon_image_resize` | Resize an image | `file_url`, `width`, `height` |
| `pylon_md_to_pdf` | Markdown → PDF | `markdown` |
| `pylon_html_to_pdf` | HTML → PDF | `html` |
| `pylon_ocr` | OCR text extraction | `file_url` |
| `pylon_alpha_alerts` | Crypto alpha alerts | `type` (latest/whales/launches) |

## Setup

```bash
cd pylon/mcp-servers
npm install
```

## Usage

### With Claude Desktop / MCP Client

Add to your MCP config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "pylon-ai": {
      "command": "node",
      "args": ["/path/to/pylon/mcp-servers/index.js"],
      "env": {
        "PYLON_TEST_KEY": "your-test-key-here"
      }
    }
  }
}
```

### Standalone

```bash
PYLON_TEST_KEY=your-key node index.js
```

The server communicates via stdio using the MCP protocol.

## x402 Payment Note

All Pylon APIs use the [x402 payment protocol](https://www.x402.org/) for per-call billing on Base. **Mainnet payments are not yet live.** For now, set the `PYLON_TEST_KEY` environment variable to bypass payments during testing. The server sends this as the `x-test-key` header on all API requests.

## API Endpoints

All APIs live at `pylon-{name}-api.fly.dev`:

- `pylon-screenshot-api.fly.dev`
- `pylon-pdf-parse-api.fly.dev`
- `pylon-qr-code-api.fly.dev`
- `pylon-domain-intel-api.fly.dev`
- `pylon-email-validate-api.fly.dev`
- `pylon-image-resize-api.fly.dev`
- `pylon-md-to-pdf-api.fly.dev`
- `pylon-html-to-pdf-api.fly.dev`
- `pylon-ocr-api.fly.dev`
- `pylon-alpha-alerts-api.fly.dev`
