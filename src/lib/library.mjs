export async function identifySource(file, sources, digest = (bytes) => crypto.subtle.digest('SHA-256', bytes)) {
  const candidates = sources.filter(source => source.bytes === file.size);
  if (!candidates.length) return null;
  const bytes = await file.arrayBuffer();
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') return null;
  const hash = Array.from(new Uint8Array(await digest(bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
  return candidates.find(source => source.sha256 === hash) ?? null;
}

export function pdfPageUrl(objectUrl, page, totalPages) {
  if (!objectUrl.startsWith('blob:') || !Number.isInteger(page) || page < 1 || page > totalPages) {
    throw new Error('Invalid local PDF page');
  }
  return `${objectUrl}#page=${page}`;
}
