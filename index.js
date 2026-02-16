#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// --- Configuration ---

const TEST_KEY = process.env.PYLON_TEST_KEY || "";

const ENDPOINTS = {
  screenshot: "https://pylon-screenshot-api.fly.dev",
  pdf_parse: "https://pylon-pdf-parse-api.fly.dev",
  qr_code: "https://pylon-qr-code-api.fly.dev",
  domain_intel: "https://pylon-domain-intel-api.fly.dev",
  email_validate: "https://pylon-email-validate-api.fly.dev",
  image_resize: "https://pylon-image-resize-api.fly.dev",
  md_to_pdf: "https://pylon-md-to-pdf-api.fly.dev",
  html_to_pdf: "https://pylon-html-to-pdf-api.fly.dev",
  ocr: "https://pylon-ocr-api.fly.dev",
  alpha_alerts: "https://pylon-alpha-alerts-api.fly.dev",
};

// --- Helpers ---

function headers(extra = {}) {
  const h = { ...extra };
  if (TEST_KEY) h["x-test-key"] = TEST_KEY;
  return h;
}

async function apiGet(endpoint, path) {
  const res = await fetch(`${endpoint}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res;
}

async function apiPost(endpoint, path, body, contentType = "application/json") {
  const res = await fetch(`${endpoint}${path}`, {
    method: "POST",
    headers: headers({ "Content-Type": contentType }),
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res;
}

function imageContent(buf, mimeType = "image/png") {
  return { content: [{ type: "image", data: buf.toString("base64"), mimeType }] };
}

function textContent(text) {
  return { content: [{ type: "text", text }] };
}

function errorContent(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}

// --- MCP Server ---

const server = new McpServer({
  name: "pylon-ai",
  version: "1.0.0",
});

// 1. Screenshot
server.tool(
  "pylon_screenshot",
  "Take a screenshot of any webpage. Returns a PNG image.",
  {
    url: z.string().url().describe("URL to screenshot"),
    width: z.number().int().min(320).max(3840).default(1280).describe("Viewport width"),
    height: z.number().int().min(200).max(2160).default(800).describe("Viewport height"),
    full_page: z.boolean().default(false).describe("Capture full scrollable page"),
  },
  async ({ url, width, height, full_page }) => {
    try {
      const params = new URLSearchParams({ url, width: String(width), height: String(height), fullPage: String(full_page), format: "png" });
      const res = await apiGet(ENDPOINTS.screenshot, `/screenshot?${params}`);
      return imageContent(Buffer.from(await res.arrayBuffer()));
    } catch (e) { return errorContent(`Screenshot failed: ${e.message}`); }
  }
);

// 2. PDF Parse
server.tool(
  "pylon_pdf_parse",
  "Extract text and metadata from a PDF file. Provide a publicly accessible URL to the PDF.",
  {
    file_url: z.string().url().describe("URL to the PDF file"),
  },
  async ({ file_url }) => {
    try {
      const res = await apiPost(ENDPOINTS.pdf_parse, "/parse", { file_url });
      return textContent(JSON.stringify(await res.json(), null, 2));
    } catch (e) { return errorContent(`PDF parse failed: ${e.message}`); }
  }
);

// 3. QR Code
server.tool(
  "pylon_qr_code",
  "Generate a QR code image from text or a URL. Returns a PNG image.",
  {
    text: z.string().describe("Text or URL to encode in the QR code"),
  },
  async ({ text }) => {
    try {
      const params = new URLSearchParams({ text });
      const res = await apiGet(ENDPOINTS.qr_code, `/qr?${params}`);
      return imageContent(Buffer.from(await res.arrayBuffer()));
    } catch (e) { return errorContent(`QR code failed: ${e.message}`); }
  }
);

// 4. Domain Intel
server.tool(
  "pylon_domain_intel",
  "Get WHOIS and DNS intelligence for a domain. Returns JSON with registration, nameservers, DNS records, etc.",
  {
    domain: z.string().describe("Domain name to look up (e.g. example.com)"),
  },
  async ({ domain }) => {
    try {
      const params = new URLSearchParams({ domain });
      const res = await apiGet(ENDPOINTS.domain_intel, `/lookup?${params}`);
      return textContent(JSON.stringify(await res.json(), null, 2));
    } catch (e) { return errorContent(`Domain intel failed: ${e.message}`); }
  }
);

// 5. Email Validate
server.tool(
  "pylon_email_validate",
  "Validate an email address. Checks format, MX records, and deliverability. Returns JSON.",
  {
    email: z.string().email().describe("Email address to validate"),
  },
  async ({ email }) => {
    try {
      const params = new URLSearchParams({ email });
      const res = await apiGet(ENDPOINTS.email_validate, `/validate?${params}`);
      return textContent(JSON.stringify(await res.json(), null, 2));
    } catch (e) { return errorContent(`Email validation failed: ${e.message}`); }
  }
);

// 6. Image Resize
server.tool(
  "pylon_image_resize",
  "Resize an image from a URL. Returns the resized image.",
  {
    file_url: z.string().url().describe("URL to the image file"),
    width: z.number().int().min(1).max(4096).describe("Target width in pixels"),
    height: z.number().int().min(1).max(4096).describe("Target height in pixels"),
  },
  async ({ file_url, width, height }) => {
    try {
      const params = new URLSearchParams({ file_url, width: String(width), height: String(height) });
      const res = await apiGet(ENDPOINTS.image_resize, `/resize?${params}`);
      const ct = res.headers.get("content-type") || "image/png";
      return imageContent(Buffer.from(await res.arrayBuffer()), ct);
    } catch (e) { return errorContent(`Image resize failed: ${e.message}`); }
  }
);

// 7. Markdown to PDF
server.tool(
  "pylon_md_to_pdf",
  "Convert Markdown text to a PDF document. Returns base64-encoded PDF.",
  {
    markdown: z.string().describe("Markdown content to convert"),
  },
  async ({ markdown }) => {
    try {
      const res = await apiPost(ENDPOINTS.md_to_pdf, "/convert", { markdown });
      const buf = Buffer.from(await res.arrayBuffer());
      return { content: [{ type: "resource", resource: { uri: "data:application/pdf;base64," + buf.toString("base64"), mimeType: "application/pdf" } }] };
    } catch (e) { return errorContent(`MD to PDF failed: ${e.message}`); }
  }
);

// 8. HTML to PDF
server.tool(
  "pylon_html_to_pdf",
  "Convert raw HTML to a PDF document. Returns base64-encoded PDF.",
  {
    html: z.string().describe("HTML content to convert"),
  },
  async ({ html }) => {
    try {
      const res = await apiPost(ENDPOINTS.html_to_pdf, "/convert", { html });
      const buf = Buffer.from(await res.arrayBuffer());
      return { content: [{ type: "resource", resource: { uri: "data:application/pdf;base64," + buf.toString("base64"), mimeType: "application/pdf" } }] };
    } catch (e) { return errorContent(`HTML to PDF failed: ${e.message}`); }
  }
);

// 9. OCR
server.tool(
  "pylon_ocr",
  "Extract text from an image using OCR. Provide a publicly accessible URL to the image.",
  {
    file_url: z.string().url().describe("URL to the image file"),
  },
  async ({ file_url }) => {
    try {
      const res = await apiPost(ENDPOINTS.ocr, "/ocr", { file_url });
      return textContent(JSON.stringify(await res.json(), null, 2));
    } catch (e) { return errorContent(`OCR failed: ${e.message}`); }
  }
);

// 10. Alpha Alerts
server.tool(
  "pylon_alpha_alerts",
  "Get crypto alpha alerts: latest signals, whale movements, or new token launches. Returns JSON.",
  {
    type: z.enum(["latest", "whales", "launches"]).default("latest").describe("Type of alerts to fetch"),
  },
  async ({ type }) => {
    try {
      const res = await apiGet(ENDPOINTS.alpha_alerts, `/alerts?type=${type}`);
      return textContent(JSON.stringify(await res.json(), null, 2));
    } catch (e) { return errorContent(`Alpha alerts failed: ${e.message}`); }
  }
);

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
