import axios from 'src/utils/axios';

export type AuditLogEntry = {
  _id: string;
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
  role?: string;
  category?: string;
  action: string;
  entity?: string;
  entityId?: string | null;
  summary?: string | null;
  changes?: { field: string; oldValue: unknown; newValue: unknown }[];
  meta?: Record<string, unknown>;
  ipAddress?: string | null;
  at: string;
};

export type StockActivityEntry = {
  _id: string;
  itemId: string;
  itemName: string;
  amount: number;
  operationType: string;
  operationDate: string;
  outletId?: string;
};

type AuditLogParams = {
  companyID: string;
  category?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

type StockActivityParams = {
  companyID: string;
  outletId?: string;
  itemId?: string;
  operationType?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
};

export const getAuditLogs = async (params: AuditLogParams) => {
  const response = await axios.get('/auditLog', { params });
  return response.data as {
    data: AuditLogEntry[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
};

export const getStockActivityLedger = async (params: StockActivityParams) => {
  const response = await axios.get('/auditLog/stock-activity', { params });
  return response.data as { data: StockActivityEntry[]; total: number };
};

export const getPriceHistory = async (itemId: string, companyID: string, limit = 50) => {
  const response = await axios.get(`/auditLog/price-history/${itemId}`, {
    params: { companyID, limit },
  });
  return response.data as {
    itemId: string;
    priceHistory: {
      at: string;
      userId?: string;
      oldPrice: number;
      newPrice: number;
      action: string;
      summary?: string;
    }[];
  };
};
