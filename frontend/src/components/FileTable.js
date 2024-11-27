import React, { useState, useEffect } from "react";

const FileTable = ({ editedFileContents, handleEdit }) => {
  const [sortedContents, setSortedContents] = useState(editedFileContents); // Store sorted data
  const [sortDirection, setSortDirection] = useState({
    category: null,
    line: null,
  }); // State to track sorting direction for both "Category" and "Line"

  // Effect to update sorted data when editedFileContents changes
  useEffect(() => {
    setSortedContents(editedFileContents);
  }, [editedFileContents]);

  // Function to sort table by category
  const handleSortByCategory = () => {
    let sortedData = [...sortedContents];

    if (sortDirection.category === "asc") {
      // Sort in ascending order
      sortedData.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      setSortDirection({ ...sortDirection, category: "desc" });
    } else {
      // Sort in descending order
      sortedData.sort((a, b) => (b.category || "").localeCompare(a.category || ""));
      setSortDirection({ ...sortDirection, category: "asc" });
    }

    setSortedContents(sortedData); // Update the sorted contents
  };

  // Function to sort table by line
  const handleSortByLine = () => {
    let sortedData = [...sortedContents];

    if (sortDirection.line === "asc") {
      // Sort in ascending order
      sortedData.sort((a, b) => a.line - b.line); // Compare numeric values of "line"
      setSortDirection({ ...sortDirection, line: "desc" });
    } else {
      // Sort in descending order
      sortedData.sort((a, b) => b.line - a.line); // Compare numeric values of "line"
      setSortDirection({ ...sortDirection, line: "asc" });
    }

    setSortedContents(sortedData); // Update the sorted contents
  };

  // Calculate the total sum of all total_price values
  const totalSum = sortedContents.reduce((acc, entry) => {
    return acc + (parseFloat(entry.total_price) || 0); // Sum all total_price values
  }, 0);

  return (
    <div
      style={{
        overflowX: "auto",
        marginTop: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{ padding: "8px", border: "1px solid #ccc", cursor: "pointer" }}
              onClick={handleSortByLine} // Trigger sorting when clicked
            >
              Line
            </th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Item</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Quantity</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Unit</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Description</th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                cursor: "pointer", // To indicate that it's clickable
              }}
              onClick={handleSortByCategory} // Trigger sorting when clicked
            >
              Category
            </th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Price</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {sortedContents.map((entry, index) => {
            return (
              <tr key={index}>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {entry.line || "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {entry.item || "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {entry.quantity || "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {entry.unit || "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {entry.description || "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {entry.category || "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  <input
                    type="number"
                    value={entry.price ? entry.price.toFixed(2) : ""}
                    onChange={(e) => handleEdit(index, e.target.value, "price")}
                    style={{
                      width: "100%",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {entry.total_price ? entry.total_price.toFixed(2) : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Display the sum of all total_price values */}
      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f8f8f8",
          fontWeight: "bold",
          textAlign: "right",
        }}
      >
        Total: {totalSum.toFixed(2)} {/* Show the sum rounded to 2 decimal places */}
      </div>
    </div>
  );
};

export default FileTable;