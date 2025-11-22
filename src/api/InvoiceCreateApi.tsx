import axios from 'src/utils/axios';

type CreateInvoice = {
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
};
type CreateBasicInvoice = {
  section1: {
    id: number;
    name: string;
    value: number;
  }[];
  business_interuption: number;
  interuption_period: number;
  policy_limit: number;
};
type CreateAppointmentInvoice = {
  appointment_date: any;
  appointment_time: string;
};
type Disclaimer = {
  agree: boolean;
};
type Signature = {
  signature: string;
};
type FileUploadValuesProps = {
  file_uploads: {
    file_url: string;
  }[];
};

const createInvoiceApi = async (payload: CreateInvoice, boolValue: boolean) => {
  const response = await axios.post(`/invoice/`, payload);
  localStorage.setItem('invoiceId', response.data.id);
  await axios.put(`/invoice/page/${response.data.id}`, {
    form_number: 2,
  });
  return response;
};

const updateInvoiceApi = async (payload: CreateInvoice, id: string, boolValue: boolean) => {
  const response = await axios.put(`/invoice/additional-details/${id}`, payload);
  await axios.put(`/invoice/page/${id}`, {
    form_number: 2,
  });
  return response?.data;
};

const updateInvoiceDeclaredApi = async (
  payload: CreateBasicInvoice,
  id: string,
  boolValue: boolean
) => {
  const response = await axios.put(`/invoice/basic_details/${id}`, payload);
  await axios.put(`/invoice/page/${id}`, {
    form_number: 3,
  });
  return response?.data;
};

const updateFileUploadApi = async (
  payload: FileUploadValuesProps,
  id: string,
  boolValue: boolean
) => {
  const response = await axios.put(`/invoice/file_uploads/${id}`, payload);
  await axios.put(`/invoice/page/${id}`, {
    form_number: 4,
  });
  return response?.data;
};

const updateAppointmentApi = async (
  payload: CreateAppointmentInvoice,
  id: string,
  boolValue: boolean
) => {
  const response = await axios.put(`/invoice/appointment/${id}`, payload);
  await axios.put(`/invoice/page/${id}`, {
    form_number: 5,
  });
  return response?.data;
};

const updateDisclaimer = async (id: string, agree: Disclaimer) => {
  const response = await axios.put(`/invoice/disclaimer/${id}`, agree);
  return response?.data;
};

const updateSignature = async (id: string, signature: Signature) => {
  const response = await axios.put(`/invoice/signature/${id}`, signature);
  await axios.put(`/invoice/page/${id}`, {
    form_number: 7,
  });
  return response?.data;
};

const getInvoiceData = async () => {
  const response = await axios.get(`/invoice/list/`);
  return response?.data;
};
const get = async () => {
  const invoiceId = localStorage.getItem('invoiceId');

  if (invoiceId) {
    try {
      const invoiceData = await axios.get(`/invoice/${invoiceId}`);
      return invoiceData?.data;
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    }
  } else {
    console.error('Invoice ID is missing from localStorage.');
  }
};
const handleNext = async (formnumber: number) => {
  const invoiceId = localStorage.getItem('invoiceId');

  if (invoiceId) {
    const step = await axios.put(`/invoice/page/${invoiceId}`, {
      form_number: formnumber + 1,
    });
    return step;
  }
};
const handleBack = async (formnumber: number) => {
  const invoiceId = localStorage.getItem('invoiceId');

  if (invoiceId) {
    const step = await axios.put(`/invoice/page/${invoiceId}`, {
      form_number: formnumber - 1,
    });
    return step;
  }
};
export {
  get,
  getInvoiceData,
  createInvoiceApi,
  updateInvoiceApi,
  updateInvoiceDeclaredApi,
  updateFileUploadApi,
  updateAppointmentApi,
  handleNext,
  handleBack,
  updateDisclaimer,
  updateSignature,
};
