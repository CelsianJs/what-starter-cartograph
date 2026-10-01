export class JsonBodyError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'JsonBodyError';
    this.status = status;
  }
}

function contentLength(request) {
  const raw = request.headers.get('content-length');
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function readBoundedJson(request, maxBytes = 12_288) {
  const declared = contentLength(request);
  if (declared !== null && declared > maxBytes) {
    throw new JsonBodyError('Quote request is too large.', 413);
  }
  if (!request.body) return {};

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      total += chunk.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new JsonBodyError('Quote request is too large.', 413);
      }
      chunks.push(chunk);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {}
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes) || '{}');
  } catch {
    throw new JsonBodyError('Quote request must be valid JSON.', 400);
  }
}
