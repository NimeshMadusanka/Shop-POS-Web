export type Item = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  service: string;
};

export type BillingGeneral = {
  _id: string;
  attachment: string;
  reference: string;
  paidAmount: string;
};

export type CompanyInfo = {
  id: string;
  name: string;
  address: string;
  company: string;
  email: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  taxes: number;
  discount: number;
  sent: number;
  subTotalPrice: number;
  totalPrice: number;
  createDate: string;
  status: string;
  invoiceFrom: CompanyInfo;
  invoiceTo: CompanyInfo;
  items: Item[];
};

export type IBillingGeneral = {
  id: string;
  date: string;
  attachment: string;
  invoice: Invoice;
  approvedBy: string;
  amount: string;
  status: string;
};


export type IUserList = {
  id:string,
  name:string,
  company:string,
  status:string,
  role:string,
  joinDate:string
};