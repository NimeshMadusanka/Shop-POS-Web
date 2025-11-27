import { Box, Button, Grid } from '@mui/material';

type Props = {
  pin: string;
  onPinChange: (pin: string) => void;
  maxLength?: number;
};

export default function PinNumberPad({ pin, onPinChange, maxLength = 6 }: Props) {
  const handleNumberClick = (num: string) => {
    if (pin.length < maxLength) {
      onPinChange(pin + num);
    }
  };

  const handleBackspace = () => {
    onPinChange(pin.slice(0, -1));
  };

  const handleClear = () => {
    onPinChange('');
  };

  return (
    <Box>
      {/* PIN Display Dots */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
          minHeight: 40,
          alignItems: 'center',
        }}
      >
        {Array.from({ length: maxLength }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: index < pin.length ? 'primary.main' : 'grey.300',
              bgcolor: index < pin.length ? 'primary.main' : 'transparent',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </Box>

      {/* Number Pad */}
      <Grid container spacing={1.5}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Grid item xs={4} key={num}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleNumberClick(num.toString())}
              disabled={pin.length >= maxLength}
              sx={{
                py: 2.5,
                fontSize: '1.5rem',
                fontWeight: 600,
                minHeight: 60,
                borderColor: 'grey.300',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
                '&:disabled': {
                  borderColor: 'grey.200',
                  color: 'grey.400',
                },
              }}
            >
              {num}
            </Button>
          </Grid>
        ))}
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClear}
            disabled={pin.length === 0}
            sx={{
              py: 2.5,
              fontSize: '0.9rem',
              fontWeight: 600,
              minHeight: 60,
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                borderColor: 'error.dark',
                bgcolor: 'error.lighter',
              },
              '&:disabled': {
                borderColor: 'grey.200',
                color: 'grey.400',
              },
            }}
          >
            Clear
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleNumberClick('0')}
            disabled={pin.length >= maxLength}
            sx={{
              py: 2.5,
              fontSize: '1.5rem',
              fontWeight: 600,
              minHeight: 60,
              borderColor: 'grey.300',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
              },
              '&:disabled': {
                borderColor: 'grey.200',
                color: 'grey.400',
              },
            }}
          >
            0
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleBackspace}
            disabled={pin.length === 0}
            sx={{
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 600,
              minHeight: 60,
              borderColor: 'grey.300',
              '&:hover': {
                borderColor: 'warning.main',
                bgcolor: 'warning.lighter',
              },
              '&:disabled': {
                borderColor: 'grey.200',
                color: 'grey.400',
              },
            }}
          >
            ⌫
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

