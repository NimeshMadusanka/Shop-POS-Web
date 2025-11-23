// ----------------------------------------------------------------------

export type IUserSocialLink = {
  facebookLink: string;
  instagramLink: string;
  linkedinLink: string;
  twitterLink: string;
};

export type IUserProfileFollowers = {
  follower: number;
  following: number;
};

export type IUserProfileCover = {
  name: string;
  cover: string;
  role: string;
};

export type IUserProfileAbout = {
  quote: string;
  country: string;
  email: string;
  role: string;
  company: string;
  school: string;
};

export type IUserProfile = IUserProfileFollowers &
  IUserProfileAbout & {
    id: string;
    socialLinks: IUserSocialLink;
  };

export type IUserProfileFollower = {
  id: string;
  avatarUrl: string;
  name: string;
  country: string;
  isFollowed: boolean;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  postAt: Date | string | number;
  imageUrl: string;
};

export type IUserProfileFriend = {
  id: string;
  avatarUrl: string;
  name: string;
  role: string;
};
export type NewPayRunCreate = {
  totalDeduction: number;
  totalAllowance: number;
  payrunDate:Date;
  _id: string;
  title:string;
  firstName: string;
  lastName: string;
  email: string;
  phonenumber: string;

  role: string;
  status: string;
  companyID:string;
   epf12month:string;
  nic:string;
  basicSalary: string;
  epf8month:string;
  allowances:string;
  deductions:string;
  totalEpf:string;
  etf:string;
  apitTax:string;
  finalSalary:string;
  allowance: {
    totalAllowance: string;
  };
  deduction: {
    totalDeduction: string;
  };
  isEpfEtfEligible:boolean;
  isApitTaxEligible: boolean;
 
};

export type NewItemCreate = {
  _id: string;
  itemName: string;
      itemCategory: string;
      itemType: string;
      itemPrice: string;
      itemDuration: string;
      stockQuantity?: number;
};
export type NewCustomerCreate = {
  _id: string;
  firstName: string;
  lastName: string;
  nicNumber:string;
  email: string;
  phoneNumber: string;
  status: string;
};

export type NewCategoryCreate = {
  _id: string;
  catgName: string;
 description: string;
};

export type NewCusloyaltyCreate = {
  _id: string;
  itemName: string;
  offPercentage:string;
  discountName:string;
 description: string;
 status: 'active' | 'inactive';

};

export type NewRoleCreate = {
  _id: string;
   roleName: string;
  monthlySalary: string;
  allowances: string;
  deductions: string;
};

export type NewAppointmentCreate = {
  _id: string;
  customerID: {
    _id: string;
    firstName: string;
  };
  itemID: {
    _id: string;
    itemName: string;
  };
 date: string;
  time: string;
  firstName:string
  assignStatus:string;
status: string;

};
export type NewEmployeeCreate = {
  _id: string;
  firstName: string;
  lastName: string;
  nicNumber:string;
  role:string;
  gender:string;
  commissionAmount:string;
  email: string;
  phoneNumber: string;
   monthlySalary: string;
    allowances: string;
    finalSalarymonth: string;
  deductions: string;
  epf8month:  string;
epf12month:  string;
etf3month:  string;
apitTaxmonth:  string;


  status: string;

};
export type NewPaymentCreate = {
  _id: string;
 customerName: string;
 customerPhoneNumber?: string; // Optional phone number
 cashPaid?: string;
 wirePaid?: string;
services?: string;
 grandTotal: number;
 items:PaymentItem[];
 addLoyalty?: boolean;
  commission?: boolean;
  commissionAmount?: string;
 date: string;
quantity?: string;
discount: number;
 billDiscountPercentage?: number;
 billDiscountAmount?: number;
 total?: number;
};

export type StockActivity = {
  _id: string;
  itemId: string;
  itemName: string;
  amount: number;
  operationType: 'Stock-in' | 'Stock-out' | 'Returned-Stock-in';
  operationDate: string;
  paymentId?: string | null;
};

export type PaymentItem = {
  _id: string; // backend provides this
  itemId: string;
  itemName: string;
  quantity: number;
  itemPrice: number;
};


export type NewStockCreate = {
  [x: string]: any;
  numberOfBoxes: string;
  _id: string;
  metaId: string;
  customerId: string;
  customerName: string;
  batchNumber: string;
  billingType: string;
  numberOfUnit: string;
  totalWeight: string;
  perBox: string;
  rate: string;
  discount: string;
  discountRate: string;
  containerNumber: string;
  vehicaleNumber: string;
  currentWeight: string;
  date: string;
};
export type ViewStockCreate = {
  numberOfBoxes: string;
  _id: string;
  metaId: string;
  customerId: string;
  customerName: string;
  batchNumber: string;
  billingType: string;
  numberOfUnit: string;
  totalWeight: string;
  perBox: string;
  rate: string;
  containerNumber: string;
  vehicaleNumber: string;
  currentWeight: string;
  date: string;
};

