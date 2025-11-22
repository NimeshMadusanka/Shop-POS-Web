// ----------------------------------------------------------------------

export type IInvoiceAddress = {
  id: string;
  name: string;
  address: string;
  company: string;
  email: string;
  phone: string;
};

export type IInvoiceItem = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  service: string;
};

export type IInvoice = {
  id: string;
  sent: number;
  status: string;
  totalPrice: number;
  invoiceNumber: string;
  subTotalPrice: number;
  taxes: number | string;
  discount: number | string;
  invoiceFrom: IInvoiceAddress;
  invoiceTo: IInvoiceAddress;
  createDate: Date | number;
  dueDate: Date | number;
  items: IInvoiceItem[];
};

export type DocInvoice = {
  metaId: string;
  customerId: string;
  batchNumber: string;
  billingType: string;
  numberOfUnit: string;
  avgWeightPerBox :string;
  perBox:string;
  totalboxout:string;
  totalWeight: string;
  totalWeightDrawn:string;
  containerNumber: string;
  vehicaleNumber: string;
  currentWeight: string;
  date: string;
  discountRate:string;
  rate: string;
  id: string;
};
