import { ApexOptions } from 'apexcharts';
// @mui
import { Card, CardHeader, Box, CardProps } from '@mui/material';
// components
import Chart, { useChart } from '../../../../components/chart';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    labels: string[];
    colors?: string[];
    series: {
      name: string;
      type: string;
      fill?: string;
      data: number[];
    }[];
    options?: ApexOptions;
    xAxisLabel?: string; // Add x-axis label prop
    yAxisLabel?: string; // Add y-axis label prop
  };
}

export default function AnalyticsWebsiteVisits({ title, subheader, chart, ...other }: Props) {
  const { labels, colors, series, options, xAxisLabel, yAxisLabel } = chart;

  const chartOptions = useChart({
    colors: colors || ['#FF9800', '#33FF57', '#FF33A1', '#FFC107'],
    plotOptions: {
      bar: {
        columnWidth: '30%',
      },
    },
    fill: {
      type: series.map((i) => i.fill) as string[], // Bar fill colors
    },

    labels,
    xaxis: {
      type: 'category',
      title: {
        text: xAxisLabel || 'Date',
      },
    },
    yaxis: {
      title: {
        text: yAxisLabel || 'Number of Visits',
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          if (typeof value !== 'undefined') {
            return `${value.toFixed(0)} (kg/boxes)`;
          }
          return value;
        },
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
