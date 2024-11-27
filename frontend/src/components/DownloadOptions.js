import React from "react";
import { jsPDF } from "jspdf";

const DownloadOptions = ({ selectedFileName, editedFileContents, totalCost }) => {
  const handleDownloadCSV = () => {
    if (!selectedFileName || !editedFileContents.length) {
      alert("No file selected or no content to download.");
      console.error("Download CSV failed: Missing file name or content.");
      return;
    }

    // Generate CSV content
    const csvRows = [
      ["Line", "Item", "Quantity", "Unit", "Description", "Category", "Price"],
      ...editedFileContents.map((entry) => [
        entry.line || "N/A",
        entry.item || "N/A",
        entry.quantity || "N/A",
        entry.unit || "N/A",
        entry.description || "N/A",
        entry.category || "N/A",
        entry.price || 0,
      ]),
      ["", "", "", "", "", "Total Cost", totalCost.toFixed(2)],
    ];
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedFileName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!selectedFileName || !editedFileContents.length) {
      alert("No file selected or no content to download.");
      console.error("Download PDF failed: Missing file name or content.");
      return;
    }
  
    try {
      const doc = new jsPDF();
  
      // Add title
      doc.text(`${selectedFileName} - Proposal`, 20, 10);
  
      // Log the data being passed to autoTable
      console.log("Generating PDF with data:", editedFileContents);
  
      // Add table with autoTable
      doc.autoTable({
        head: [["Line", "Item", "Quantity", "Unit", "Description", "Category", "Price"]],
        body: editedFileContents.map((entry) => [
          entry.line || "N/A",
          entry.item || "N/A",
          entry.quantity || "N/A",
          entry.unit || "N/A",
          entry.description || "N/A",
          entry.category || "N/A",
          entry.price?.toFixed(2) || "0.00",
        ]),
      });
  
      // Add total cost
      doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
  
      // Save the PDF
      doc.save(`${selectedFileName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={handleDownloadCSV}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        Download CSV
      </button>
      <button
        onClick={handleDownloadPDF}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default DownloadOptions;