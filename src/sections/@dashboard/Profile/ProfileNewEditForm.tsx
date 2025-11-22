import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getData, updateProfile } from 'src/api/UpdateApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Card, Stack} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import axios from '../../../utils/axios';
import ImageUpload from "../../../pages/components/imageUpload/ImageUpload";
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from '../../../components/hook-form';
import Loader from '../../../components/loading-screen';
// ----------------------------------------------------------------------

type FormValuesProps = {
  name:string;
  type:string;
  logo: string;
  iframeLocation: string;
  navbarLocation:string;
  address:string;
  phoneNumber: string;
  email: string;
  district: string;
  facebookLink:  string;
  instagramLink:  string;
  twitterLink:  string;
  websiteLink:  string;
  maplink:  string;
  description:  string;
  facility:  any;
};

type Props = {
  isEdit?: boolean;
};

export default function ProfileNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [profileData, setProfileData] = useState<FormValuesProps>();
  const [logo, setLogo] = useState('');
  const [dataLoad, setDataLoad] = useState(false);
  const [facility, setFacility] = useState([]);

  const type = [
    { text: "Hotel", value: "hotel" },
    { text: "Villa", value: "villa" },
  ];

  const district = [
    {
      value: 'Colombo',
      text: 'Colombo',
    },
    {
      value: 'Gampaha',
      text: 'Gampaha',
    },
    {
      value: 'Kalutara',
      text: 'Kalutara',
    },
    {
      value: 'Kandy',
      text: 'Kandy',
    },
    {
      value: 'Matale',
      text: 'Matale',
    },    
    {
      value: 'Nuwara-Eliya',
      text: 'Nuwara-Eliya',
    },    
    {
      value: 'Galle',
      text: 'Galle',
    },    
    {
      value: 'Matara',
      text: 'Matara',
    },    
    {
      value: 'Hambantota',
      text: 'Hambantota',
    },    
    {
      value: 'Kilinochchi',
      text: 'Kilinochchi',
    },    
    {
      value: 'Mannar',
      text: 'Mannar',
    },    
    {
      value: 'Vavuniya',
      text: 'Vavuniya',
    },    
    {
      value: 'Mullaitivu',
      text: 'Mullaitivu',
    },    
    {
      value: 'Batticaloa',
      text: 'Batticaloa',
    },    
    {
      value: 'Ampara',
      text: 'Ampara',
    },    
    {
      value: 'Trincomalee',
      text: 'Trincomalee',
    },   
    {
      value: 'Kurunegala',
      text: 'Kurunegala',
    },   
    {
      value: 'Puttalam',
      text: 'Puttalam',
    },    
    {
      value: 'Anuradhapura',
      text: 'Anuradhapura',
    },    
    {
      value: 'Polonnaruwa',
      text: 'Polonnaruwa',
    },    
    {
      value: 'Badulla',
      text: 'Badulla',
    },    
    {
      value: 'Moneragala',
      text: 'Moneragala',
    },    
    {
      value: 'Ratnapura',
      text: 'Ratnapura',
    },   
    {
      value: 'Kegalle',
      text: 'Kegalle',
    }, 
  ];

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().trim().min(3,'Name must be at least 3 characters')
    .max(30,'Name must be less than 30 characters').required('Name is required'),
    type: Yup.string().required("Type is required"),
    iframeLocation: Yup.string().required("Iframe location is required"),
    navbarLocation: Yup.string().min(3,'Navigation bar location must be at least 3 characters')
    .max(30,'Navigation bar location must be less than 30 characters').required("Navigation bar location is required"),
    district: Yup.string().required("District is required"),
    address: Yup.string().min(3,'Address must be at least 3 characters').max(250,'Address must be less than 250 characters').required("Address is required"),
    phoneNumber: Yup.string().required("Phone number is required.")
    .matches(/^07\d{8}$/,"Please enter a valid mobile number"),
  });


  const defaultValues = useMemo(
    () => ({
      name: profileData?.name ? profileData?.name : "",
      type:   profileData?.type ? profileData?.type : "",
      iframeLocation:  profileData?.iframeLocation ? profileData?.iframeLocation : "",
      navbarLocation: profileData?.navbarLocation ? profileData?.navbarLocation : "",
      district: profileData?.district ? profileData?.district : "",
      address:   profileData?.address ? profileData?.address : "",
      phoneNumber:   profileData?.phoneNumber ? profileData?.phoneNumber : "",
      email:  profileData?.email ? profileData?.email : "",
      logo:   profileData?.logo ? profileData?.logo : "",
      facebookLink:   profileData?.facebookLink ? profileData?.facebookLink : "",
      instagramLink:   profileData?.instagramLink ? profileData?.instagramLink : "",
      twitterLink:   profileData?.twitterLink ? profileData?.twitterLink : "",
      websiteLink:  profileData?.websiteLink ? profileData?.websiteLink : "",
      maplink:   profileData?.maplink ? profileData?.maplink : "",
      description:   profileData?.description ? profileData?.description : "",
      facility:  profileData?.facility ? profileData?.facility  : [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profileData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const getProfileData = async() => {
    setDataLoad(true);
    const data = await getData();
    setLogo(data?.logo);
    setProfileData(data);
    setDataLoad(false);
  } 

  const get = async () => {
    try {
      const { data } = await axios.get(`/facility/`);
      if (profileData?.facility?.length) {
        const getStatus = (item: any) => {
          const fac = profileData.facility || [];
          // @ts-ignore
          const status = fac.find((i: any) => i.facilityId === item);

          if (status) {
            return true;
          }
          return false;
        };
        const modify = data.map((item: any) => ({ ...item, checked: getStatus(item._id) }));
        setFacility(modify);
      } else {
        setFacility(data);
      }
    } catch (error) {
      enqueueSnackbar(error.message ?? 'Something went wrong!', {
        variant: 'warning',
      });
    }
  };

  const changeFacility = (id: any, checked: any) => {
    const modify: any = facility.map((item: any) => {
      if (item._id === id) {
        return { ...item, checked: !checked };
      }
      return item;
    });
    setFacility(modify);
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const modify = facility
      .filter((i:any) => i.checked)
      .map((item:any)  => ({
          facilityId: item._id,
          icon: item.icon,
          name: item.name,
        })
      );

        const payload = {
          name: data?.name,
          type: data?.type,
          iframeLocation: data?.iframeLocation,
          navbarLocation: data?.navbarLocation,
          district: data?.district,
          address: data?.address,
          phoneNumber: data?.phoneNumber,
          email: data?.email,
          logo,
          facebookLink: data?.facebookLink,
          instagramLink: data?.instagramLink,
          twitterLink: data?.twitterLink,
          websiteLink: data?.websiteLink,
          maplink: data?.maplink,
          description: data?.description,
          facility: modify,
        };
        await updateProfile(payload);
        reset(defaultValues);
        enqueueSnackbar('Edit successfully!');
        getProfileData()
        get();
    } catch (error) {
      enqueueSnackbar(error.message ?? "Something went wrong. can't edit profile!", {
        variant: 'warning',
      });
    }
  };

  useEffect(() => {
    getProfileData()
  }, []);

  useEffect(() => {
    if (isEdit && profileData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ profileData]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {dataLoad ? (
        <Loader/>
      ):(
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
              marginBottom={2.5}
            >
              <RHFTextField name="name" placeholder="Name" label="Name" />
              <RHFSelect native name="type"  placeholder="Type" label="Type" >
                {type?.map((item) => (
                  <option key={item?.value} value={item?.value}>
                    {item?.value}
                  </option>
                ))}
              </RHFSelect>
              <RHFTextField name="iframeLocation" placeholder="Iframe location" label="Iframe location"/>
              <RHFTextField name="navbarLocation" placeholder="Navigation bar Location" label="Navigation bar location" />
              <RHFSelect native name="district" label="District *" placeholder="district">
                {district?.map((item) => (
                  <option key={item?.value} value={item?.value}>
                    {item?.value}
                  </option>
                ))}
              </RHFSelect>

            
              <RHFTextField name="phoneNumber" placeholder="Phone number" label="Phone number" />
              <RHFTextField name="email" placeholder="Email" label="Email"/>
              <RHFTextField name="facebookLink" placeholder="Facebook link" label="Facebook link"/>
              <RHFTextField name="instagramLink" placeholder="Instagram link" label="Instagram link"/>
              <RHFTextField name="twitterLink" placeholder="Twitter link" label="Twitter link"/>
              <RHFTextField name="websiteLink" placeholder="Website link" label="Website link"/>
              <RHFTextField name="maplink" placeholder="Map link" label="Map link"/>
              <RHFTextField name="address" placeholder="Address" label="Address" multiline rows={3} />
              <RHFTextField name="description" placeholder="Description" label="Description" multiline rows={3} />
            </Box>
            <FormGroup row>
              {facility.map((item: any, index: any) => (
                <FormControlLabel
                  // @ts-ignore
                  index={index}
                  control={
                    <Checkbox
                      checked={item?.checked || false}
                      onChange={() => {
                        changeFacility(item._id, item.checked);
                      }}
                      name="checkedA"
                      color="primary"
                    />
                  }
                  label={item.name}
                />
              ))}
            </FormGroup>
            <Grid container pb={2} display="flex">
                <Grid item lg={8} md={8} sm={10} xs={12} mb={5}>
                  <ImageUpload setImage={setLogo} image={logo} />
                </Grid>
              </Grid>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton 
                sx={{
                  backgroundColor: "#36B37E",
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ":hover": {
                    backgroundColor: "#34E0A1",
                  },
                }}
                type="submit" 
                variant="contained" 
                loading={isSubmitting} >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      )}
    </FormProvider>
  );
}
