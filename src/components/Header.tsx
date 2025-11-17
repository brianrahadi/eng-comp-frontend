import axios from "axios";
import { useScreenshot } from "../hooks/useScreenshot";

import type { Camera } from "../api/types";

interface HeaderProps {
  pageRef: React.RefObject<HTMLDivElement | null>;
  onCaptureStart: () => void;
  onCaptureEnd: () => void;
  cameras: Camera[];
}

export default function Header({ pageRef, onCaptureStart, onCaptureEnd, cameras }: HeaderProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { generatePDF } = useScreenshot();

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/export/csv`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pipewatch-export-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/export/json`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pipewatch-export-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export JSON:", error);
      alert("Failed to export JSON. Please try again.");
    }
  };

  const handleGenerateReport = async () => {
    const element = pageRef.current || document.getElementById("root");
    if (!element) return;

    try {
      onCaptureStart();
      await new Promise(resolve => setTimeout(resolve, 500));
      await generatePDF(element, cameras);
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      onCaptureEnd();
    }
  };

  return (
    <header
      className="mx-auto my-3 z-50 w-[95%] max-w-7xl"
      style={{
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(51, 65, 85, 0.5)",
        borderRadius: "24px",
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">PipeWatch</h1>
          <span className="text-sm text-[#94A3B8] hidden sm:inline mt-3">
            Real-time monitoring of sewer pipe camera system status
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            title="Export last 1 minute of data as CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            title="Export last 1 minute of data as JSON"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            JSON
          </button>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            PDF Report
          </button>
        </div>
      </div>
    </header>
  );
}

