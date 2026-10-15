import { jsPDF } from 'jspdf';
import { JobQuestionPost } from '../types';

export function createJobQuestionPdf(post: JobQuestionPost): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header Box
  doc.setFillColor(15, 23, 42); // #0F172A slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(post.organization.toUpperCase(), pageWidth / 2, y + 8, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${post.postName} · Year: ${post.examYear}`, pageWidth / 2, y + 14, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `Exam Type: ${post.examType}   |   Time: ${post.durationMinutes} Mins   |   Total Marks: ${post.totalMarks}`,
    pageWidth / 2,
    y + 19,
    { align: 'center' }
  );

  y += 30;

  // Instructions Bar
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 9, 'S');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EXAM INSTRUCTIONS:', margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('Read all questions carefully. Choose the single best answer for each question.', margin + 36, y + 6);

  y += 14;

  // Questions Loop
  doc.setTextColor(15, 23, 42);

  if (post.plainTextContent && post.plainTextContent.trim()) {
    const lines = post.plainTextContent.split('\n');
    lines.forEach((line) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 18;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${post.organization} - ${post.postName} (${post.examYear})`, margin, y);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 8;
      }

      if (line.trim().startsWith('Q') || /^\d+[\.\)]/.test(line.trim())) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
      } else if (line.trim().toLowerCase().startsWith('ans') || line.trim().toLowerCase().startsWith('sol')) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(79, 70, 229);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
      }

      const wrapped = doc.splitTextToSize(line || ' ', contentWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 4.5 + 1;
    });
  } else if (post.questions && post.questions.length > 0) {
    post.questions.forEach((q, idx) => {
      // Check page break
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 18;
        // mini header on subsequent pages
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${post.organization} - ${post.postName} (${post.examYear})`, margin, y);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 8;
      }

      // Question label & text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      
      const qLabel = `Q${q.questionNumber || idx + 1}. `;
      const qLines = doc.splitTextToSize(`${qLabel}${q.questionText}`, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 4.5 + 2;

      // Options if MCQ
      if (q.options && q.options.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);

        q.options.forEach((opt, oIdx) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 18;
          }
          const optPrefix = ['A', 'B', 'C', 'D'][oIdx] || `${oIdx + 1}`;
          const cleanOpt = opt.replace(/^[A-D]\)\s*/i, '');
          doc.text(`[ ${optPrefix} ]  ${cleanOpt}`, margin + 5, y);
          y += 4.5;
        });
        y += 1.5;
      }

      // Explanation / Solution Key
      if (q.answerExplanation) {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 18;
        }
        doc.setFillColor(248, 250, 252);
        const correctText = q.correctOption !== undefined && q.options && q.options[q.correctOption]
          ? `Correct Answer: Option ${['A', 'B', 'C', 'D'][q.correctOption]}  |  `
          : '';
        const expLines = doc.splitTextToSize(`${correctText}Solution: ${q.answerExplanation}`, contentWidth - 8);
        
        const expHeight = expLines.length * 4 + 4;
        doc.rect(margin + 2, y - 2, contentWidth - 4, expHeight, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin + 2, y - 2, contentWidth - 4, expHeight, 'S');

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(79, 70, 229); // indigo
        doc.text(expLines, margin + 5, y + 2);
        y += expHeight + 4;
      } else {
        y += 3;
      }
    });
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Official Archive Document · ExamArchive Job Preparation Portal · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadJobQuestionPdf(post: JobQuestionPost): void {
  const cleanOrg = post.organization.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanPost = post.postName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = post.pdfFileName || `${cleanOrg}_${cleanPost}_${post.examYear}.pdf`;

  // If user uploaded an actual PDF file, download their exact file!
  if (post.pdfDataUrl) {
    const link = document.createElement('a');
    link.href = post.pdfDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback: generate PDF dynamically via jsPDF
  const doc = createJobQuestionPdf(post);
  doc.save(filename);
}

export function dataUrlToPdfBlob(dataUrl: string): Blob {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch (err) {
    console.error('Failed to convert dataUrl to Blob', err);
    return new Blob([], { type: 'application/pdf' });
  }
}

export function generateJobQuestionPdfBlobUrl(post: JobQuestionPost): string {
  // If user uploaded their own PDF, convert base64 to Blob URL so browsers display it inline!
  if (post.pdfDataUrl) {
    if (post.pdfDataUrl.startsWith('data:')) {
      const blob = dataUrlToPdfBlob(post.pdfDataUrl);
      return URL.createObjectURL(blob);
    }
    return post.pdfDataUrl;
  }

  const doc = createJobQuestionPdf(post);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
