import * as Yup from 'yup';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { companyTopUpApi, getWalletBalance } from 'src/api/BillingApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';

// @types
import { BillingGeneral } from '../../../@types/billing';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect, } from '../../../components/hook-form';
import ImageUpload from "../../../pages/components/imageUpload/ImageUpload";

// ----------------------------------------------------------------------

type FormValuesProps = {
  attachment: string;
  reference: string;
  paidAmount: string;
};
type Props = {
  isEdit?: boolean;
  billingData?: BillingGeneral;
};

const amounts = [
  {
    label: "Select amount",
  },
  {
    label: '5000 AUD',
    value: 5000,
  },
  {
    label: '10000 AUD',
    value: 10000,
  },
  {
    label: '15000 AUD',
    value: 15000,
  },
  {
    label: '20000 AUD',
    value: 20000,
  },
  {
    label: '25000 AUD',
    value: 25000,
  },
  {
    label: '30000 AUD',
    value: 30000,
  },
  {
    label: '60000 AUD',
    value: 60000,
  },
];

export default function TestimonialEditForm({ isEdit = false, billingData }: Props) {
  const [walletBalance, setWalletBalance] = useState();
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const BillingSchema = Yup.object().shape({
    reference: Yup.string().required('Reference is required').min(3, "Min length for the reference is 3.").max(150, "Max length for the reference is 150."),
    paidAmount: Yup.string().required('Amount is required'),
  });


  const defaultValues = useMemo(
    () => ({
      paidAmount: billingData?.paidAmount ? billingData?.paidAmount : "",
      reference: billingData?.reference ? billingData?.reference : "",
      attachment: billingData?.attachment ? billingData?.attachment : "",
    }),

    [billingData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(BillingSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && billingData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, billingData, defaultValues, reset]);

  const onSubmit = async (data: FormValuesProps) => {
    setLoading(true);
    try {
        const payload = {
          reference: data?.reference,
          paidAmount: data?.paidAmount,
          attachment,
        };

          await companyTopUpApi(payload);
          reset(defaultValues);
          enqueueSnackbar('Payment successfully added to the review!');
          setLoading(false);
    } catch (error) {
      enqueueSnackbar(error.message ??'Something went wrong!', {
        variant: 'warning',
      });
      setLoading(false);
    }
  };

  const loadBalancd = useCallback(async () => {
    try {
      const data = await getWalletBalance()

      setWalletBalance(data);
    } catch (error) {
      enqueueSnackbar("Something went wrong!", {
        variant: 'warning',
      })
    }
   }
  , [enqueueSnackbar]);

  useEffect(() => {
      loadBalancd();
  }, [loadBalancd])

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Typography variant="h6" gutterBottom>
            Your wallet balance is {walletBalance} AUD
          </Typography>
          <Card sx={{ p: 3 }}>
            <Stack direction="column" spacing={2}>
              <Grid item lg={6} md={6} sm={6} xs={12} mb={5}>
                <Typography gutterBottom>Upload image of your slip *</Typography>
                <ImageUpload setImage={setAttachment} image={attachment} name="image1" />
              </Grid>
              <RHFTextField multiline rows={2} maxRows={4} name="reference" label="Reference *" />
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFSelect native name="paidAmount" label="Amount *" placeholder="Amount">
                  {amounts?.map((valueItem) => (
                    <option key={valueItem?.value} value={valueItem?.value}>
                      {valueItem?.label}
                    </option>
                  ))}
                </RHFSelect>
              </Box>
            </Stack>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting || loading}
                sx={{
                  backgroundColor: '#36B37E',
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ':hover': {
                    backgroundColor: '#34E0A1',
                  },
                }}
              >
                Top Up
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
