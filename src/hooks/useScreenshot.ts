import { useCallback } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import axios from "axios";
import type { Camera } from "../api/types";
import { calculateCriticality, getCriticalityLabel } from "../utils/criticality";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useScreenshot() {
  const generatePDF = useCallback(async (element: HTMLElement, cameras: Camera[]): Promise<void> => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let yPos = 20;
    const pageWidth = 210;
    const margin = 15;
    const lineHeight = 7;
    const sectionSpacing = 10;

    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      if (isBold) {
        pdf.setFont("helvetica", "bold");
      } else {
        pdf.setFont("helvetica", "normal");
      }
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPos > 280) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, margin, yPos);
        yPos += lineHeight;
      });
    };

    const addSectionHeader = (text: string) => {
      yPos += sectionSpacing;
      if (yPos > 280) {
        pdf.addPage();
        yPos = 20;
      }
      addText(text, 14, true, [0, 0, 0]);
      yPos += 3;
    };

    try {
      const insightsResponse = await axios.get(`${API_URL}/api/insights`);
      const insights = insightsResponse.data;

      const criticalSegments = cameras
        .map(cam => ({
          ...cam,
          criticality: calculateCriticality(cam.Light ?? 3, cam.Water, cam.Status),
        }))
        .filter(cam => cam.criticality.criticalityLevel <= 2)
        .sort((a, b) => a.criticality.criticalityLevel - b.criticality.criticalityLevel);

      const lowLightSegments = cameras.filter(cam => cam.Light <= 2);
      const highWaterSegments = cameras.filter(cam => cam.Water >= 0.8);

      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 15, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Sewer System Inspection Report", margin, 12);

      yPos = 30;
      pdf.setTextColor(0, 0, 0);
      addText(`Date: ${new Date().toLocaleString()}`, 10, false, [100, 100, 100]);
      yPos += 5;

      addSectionHeader("Summary");
      const summaryText = `Over the course of the inspection period, multiple camera readings were collected across the sewer system. Each segment was analyzed for water submersion, light levels, and camera status.

Overall system status:
• Total segments monitored: ${cameras.length}
• Segments flagged as critical: ${criticalSegments.length}
• Segments with low light conditions: ${lowLightSegments.length}
• Segments with high water levels: ${highWaterSegments.length}

The system indicates that ${criticalSegments.length === 0 ? "all areas are operating within safe limits" : `certain segments require attention due to elevated water submersion or decreased visibility. ${criticalSegments.length} segment(s) have been identified as requiring immediate attention.`}`;
      addText(summaryText, 11);

      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      addSectionHeader("Critical Areas");
      addText("The following segments have been identified as critical based on combined sensor analysis (Light, Water, Status):", 10);

      if (criticalSegments.length > 0) {
        let tableStartY = yPos + 5;
        const colWidths = [25, 35, 30, 25, 35, 30];
        const headers = ["Segment ID", "Timestamp", "Water", "Light", "Status", "Criticality Level"];
        
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        let xPos = margin;
        headers.forEach((header, i) => {
          pdf.text(header, xPos, tableStartY);
          xPos += colWidths[i];
        });

        yPos = tableStartY + 5;
        pdf.setFont("helvetica", "normal");
        criticalSegments.slice(0, 10).forEach((cam) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
            tableStartY = 20;
            xPos = margin;
            headers.forEach((header, i) => {
              pdf.text(header, xPos, tableStartY);
              xPos += colWidths[i];
            });
            yPos = tableStartY + 5;
          }
          xPos = margin;
          const row = [
            cam.SegmentID.toString(),
            new Date().toLocaleTimeString(),
            `${(cam.Water * 100).toFixed(1)}%`,
            `${cam.Light ?? 3}/5`,
            cam.Status,
            `Level ${cam.criticality.criticalityLevel} - ${getCriticalityLabel(cam.criticality.criticalityLevel)}`,
          ];
          row.forEach((cell, i) => {
            pdf.text(cell, xPos, yPos);
            xPos += colWidths[i];
          });
          yPos += 6;
        });
        yPos += 5;
      } else {
        addText("No critical segments identified during this inspection period.", 10);
      }

      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      addSectionHeader("Observations / AI Insights");
      const insightsText = insights.insights || "No insights available.";
      addText(insightsText, 10);

      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      addSectionHeader("Recommendations");
      const recommendations = [
        criticalSegments.length > 0 ? `• Prioritize inspection of Level 1 critical segments immediately. ${criticalSegments.filter(c => c.criticality.criticalityLevel === 1).length} segment(s) require urgent attention.` : "",
        lowLightSegments.length > 0 ? `• Schedule regular monitoring for LOWLIGHT segments. ${lowLightSegments.length} segment(s) have insufficient lighting (Light ≤ 2).` : "",
        highWaterSegments.length > 0 ? `• Address high water levels in ${highWaterSegments.length} segment(s) immediately to prevent potential flooding or blockage.` : "",
        "• Maintain logs for all segments to track trends and identify emerging risks.",
        lowLightSegments.length > 0 ? "• Consider improving lighting or cleaning procedures for segments with repeated low visibility readings." : "",
        "• Use exported data for further analysis and predictive maintenance planning.",
      ].filter(r => r !== "").join("\n");

      addText(recommendations || "• Continue regular monitoring. All segments are operating within acceptable parameters.", 10);

      pdf.addPage();
      yPos = 20;

      addSectionHeader("Dashboard Overview");
      addText("The following image shows a general overview of the recorded segments with real-time monitoring data.", 10, false, [100, 100, 100]);
      yPos += 10;

      const canvas = await html2canvas(element, {
        backgroundColor: "#0F172A",
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");
      const maxImageHeight = 250;
      const scaledHeight = Math.min(imgHeight, maxImageHeight);
      const scaledWidth = imgHeight > maxImageHeight ? (maxImageHeight * imgWidth) / imgHeight : imgWidth;
      
      pdf.addImage(imgData, "PNG", margin, yPos, scaledWidth, scaledHeight);

      pdf.save(`pipewatch-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error;
    }
  }, []);

  return { generatePDF };
}

