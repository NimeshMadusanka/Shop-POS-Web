import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getSettingData, updateSearchBarColors } from 'src/api/SettingUpdate';
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
  searchBaractiveButtonColor:string;
  searchBaractiveTextColor:string;
  searchBardefaultButtonColor:string;
  searchBardefaultTextColor:string;
};

type Props = {
  isEdit?: boolean;
};


export default function SearchBarNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [searchBarColorData, setSearchBarColorData] = useState<FormValuesProps>();

  const [searchBaractiveButtonColors, setSearchBaractiveButtonColors] = useState("#000000");
  const [searchBaractiveTextColors, setSearchBaractiveTextColors] = useState("#000000");
  const [searchBardefaultButtonColors, setSearchBardefaultButtonColors] = useState("#000000");
  const [searchBardefaultTextColors, setSearchBardefaultTextColors] = useState("#000000");

    const UpdateUserSchema = Yup.object().shape({
      // searchBaractiveButtonColor: Yup.string().required("SearchBar active button color is required"),
      // searchBaractiveTextColor: Yup.string().required("SearchBar active text color is required"),
      // searchBardefaultButtonColor: Yup.string().required("SearchBar default button color is required"),
      // searchBardefaultTextColor: Yup.string().required("SearchBar default text color is required"),
    });
  
    const defaultValues = useMemo(
      () => ({
        searchBaractiveButtonColor: searchBarColorData?.searchBaractiveButtonColor ? searchBarColorData?.searchBaractiveButtonColor : "",
        searchBaractiveTextColor:   searchBarColorData?.searchBaractiveTextColor ? searchBarColorData?.searchBaractiveTextColor : "",
        searchBardefaultButtonColor:  searchBarColorData?.searchBardefaultButtonColor ? searchBarColorData?.searchBardefaultButtonColor : "",
        searchBardefaultTextColor: searchBarColorData?.searchBardefaultTextColor ? searchBarColorData?.searchBardefaultTextColor : "",
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [searchBarColorData]
    );
  
    const methods = useForm<FormValuesProps>({
      resolver: yupResolver(UpdateUserSchema),
    });
  
    const {
      reset,
      handleSubmit,
      formState: { isSubmitting },
    } = methods;
  
    const getSearchBarColorData = async() => {
      const data = await getSettingData();
      setSearchBarColorData(data?.property);
      setSearchBaractiveButtonColors(data?.property?.searchBaractiveButtonColor);
      setSearchBaractiveTextColors(data?.property?.searchBaractiveTextColor);
      setSearchBardefaultButtonColors(data?.property?.searchBardefaultButtonColor);
      setSearchBardefaultTextColors(data?.property?.searchBardefaultTextColor);
    } 
  
    const onSubmit = async (data: FormValuesProps) => {
      try {
          const payload = {
            searchBaractiveButtonColor: searchBaractiveButtonColors,
            searchBaractiveTextColor: searchBaractiveTextColors,
            searchBardefaultButtonColor: searchBardefaultButtonColors,
            searchBardefaultTextColor: searchBardefaultTextColors,
          };
  
          await updateSearchBarColors(payload);
          reset(defaultValues);
          enqueueSnackbar('Edit successfully!');
  
      } catch (error) {
        enqueueSnackbar(error.message ?? "Can't edit colors!", {
          variant: 'warning',
        });
      }
    };
  
    useEffect(() => {
      getSearchBarColorData()
    }, []);
  
    useEffect(() => {
      if (isEdit && searchBarColorData) {
        reset(defaultValues);
      }
      if (!isEdit) {
        reset(defaultValues);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ searchBarColorData]);

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
              <Typography>Active button color: </Typography>
              <ColouPicker
                color={searchBaractiveButtonColors}
                setColor={setSearchBaractiveButtonColors}
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
              <Typography>Active button text color: </Typography>
              <ColouPicker
                color={searchBaractiveTextColors}
                setColor={setSearchBaractiveTextColors}
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
              <Typography>Default button color: </Typography>
              <ColouPicker
                color={searchBardefaultButtonColors}
                setColor={setSearchBardefaultButtonColors}
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
              <Typography>Default button text color: </Typography>
              <ColouPicker
                color={searchBardefaultTextColors}
                setColor={setSearchBardefaultTextColors}
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
