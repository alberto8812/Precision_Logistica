export type FilterOperator = 'equals' | 'contains' | 'in' | 'gt' | 'lt';

export interface IFilter {
  field: string;
  operator?: FilterOperator;
  Value: string;
}

export interface IPagination {
  limit?: number;
  afterCursor?: string | undefined;
  beforeCursor?: string | undefined;
  search?: string;
  filters?: IFilter[];
}

export interface IPageInfo {
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface IPaginatedResult<T> {
  data: T[];
  pageInfo: IPageInfo;
}
