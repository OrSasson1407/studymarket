import { PDFDocument, rgb } from 'pdf-lib';

export async function generatePreviewPdf(buffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer);
  const previewDoc = await PDFDocument.create();
  
  // Extract up to first 3 pages
  const pageCount = Math.min(3, pdfDoc.getPageCount());
  const pages = await previewDoc.copyPages(pdfDoc, Array.from({length: pageCount}, (_, i) => i));
  pages.forEach(page => previewDoc.addPage(page));
  
  // Add preview overlay
  pages.forEach(page => {
    const { width, height } = page.getSize();
    page.drawText('FREE PREVIEW - STUDYMARKET', {
      x: width / 4, y: height / 2, size: 40, color: rgb(0.9, 0.9, 0.9), opacity: 0.5, rotate: { type: 'degrees', angle: 45 }
    });
  });

  return Buffer.from(await previewDoc.save());
}

export async function watermarkPdf(buffer: Buffer, buyerEmail: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();
  pages.forEach(page => {
    page.drawText(Licensed to:  + buyerEmail, {
      x: 10, y: 10, size: 10, color: rgb(0.5, 0.5, 0.5), opacity: 0.7
    });
  });
  return Buffer.from(await pdfDoc.save());
}
