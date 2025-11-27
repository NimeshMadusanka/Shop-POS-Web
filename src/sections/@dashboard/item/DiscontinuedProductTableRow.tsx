import { useState } from 'react';
import { TableRow, TableCell, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Divider, Stack } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

type Props = {
  row: {
    _id: string;
    itemName: string;
    itemCategory: string;
    brandName?: string;
    discontinuedAt?: string | Date | null;
    provider?: {
      providerName: string;
      contactEmail: string;
      contactPhone: string;
    } | null;
  };
  selected: boolean;
  onSelectRow: VoidFunction;
};

export default function DiscontinuedProductTableRow({ row, selected, onSelectRow }: Props) {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { itemName, itemCategory, brandName, discontinuedAt, provider } = row;

  const handleOpenDetails = () => {
    setOpenDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell onClick={onSelectRow} sx={{ cursor: 'pointer' }}>
          <Typography variant="subtitle2" noWrap>
            {itemName}
          </Typography>
        </TableCell>

        <TableCell align="left">{itemCategory || 'N/A'}</TableCell>
        
        <TableCell align="left">{brandName || '-'}</TableCell>

        <TableCell align="left">{formatDate(discontinuedAt)}</TableCell>

        <TableCell align="center">
          <IconButton
            color="primary"
            onClick={handleOpenDetails}
            title="View Details"
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Discontinued Product Details</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Item Name
                </Typography>
                <Typography variant="body1">{itemName}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Brand
                </Typography>
                <Typography variant="body1">{brandName || '-'}</Typography>
              </Box>

              <Divider />

              {provider ? (
                <>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Provider Name
                    </Typography>
                    <Typography variant="body1">{provider.providerName}</Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Provider Contact
                    </Typography>
                    <Typography variant="body1">{provider.contactPhone}</Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Provider Email
                    </Typography>
                    <Typography variant="body1">{provider.contactEmail}</Typography>
                  </Box>
                </>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Provider information not available
                  </Typography>
                </Box>
              )}

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Discontinued Date
                </Typography>
                <Typography variant="body1">{formatDate(discontinuedAt)}</Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

