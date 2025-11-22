import {
  Stack,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';

// components
import Label from '../../../../components/label';


type Props = {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function AssesmentTableRow({ row, selected, onSelectRow, onDeleteRow }: Props) {
  const { assessment, status } = row;
  
  

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {assessment.company_name}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="left">{assessment.company_contact_first_name}</TableCell>
      <TableCell align="left">{assessment.company_contact_email}</TableCell>
      <TableCell align="left">
        <Label
          variant="soft"
          color={(status === 'banned' && 'error') || 'success'}
          sx={{ textTransform: 'capitalize', color: '#1D355E' }}
        >
          {status}
        </Label>
      </TableCell>

   
      
    </TableRow>
  );
}
