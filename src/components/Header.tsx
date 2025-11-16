import html2canvas from "html2canvas";

interface HeaderProps {
  pageRef: React.RefObject<HTMLDivElement | null>;
}

export default function Header({ pageRef }: HeaderProps) {
  const handleGenerateReport = async () => {
    const element = pageRef.current || document.getElementById("root");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#0F172A",
        scale: 1,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `pipewatch-report-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report. Please try again.");
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
          <span className="text-sm text-[#94A3B8] hidden sm:inline">
            Real-time monitoring of sewer pipe camera system status
          </span>
        </div>
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
          Generate Report
        </button>
      </div>
    </header>
  );
}

