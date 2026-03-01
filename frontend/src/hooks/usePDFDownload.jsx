import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { toast } from "sonner";

export const usePDFDownload = () => {
  const handleDownloadPDF = async (elementId, fileName = "documento") => {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      console.error(`Elemento ${elementId} não encontrado`);
      return;
    }

    try {
      const clonedElement = originalElement.cloneNode(true);

      // visual branco para PDF
      clonedElement.style.background = "#ffffff";
      clonedElement.style.color = "#000000";
      clonedElement.style.boxShadow = "none";
      clonedElement.style.border = "none";

      // Remove possíveis classes visuais problemáticas
      clonedElement.querySelectorAll("*").forEach((el) => {
        el.style.boxShadow = "none";
        el.style.backdropFilter = "none";
        el.style.filter = "none";
        el.style.background = "#ffffff";
        el.style.color = "#000000";
      });

      clonedElement.style.position = "fixed";
      clonedElement.style.top = "-9999px";
      clonedElement.style.left = "-9999px";
      clonedElement.style.border = "none";
      clonedElement.style.borderRadius = "0";
      clonedElement.style.width = originalElement.offsetWidth + "px";

      document.body.appendChild(clonedElement);

      const canvas = await html2canvas(clonedElement, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName}.pdf`);
      document.body.removeChild(clonedElement);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  return { handleDownloadPDF };
};