export type NewStockView = {
  numberOfBoxes: string;
  _id: string;
  metaId: string;
  customerId: string;
  batchNumber: string;
  billingType: string;
  numberOfUnit: string;
  totalWeight: string;
  perBox: string;
  rate: string;
  containerNumber: string;
  vehicaleNumber: string;
  currentWeight: string;
  date: string;
  customerName: string;
};
export type NewAssesmentCreate = {
  _id: string;
  company_name: string;
  company_contact_first_name: string;
  company_contact_email: string;
  status: string;
};
export type IUserProfilePost = {
  id: string;
  author: {
    id: string;
    avatarUrl: string;
    name: string;
  };
  isLiked: boolean;
  createdAt: Date | string | number;
  media: string;
  message: string;
  personLikes: {
    name: string;
    avatarUrl: string;
  }[];
  comments: {
    id: string;
    author: {
      id: string;
      avatarUrl: string;
      name: string;
    };
    createdAt: Date | string | number;
    message: string;
  }[];
};

// ----------------------------------------------------------------------

export type IUserCard = {
  id: string;
  avatarUrl: string;
  cover: string;
  name: string;
  follower: number;
  following: number;
  totalPosts: number;
  role: string;
};

// ----------------------------------------------------------------------

export type IUserAccountGeneral = {
  id: string;
  avatarUrl: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  company: string;
  joinDate: string;
  isVerified: boolean;
  status: string;
  role: string;
};

export type NewUserCreate = {
  _id: string;
  userName: string;
  email: string;
  role: string;
  password: string;
  phoneNumber: string;
  district: string;
  status: string;
};

export type NewStudentCreate = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export type NewCompanyCreate = {
  _id: string;
  companyName: string;
  companyType: string;
  companyEmail: string;
  streetName: string;
  streetNumber: string;
  phoneNumber: string;
  industry: string;
  country: string;
};
export type NewAttendanceCreate = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
};
export type NewInvoiceBasicCreate = {
  id: string;
  section1: {
    id: number;
    name: string;
    value: number;
  }[];
  business_interuption: number;
  interuption_period: number;
  policy_limit: number;
};

export type NewInvoiceCreate = {
  additional_details: NewInvoiceCreate;
  _id: string;
  company_name: string;
  company_abn: string;
  company_email: string;
  street_no: string;
  street_name: string;
  country: string;
  suburb: string;
  state: string;
  location: string;
  postal_code: string;
  site_title: string;
  title: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  riskEngineer: string;
  riskEngineerTitle: string;
  dateOfSiteVisit: string;
  broker_contact_name: string;
  broker_job_title: string;
  broker_company: string;
  virtualRiskConsultation: boolean;
  extraConsultingTime: boolean;
  marketPresentation: boolean;
  bespokeRiskTraining: boolean;
  id: string;
  pdflink: string;
  downloadlink: string;
};

export type InvoiceCreate = {
  [x: string]: any;
  _id: string;
  invoice: {
    companyId: string;
    amount: string;
    invoice_status: string;
    pdf_files: string;
    signature: string;
    generated_pdf: string;
    signature_selection: string;
    digital_signature: string;
    name_on_signature: string;
  };
  additional_details: {
    company_name: string;
    company_abn: string;
    company_email: string;
    street_no: string;
    street_name: string;
    country: string;
    suburb: string;
    state: string;
    location: string;
    location_cost: number;
    postal_code: string;
    site_title: string;
    title: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phoneNumber: string;
    riskEngineer: string;
    riskEngineerTitle: string;
    dateOfSiteVisit: string;
    broker_contact_name: string;
    broker_job_title: string;
    broker_company: string;
    virtualRiskConsultation: boolean;
    extraConsultingTime: boolean;
    marketPresentation: boolean;
    bespokeRiskTraining: boolean;
  };
  basic_details: {
    section1: [
      {
        id: number;
        name: string;
        value: number;
      }
    ];
    agree: boolean;
    stiv_amount: number;
    business_interuption: number;
    interuption_period: number;
    policy_limit: number;
  };
  file_upload: {
    file_uploads: [
      {
        file_url: string;
      }
    ];
  };
  appointment: {
    appointment_date: Date;
    appointment_time: string;
  };
  disclaimer: {
    agree: boolean;
    signature_type: string;
    signature: string;
  };
  pdflink: string;
  downloadlink: string;
  form_number: number;
  createdAt: Date;
};

export type IJobAccountGeneral = {
  id: string;
  jobId: string;
  datePosted: string;
  applications: number;
  status: string;
  name: string;
};

export type TestimonialGeneral = {
  _id: string;
  name: string;
  heading: string;
  country: string;
  image: string;
  description: string;
  status: string;
};

export type ActivityGeneral = {
  _id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  discount: number;
  status: string;
};

export type ServiceGeneral = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  serviceType: string;
  status: string;
};

export type ProfileUpdate = {
  _id: string;
  name: string;
  type: string;
  logo: string;
  iframeLocation: string;
  navbarLocation: string;
  address: string;
  phoneNumber: string;
  email: string;
};

export type IUserAccountBillingCreditCard = {
  id: string;
  cardNumber: string;
  cardType: string;
};

export type IUserAccountBillingInvoice = {
  id: string;
  createdAt: Date | string | number;
  price: number;
};

export type IUserAccountBillingAddress = {
  id: string;
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  street: string;
  zipCode: string;
};

export type IUserAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

// ----------------------------------------------------------------------

export type IUserAccountNotificationSettings = {
  activityComments: boolean;
  activityAnswers: boolean;
  activityFollows: boolean;
  applicationNews: boolean;
  applicationProduct: boolean;
  applicationBlog: boolean;
};
