import React, { useState } from "react";
import axios from "axios";
import FileTable from "./FileTable";
import VisualizeChart from "./VisualizeChart";

const FileViewer = ({
  selectedFileName,
  fileContents,
  setFileContents,
  editedFileContents,
  setEditedFileContents,
  token
}) => {
  const [showChart, setShowChart] = useState(false); // Control chart visibility
  const [chartData, setChartData] = useState(null); // Store chart data

  const handlePopulate = async () => {
    if (!selectedFileName) {
      alert("Please select a file to populate.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/files/populate/${selectedFileName}`,
        {}, // POST body (empty in this case)
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Populated File Data:", response.data); // Debug log
      setFileContents(response.data); // Update file contents with populated data
      setEditedFileContents(response.data); // Update edited content
      setShowChart(false); // Ensure the chart is hidden after populate
    } catch (err) {
      console.error("Failed to populate the file:", err.response || err.message);
      alert(
        `Failed to populate the file. ${
          err.response?.data?.message || "Please try again."
        }`
      );
    }
  };

  const generateChart = () => {
    if (!editedFileContents.length) {
      alert("No content available for visualization.");
      return;
    }
  
    // Calculate the total sum of total_prices across all categories
    const totalSum = editedFileContents.reduce((acc, entry) => {
      return acc + (parseFloat(entry.total_price) || 0);
    }, 0);
  
    // Group and sum total_prices by category
    const categoryTotals = editedFileContents.reduce((acc, entry) => {
      const category = entry.category || "Uncategorized";
      const totalPrice = (parseFloat(entry.total_price) || 0);
      acc[category] = (acc[category] || 0) + totalPrice;
      return acc;
    }, {});
  
    console.log("Category Totals:", categoryTotals); // Debug log
  
    // Prepare data for the chart
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
  
    // Prepare the chart data
    const chartData = {
      labels,
      datasets: [
        {
          label: "Price Distribution",
          data,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF5733", // A color for the total value
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF5733", // Hover color for the total value
          ],
        },
      ],
    };
  
    // Pass both chart data and category-wise breakdown to the chart component
    setChartData(chartData);
    setShowChart(true); // Show the chart
};
  

  const handleEdit = (index, newValue) => {
    const updatedContents = [...editedFileContents];
  
    // Only allow editing the price (quantity is not editable)
    updatedContents[index].price = parseFloat(newValue) || 0;
  
    // Calculate Total Price for this entry based on new price and existing quantity
    updatedContents[index].total_price = (updatedContents[index].quantity || 0) * (updatedContents[index].price || 0);
  
    setEditedFileContents(updatedContents);
  
    // Recalculate total cost based on total_price
    const total = updatedContents.reduce(
      (acc, entry) => acc + (parseFloat(entry.total_price) || 0),
      0
    );
    setTotalCost(total);  // Set the total cost based on total_price
};

  const handleVisualize = () => {
    generateChart(); // This will invoke the function to generate and display the chart
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h3 style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "20px" }}>
        File Viewer
      </h3>
      {selectedFileName ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={handlePopulate}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                flex: "1 0 auto",
                maxWidth: "200px",
              }}
            >
              Populate
            </button>
            <button
              onClick={handleVisualize}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                flex: "1 0 auto",
                maxWidth: "200px",
              }}
            >
              Visualize
            </button>
          </div>
          {showChart ? (
            <VisualizeChart chartData={chartData} />
          ) : fileContents.length > 0 ? (
            <FileTable
              editedFileContents={editedFileContents}
              handleEdit={handleEdit}
            />
          ) : (
            <p style={{ textAlign: "center", color: "#555" }}>
              No content available for this file.
            </p>
          )}
        </>
      ) : (
        <p style={{ textAlign: "center", color: "#555" }}>
          Select a file to view its content.
        </p>
      )}
    </div>
  );
};

export default FileViewer;
