import { Helmet } from 'react-helmet-async';
import CashierPaymentView from '../../sections/@dashboard/cashier/CashierPaymentView';

// ----------------------------------------------------------------------

export default function CashierPage() {
  return (
    <>
      <Helmet>
        <title> Cashier | POS System </title>
      </Helmet>

      <CashierPaymentView />
    </>
  );
}

