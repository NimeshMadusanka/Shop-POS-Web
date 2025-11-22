import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { createRoleApi, updateRoleApi } from 'src/api/RoleApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack } from '@mui/material';
// @types
import { NewRoleCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useAuthContext } from 'src/auth/useAuthContext';
// ----------------------------------------------------------------------

type FormValuesProps = {
  roleName: string;
  description: string;
  monthlySalary: string;
  allowances: string;
  deductions: string;
  id: string;
};
type Props = {
  isEdit?: boolean;
  userData?: NewRoleCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    roleName: Yup.string()
      .trim()
      .required('Category Name is required')
      .min(3, 'Must be at least 3 characters')
      .max(50, 'Must be 50 characters or less'),
    monthlySalary: Yup.number()
      .typeError('Monthly salary must be a valid number')
      .required('Monthly salary is required')
      .min(1000, 'Monthly salary must be at least 1,000')
      .max(1000000, 'Monthly salary must be less than 1,000,000'),

    allowances: Yup.number()
      .typeError('Allowance must be a valid number')
      .min(0, 'Allowance cannot be negative')
      .nullable(),

    deductions: Yup.number()
      .typeError(' deduction must be a valid number')
      .min(0, 'Loan deduction cannot be negative')
      .nullable(),
  });

  const defaultValues = useMemo(
  () => ({
    roleName: userData?.roleName || '',
    
    monthlySalary: userData?.monthlySalary ?? '', // Use nullish coalescing
    allowances: userData?.allowances ?? '',
    deductions: userData?.deductions ?? '',
    id: userData?._id || '',
  }),
  [userData]
);


  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && userData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, userData]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Destructure the properties from the data object
      const { roleName,  monthlySalary, allowances, deductions, id } = data;

      const payload = {
        roleName,   
        companyID,
        monthlySalary,
        allowances,
        deductions,
      };

      if (isEdit) {
        await updateRoleApi(payload, id, true);
      } else {
        await createRoleApi(payload, true);
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.role.list);
      enqueueSnackbar('Create successfully!');
    } catch (error) {
      enqueueSnackbar(error.message ?? 'Error creating account!', {
        variant: 'warning',
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
  <Card
    sx={{
      p: 4,
      width: '100%',
      maxWidth: '100%',
    }}
  >
    <Grid container direction="column" spacing={4}>
      {/* Role Name */}
      <Grid item xs={12}>
        <RHFTextField
          required
          name="roleName"
          label="Role"
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              height: 100,
              fontSize: '25px',
              borderRadius: '12px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '25px',
            },
          }}
        />
      </Grid>

      {/* Monthly Salary */}
      <Grid item xs={12}>
        <RHFTextField
          required
          name="monthlySalary"
          label="Monthly Salary"
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              height: 100,
              fontSize: '25px',
              borderRadius: '12px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '25px',
            },
          }}
        />
      </Grid>

      {/* Allowances */}
      <Grid item xs={12}>
        <RHFTextField
          required
          name="allowances"
          label="Allowances"
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              height: 100,
              fontSize: '25px',
              borderRadius: '12px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '25px',
            },
          }}
        />
      </Grid>

      {/* Deductions */}
      <Grid item xs={12}>
        <RHFTextField
          required
          name="deductions"
          label="Deductions"
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              height: 100,
              fontSize: '25px',
              borderRadius: '12px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '25px',
            },
          }}
        />
      </Grid>
    </Grid>

    {/* Submit Button */}
    <Box mt={4} display="flex" justifyContent="flex-end">
      <LoadingButton
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{
          px: 4,
          py: 2.5,
          fontSize: '22px',
          borderRadius: '14px',
          backgroundColor: '#0066CC',
          ':hover': {
            backgroundColor: '#6E9FC1',
            color: '#ffffff',
          },
        }}
      >
        {!isEdit ? 'Create Role' : 'Save Changes'}
      </LoadingButton>
    </Box>
  </Card>
</FormProvider>

  );
}
