import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const VisualizeChart = ({ chartData }) => {
  if (!chartData) {
    return null; // If there's no data, don't render the chart
  }

  const categoryBreakdown = chartData.labels; // Get the category labels
  const categoryValues = chartData.datasets[0].data; // Get the corresponding values for each category

  const totalValue = categoryValues.reduce((acc, value) => acc + value, 0); // Calculate the total value

  // Calculate the percentage for each category
  const categoryPercentages = categoryValues.map(
    (value) => ((value / totalValue) * 100).toFixed(2)
  );

  const options = {
    responsive: true, // Ensure the chart is responsive
    plugins: {
      tooltip: {
        callbacks: {
          // Show percentage along with the value in tooltip
          label: function (tooltipItem) {
            const percentage = categoryPercentages[tooltipItem.dataIndex];
            return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)} (${percentage}%)`;
          },
        },
      },
      legend: {
        position: "bottom", // Move the legend to the bottom
        labels: {
          font: {
            size: 14, // Increase font size for legend labels
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: "20px",
      }}
    >
      {/* Chart Container */}
      <div style={{ width: "60%", textAlign: "center" }}>
        <h4
          style={{
            fontSize: "1.5rem",
            marginBottom: "20px",
            color: "#333",
            fontFamily: "'Arial', sans-serif",
          }}
        >
          Price Distribution by Category
        </h4>
        <Pie data={chartData} options={options} />
      </div>

      {/* Category Breakdown */}
      <div
        style={{
          width: "35%",
          padding: "20px",
          marginLeft: "30px",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          fontFamily: "'Arial', sans-serif",
        }}
      >
        <h4 style={{ color: "#333", fontSize: "1.3rem", marginBottom: "20px" }}>
          Category-Wise Breakdown
        </h4>
        <ul style={{ listStyleType: "none", padding: "0" }}>
          {categoryBreakdown.map((category, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontSize: "1.1rem",
                fontWeight: "500",
                padding: "10px",
                backgroundColor: index % 2 === 0 ? "#f1f1f1" : "#ffffff",
                borderRadius: "5px",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e8e8e8")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = index % 2 === 0 ? "#f1f1f1" : "#ffffff")}
            >
              <span style={{ fontWeight: "bold" }}>{category}</span>
              <span>
                ${categoryValues[index].toFixed(2)} ({categoryPercentages[index]}%)
              </span>
            </li>
          ))}
        </ul>
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            marginTop: "20px",
            textAlign: "center",
            paddingTop: "10px",
            borderTop: "2px solid #ccc",
            color: "#333",
          }}
        >
          <strong>Total Value: </strong>
          ${totalValue.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default VisualizeChart;