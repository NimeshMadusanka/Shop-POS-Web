import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
// import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import ImageUpload from "../../pages/components/imageUpload/ImageUpload";
import { LoadingButton } from '@mui/lab';
import { Stack, Alert, InputAdornment, IconButton } from '@mui/material';
import { useLocation } from 'react-router';
import Iconify from '../../components/iconify';
import { createSignupCompanyApi } from 'src/api/CompanyApi';
import { useSnackbar } from '../../components/snackbar';
import { PATH_AUTH } from '../../routes/paths';

import FormProvider, { RHFTextField } from '../../components/hook-form';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

type FormValuesProps = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  companyID: string;
  companyName: string;
  regNo: string;
  industry: string;
  role: string;
  userId?: string;
  salonImage?: File | null; 
  afterSubmit?: string;
};

export default function AuthEmployeeSignup() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const location = useLocation();
  const employeeSignupSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    phoneNumber: Yup.string()
      .required('Phone Number is required')
      .matches(/^[0-9]{10}$/, 'Phone Number must be exactly 10 digits'),
    // email: Yup.string().required('Email is required').email('Invalid email'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(15, 'Password must be less than 15 characters')
      .required('Password is required'),
    companyName: Yup.string().required('Company Name is required'),
    regNo: Yup.string().required('Company ID is required'),
    industry: Yup.string().required('Industry is required'),
   
  });

  const defaultValues = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    console.log('query', queryParams.get('userId'));
    return {
      firstName: queryParams.get('firstName') || '',
      lastName: queryParams.get('lastName') || '',
      phoneNumber: '',
      email: queryParams.get('email') || '',
      password: '',
      companyID: queryParams.get('companyID') || '',
      companyName: queryParams.get('companyName') || '',
      regNo: queryParams.get('regNo') || '',
      industry: '',
      role: queryParams.get('role') || '',
      employee: Boolean(queryParams.get('employee') === 'true'),
      userId: queryParams.get('userId') || '',
    };
  }, [location.search]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(employeeSignupSchema),
    defaultValues,
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 1 && step === 1) {
      if (methods.formState.isDirty) {
        setStep(2);
      } else {
        setValue(0);
      }
    } else {
      setValue(newValue);
    }
  };

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = methods;

 

  const onSubmit = async (data: FormValuesProps) => {
    
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        regNo: data.regNo,
        industry: data.industry,
        role: data.role || '',
       salonImage: typeof data.salonImage === "string" ? data.salonImage : "", 
        companyID: data.companyID || '',
      };

    

await createSignupCompanyApi(payload, false);


      enqueueSnackbar('Signup successful! Please log in.', { variant: 'success' });
      navigate(PATH_AUTH.login);
      reset(defaultValues);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';

      // Match backend error messages exactly
      if (errorMessage === 'Email already exists!') {
        enqueueSnackbar('Email already exists.', { variant: 'warning' });
        setError('email', { message: 'Email already exists' });
      } else if (errorMessage === 'Company name already exists!') {
        enqueueSnackbar('Company already exists.', { variant: 'warning' });
        setError('companyName', { message: 'Company name already exists' });
      } else if (errorMessage === 'Registration number already exists!') {
        enqueueSnackbar('Company already exists.', { variant: 'warning' });
        setError('regNo', { message: 'Registration number already exists' });
      } else {
        enqueueSnackbar('Signup failed. Please try again.', { variant: 'error' });
        setError('afterSubmit', { message: errorMessage });
      }

      // Keep entered form values but reset error states
      reset(undefined, { keepValues: true });
    }
  };






  useEffect(() => {
    methods.reset(defaultValues);
  }, [location.search, methods, defaultValues]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.email && <Alert severity="error">{errors.email.message}</Alert>}
        {!!errors.regNo && <Alert severity="error">{errors.regNo.message}</Alert>}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
              sx={{
                '& .MuiTabs-indicator': { backgroundColor: '#a9702e' },
              }}
            >
              <Tab label="User Register" {...a11yProps(0)} sx={{ color: '#333333' }} />
              <Tab label="Company Info" {...a11yProps(1)} sx={{ color: '#333333' }} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Box sx={{ mb: 2 }}>
              <RHFTextField required name="firstName" label="First Name" />
            </Box>
            <Box sx={{ mb: 2 }}>
              <RHFTextField required name="lastName" label="Last Name" />
            </Box>
            <Box sx={{ mb: 2 }}>
              <RHFTextField required name="email" label="Email" />
            </Box>
            <Box sx={{ mb: 2 }}>
              <RHFTextField required name="phoneNumber" label="Phone Number" />
            </Box>
            <Box sx={{ mb: 2 }}>
              {/* <RHFTextField required name="password" label="Password" /> */}
              <RHFTextField
                name="password"
                label="Password"
                required
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '2px 12px',
                    fontSize: '14px',
                  },
                }}
              />
            </Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'right' }}>
              <LoadingButton
                onClick={() => setValue(1)}
                sx={{
                  bgcolor: '#0066CC',
                  color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                  '&:hover': {
                    backgroundColor: '#6E9FC1',
                    color: '#ffffff',
                  },
                }}
              >
                Next
              </LoadingButton>
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Box sx={{ mb: 2 }}>
              <RHFTextField required name="companyName" label="Company Name" />
            </Box>
            <Box sx={{ mb: 2 }}>
              <RHFTextField required name="regNo" label="Register Number" />
            </Box>
            <Box sx={{ mb: 2 }}>
              <RHFTextField required name="industry" label="Industry" />
            </Box>
         <ImageUpload 
  image={image} 
  setImage={(file: File) => {
    setImage(file);
    methods.setValue('salonImage', file); // <-- update RHF form value
  }} 
/>


            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <LoadingButton
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#0066CC',
                  color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                  '&:hover': {
                    backgroundColor: '#6E9FC1',
                    color: '#ffffff',
                  },
                }}
              >
                Submit
                {/* {!isEdit ? 'Submit' : 'Save Changes'} */}
              </LoadingButton>
            </Box>
          </CustomTabPanel>
        </Box>
      </Stack>
    </FormProvider>
  );
}

