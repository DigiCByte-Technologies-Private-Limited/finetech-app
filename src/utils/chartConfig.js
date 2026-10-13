import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components globally once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global typography and palette for charts
ChartJS.defaults.font.family = "'IBM Plex Sans', -apple-system, sans-serif";
ChartJS.defaults.color = '#5B6B73'; // ink-muted
ChartJS.defaults.plugins.tooltip.backgroundColor = '#16232B'; // ink
ChartJS.defaults.plugins.tooltip.titleColor = '#FFFFFF';
ChartJS.defaults.plugins.tooltip.bodyColor = '#DDE2E0';
ChartJS.defaults.plugins.tooltip.cornerRadius = 4;
ChartJS.defaults.plugins.tooltip.padding = 8;

export default ChartJS;
