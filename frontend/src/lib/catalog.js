/** Shared catalog vocabulary and formatting helpers. */
export const CATEGORIES = ['Chúc tụng', 'Sinh hoạt', 'Lịch sử & dân gian', 'Tứ quý'];
export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
export const date = value => value ? new Date(value).toLocaleDateString('vi-VN') : '';
export function buildCatalogQuery({ page = 1, limit = 12, category = '', workshopId = '', type = '', search = '' } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) query.set('category', category);
  if (workshopId) query.set('workshopId', workshopId);
  if (type) query.set('type', type);
  if (search) query.set('search', search);
  return query.toString();
}
