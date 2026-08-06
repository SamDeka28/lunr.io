export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export type PaginationInput = {
  page?: string | string[];
  pageSize?: string | string[];
};

function first(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parsePagination(input: PaginationInput = {}) {
  const rawPage = parseInt(first(input.page) || "1", 10);
  const rawSize = parseInt(
    first(input.pageSize) || String(DEFAULT_PAGE_SIZE),
    10
  );
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? rawSize
    : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export function paginationMeta(total: number, page: number, pageSize: number) {
  const safeTotal = Math.max(0, total);
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    total: safeTotal,
    page: safePage,
    pageSize,
    totalPages,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages && safeTotal > 0,
    from: safeTotal === 0 ? 0 : startIndex + 1,
    to: Math.min(startIndex + pageSize, safeTotal),
  };
}

/** Drop page when filters/search change so users don't land on an empty page. */
export function resetPageParam(params: URLSearchParams) {
  params.delete("page");
  return params;
}

export type ListPagination = ReturnType<typeof paginationMeta>;
