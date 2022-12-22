import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
import Typography from '@material-ui/core/Typography';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
export const AttendanceChart = ({ chartData, periodName }) => {

  return (
    <div className="chart-container">
      <Typography align="center" variant="h6" color="primary">Employees Attendance Visualization</Typography>
      <Bar
        data={chartData}
        options={{
          plugins: {
            title: {
             display: true,
             color: '#ddd',
             text: "Attendance Chart Period : " + periodName
            },
            legend: {
              labels: {
                color: '#ccc'
              },
              display: true
            }
          },
          scales: {
            x: {
                stacked: true,
                ticks: {
                    color: '#ffe657'
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: '#ffe657'
                }
            }
          }
        }}
      />
    </div>
  );
};