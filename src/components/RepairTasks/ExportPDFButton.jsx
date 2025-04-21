import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RepairTaskPDF from "./RepairTaskPDF";

const ExportPDFButton = ({ pdfData, users, taskId }) => {
  return (
    <PDFDownloadLink
      document={<RepairTaskPDF data={pdfData} users={users} />}
      fileName={`repair-task-${taskId}.pdf`}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
    >
      {({ blob, url, loading, error }) =>
        loading ? "Loading document..." : "Export PDF"
      }
    </PDFDownloadLink>
  );
};

export default ExportPDFButton;
