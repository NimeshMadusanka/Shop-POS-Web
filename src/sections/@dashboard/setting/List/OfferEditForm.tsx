import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getSettingData, updateOfferColors } from 'src/api/SettingUpdate';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Typography, Grid,  Stack} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ColouPicker from "../../../../pages/components/colorPicker/ColouPicker";
// components
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider from '../../../../components/hook-form';
// ----------------------------------------------------------------------

type FormValuesProps = {
  offersectionBackgroundColor:string;
  offergreatBackgroundColor:string;
  offergreatTextColor:string;
  offerbtntextColor:string;
  offerbtnbackgroundColor:string;
};

type Props = {
  isEdit?: boolean;
};


export default function OfferNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [offerData, setOfferData] = useState<FormValuesProps>();

  const [offersectionBackgroundColors, setOffersectionBackgroundColors] = useState("#000000");
  const [offergreatBackgroundColors, setOffergreatBackgroundColors] = useState("#000000");
  const [offergreatTextColors, setOffergreatTextColors] = useState("#000000");
  const [offerbtntextColors, setOfferbtntextColors] = useState("#000000");
  const [offerbtnbackgroundColors, setOfferbtnbackgroundColors] = useState("#000000");

    const UpdateUserSchema = Yup.object().shape({
      // offersectionBackgroundColor: Yup.string().required("Offersection background color is required"),
      // offergreatBackgroundColor: Yup.string().required("Offergreat background color is required"),
      // offergreatTextColor: Yup.string().required("Offergreat text color is required"),
      // offerbtntextColor: Yup.string().required("Offerbtn text color is required"),
      // offerbtnbackgroundColor: Yup.string().required("Offerbtn background color is required"),
    });
  
    const defaultValues = useMemo(
      () => ({
        offersectionBackgroundColor: offerData?.offersectionBackgroundColor ? offerData?.offersectionBackgroundColor : "",
        offergreatBackgroundColor:   offerData?.offergreatBackgroundColor ? offerData?.offergreatBackgroundColor : "",
        offergreatTextColor:  offerData?.offergreatTextColor ? offerData?.offergreatTextColor : "",
        offerbtntextColor: offerData?.offerbtntextColor ? offerData?.offerbtntextColor : "",
        offerbtnbackgroundColor: offerData?.offerbtnbackgroundColor ? offerData?.offerbtnbackgroundColor : "",
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [offerData]
    );
  
    const methods = useForm<FormValuesProps>({
      resolver: yupResolver(UpdateUserSchema),
    });
  
    const {
      reset,
      handleSubmit,
      formState: { isSubmitting },
    } = methods;
  
    const getOfferData = async() => {
      const data = await getSettingData();
      setOfferData(data?.property);
      setOffersectionBackgroundColors(data?.property?.offersectionBackgroundColor);
      setOffergreatBackgroundColors(data?.property?.offergreatBackgroundColor);
      setOffergreatTextColors(data?.property?.offergreatTextColor);
      setOfferbtntextColors(data?.property?.offerbtntextColor);
      setOfferbtnbackgroundColors(data?.property?.offerbtnbackgroundColor);
    } 
  
    const onSubmit = async (data: FormValuesProps) => {
      try {
          const payload = {
            offersectionBackgroundColor: offersectionBackgroundColors,
            offergreatBackgroundColor: offergreatBackgroundColors,
            offergreatTextColor: offergreatTextColors,
            offerbtntextColor: offerbtntextColors,
            offerbtnbackgroundColor: offerbtnbackgroundColors,
          };
  
          await updateOfferColors(payload);
          reset(defaultValues);
          enqueueSnackbar('Edit successfully!');
  
      } catch (error) {
        enqueueSnackbar(error.message ?? "Can't edit colors!", {
          variant: 'warning',
        });
      }
    };
  
    useEffect(() => {
      getOfferData()
    }, []);
  
    useEffect(() => {
      if (isEdit && offerData) {
        reset(defaultValues);
      }
      if (!isEdit) {
        reset(defaultValues);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ offerData]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={6}
              style={{
                display: "flex",
              }}
            >
              <Typography>Section background color: </Typography>
              <ColouPicker
                color={offersectionBackgroundColors}
                setColor={setOffersectionBackgroundColors}
              />
            </Grid>
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={6}
              style={{
                display: "flex",
              }}
            >
              <Typography>Great button color: </Typography>
              <ColouPicker
                color={offergreatBackgroundColors}
                setColor={setOffergreatBackgroundColors}
              />
            </Grid>{" "}
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={6}
              style={{
                display: "flex",
              }}
            >
              <Typography>Great button text color: </Typography>
              <ColouPicker
                color={offergreatTextColors}
                setColor={setOffergreatTextColors}
              />
            </Grid>{" "}
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={6}
              style={{
                display: "flex",
              }}
            >
              <Typography>Button text color: </Typography>
              <ColouPicker
                color={offerbtntextColors}
                setColor={setOfferbtntextColors}
              />
            </Grid>{" "}
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={6}
              style={{
                display: "flex",
              }}
            >
              <Typography>Button background color: </Typography>
              <ColouPicker
                color={offerbtnbackgroundColors}
                setColor={setOfferbtnbackgroundColors}
              />
            </Grid>{" "}
          </Grid>
          <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton 
              type="submit" 
              variant="contained" 
              loading={isSubmitting} 
              sx={{
                backgroundColor: "#36B37E",
                fontWeight: 500,
                letterSpacing: 0,
                opacity: 1,
                ":hover": {
                  backgroundColor: "#34E0A1",
                },
              }}
              >
              Save Changes
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
