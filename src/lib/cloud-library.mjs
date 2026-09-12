// Only activate after the published PDF responses and hashes have been verified.
export function onlinePdfUrl(sourceId, originalPage, cloud) {
  if (!cloud?.ready || sourceId !== cloud.sourceId) return null;
  if (!Number.isInteger(originalPage) || originalPage < 1) return null;
  const base = new URL(cloud.baseUrl);
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Invalid public PDF origin');
  if (originalPage === 1) return new URL('index.html',base).href;
  const entry = cloud.files.find(f => originalPage >= f.sourcePages[0] && originalPage <= f.sourcePages[1]);
  if (!entry) return null;
  const page = originalPage - entry.sourcePages[0] + 1;
  if (page < 1 || page > entry.pages || !/^exams\/\d{4}\.pdf$/.test(entry.file)) throw new Error('Invalid annual PDF mapping');
  return new URL(entry.file,base).href + `#page=${page}`;
}
