import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Filler } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import 'chartjs-adapter-date-fns';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler 
);

function LineChartComponent({ possessions }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Évolution de la valeur",
        data: [],
        fill: true,
        backgroundColor: "rgba(35, 135, 182, 0.2)",
        borderColor: "rgb(35, 135, 182)",
        tension: 0.4,
        pointRadius: 0, 
      }
    ]
  });

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    if (dateDebut && dateFin) {
      processPossessions(possessions);
    }
  }, [possessions, dateDebut, dateFin]);

  function processPossessions(data) {
    const labels = [];
    const values = [];

    const currentDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    while (currentDate <= endDate) {
      const valeurTotale = data.reduce((acc, possession) => {
        const possessionDateDebut = new Date(possession.dateDebut);
        
        if (possession.valeurConstante !== undefined && possessionDateDebut > currentDate) {
          return acc;
        } else {
          return acc + (possession.getValeur(currentDate) || 0);
        }
      }, 0);

      labels.push(new Date(currentDate));
      values.push(valeurTotale);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Évolution de la valeur",
          data: values,
          backgroundColor: "rgba(35, 135, 182, 0.2)",
          borderColor: "rgb(35, 135, 182)",
          tension: 0.5,
          fill: true,
          pointRadius: 0, 
        }
      ]
    });
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Valeur: ${tooltipItem.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "MMM d",
          }
        },
        title: {
          display: true,
          text: "Dates",
        },
        grid: {
          display: false,
        }
      },
      y: {
        title: {
          display: true,
          text: "Valeur",
        },
        beginAtZero: true,
        grid: {
          color: "#e3e3e3",
        }
      }
    },
    animation: {
      duration: 700,
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Graphique de l'évolution du patrimoine</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Date de Début:</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Date de Fin:</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
              <Line options={options} data={chartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LineChartComponent;
