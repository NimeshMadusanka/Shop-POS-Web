import { useState } from 'react';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Stack, Card, InputAdornment, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../../../utils/axios';
import { IUserAccountChangePassword } from '../../../../@types/user';
import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../../components/hook-form';

type FormValuesProps = IUserAccountChangePassword;

export default function AccountChangePassword() {
    const [showPasswordOne, setShowPasswordOne] = useState(false);
    const [showPasswordTwo, setShowPasswordTwo] = useState(false);
    const [showPasswordThree, setShowPasswordThree] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
      .max(15, 'Password must be less than 15 characters')
      .required('Old Password is required'),
    newPassword: Yup.string()
      .required('New Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(15, 'Password must be less than 15 characters')
      .test(
        'no-match',
        'New password must be different than old password',
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const defaultValues = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
        const Payload = {
          oldPassword: data?.oldPassword,
          newPassword: data?.newPassword,
        }
        await axios.post(`/user/change-password`, Payload);
        enqueueSnackbar('Update success!');
        methods.reset();
    } catch (error) {
      enqueueSnackbar(error.message ??'Something went wrong!', {
        variant: 'warning',
      });
    }
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Stack spacing={3} alignItems="flex-end" sx={{ p: 3 }}>
          <RHFTextField name="oldPassword" 
            required
           type={showPasswordTwo ? 'text' : 'password'}
               InputProps={{
                 endAdornment: (
                   <InputAdornment position="end">
                     <IconButton onClick={() => setShowPasswordTwo(!showPasswordTwo)} edge="end">
                       <Iconify icon={showPasswordTwo ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                     </IconButton>
                   </InputAdornment>
                 ),
               }}
            label="Old Password" />
          <RHFTextField
            name="newPassword"
            label="New Password"
            required
             type={showPasswordOne ? 'text' : 'password'}
               InputProps={{
                 endAdornment: (
                   <InputAdornment position="end">
                     <IconButton onClick={() => setShowPasswordOne(!showPasswordOne)} edge="end">
                       <Iconify icon={showPasswordOne ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                     </IconButton>
                   </InputAdornment>
                 ),
               }}
            helperText={
              <Stack component="span" direction="row" alignItems="center">
                <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> Password must be
                minimum 8
              </Stack>
            }
          />
          <RHFTextField name="confirmNewPassword"
           required
           type={showPasswordThree ? 'text' : 'password'}
               InputProps={{
                 endAdornment: (
                   <InputAdornment position="end">
                     <IconButton onClick={() => setShowPasswordThree(!showPasswordThree)} edge="end">
                       <Iconify icon={showPasswordThree ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                     </IconButton>
                   </InputAdornment>
                 ),
               }}
            label="Confirm New Password" />
          <LoadingButton type="submit" variant="contained" 
            sx={{
              backgroundColor: "#1D355E",
              fontWeight: 500,
              letterSpacing: 0,
              opacity: 1,
              ":hover": {
                backgroundColor: "#1D355E",
              },
            }}
          loading={isSubmitting}
          disabled={!isDirty || !isValid}
          >
            Save Changes
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
