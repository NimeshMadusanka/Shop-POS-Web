import { Dayjs } from 'dayjs';

export type OfferGeneral = {
    _id: string;
    name: string;
    discount: number;
    perPerson: number;
    memberCount: number;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    price: number;
    description: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    image5: string;
    status: string;
  };