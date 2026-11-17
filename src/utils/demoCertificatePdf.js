/**
 * demoCertificatePdf.js
 * High-Quality A4 Landscape PDF & Image Generation for LearnWithUs Demo Certificate.
 *
 * Specifications:
 * - A4 Landscape Dimensions: 297mm x 210mm (841.89 pt x 595.28 pt)
 * - Canvas Resolution: 2380 x 1684 px (200+ DPI high-definition crisp rendering)
 * - Pure client-side zero-dependency PDF generation via standard PDF 1.4 binary structure
 * - Pure white background (#FFFFFF) strictly enforced in both light and dark modes
 * - Prominent diagonal "DEMO" watermark + "SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE" notices
 * - Realistic placeholder QR code for demo verification
 * - Authorized Signature & Academic Seal
 */

export const DEMO_CERTIFICATE_DATA = {
  studentName: "Demo Student",
  courseName: "Python Programming",
  fullCourseTitle: "Python Programming – Beginner to Advanced",
  completionDate: "15 November 2026",
  certificateId: "DEMO-LWU-0001",
  duration: "30 Hours",
  issuedBy: "LearnWithUs",
  authorizedBy: "Authorized Signature",
  academicTeam: "LearnWithUs Academic Team",
  watermarkText: "DEMO",
  sampleNotice: "SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE",
  academyTitle: "LEARN WITH US",
  academySubtitle: "ACADEMY OF COMPUTING & SOFTWARE EDUCATION"
};

/**
 * Draws a realistic vector placeholder QR code with finder patterns & data modules.
 */
function drawPlaceholderQrCode(ctx, x, y, size = 110) {
  ctx.save();
  ctx.translate(x, y);

  // Background card for QR code
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-size / 2 - 10, -size / 2 - 10, size + 20, size + 42, 10);
  ctx.fill();
  ctx.stroke();

  // QR matrix coordinates
  const qx = -size / 2;
  const qy = -size / 2;
  const mod = size / 21; // 21x21 modules (standard Version 1 QR matrix)

  ctx.fillStyle = "#0A2540";

  // Finder pattern helper (7x7 modules)
  const drawFinder = (r, c) => {
    // 7x7 outer square
    ctx.fillRect(qx + c * mod, qy + r * mod, 7 * mod, 7 * mod);
    // 5x5 white inner square
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(qx + (c + 1) * mod, qy + (r + 1) * mod, 5 * mod, 5 * mod);
    // 3x3 dark center
    ctx.fillStyle = "#0A2540";
    ctx.fillRect(qx + (c + 2) * mod, qy + (r + 2) * mod, 3 * mod, 3 * mod);
  };

  drawFinder(0, 0); // Top-Left
  drawFinder(0, 14); // Top-Right
  drawFinder(14, 0); // Bottom-Left

  // Timing patterns
  for (let i = 8; i < 13; i += 2) {
    ctx.fillRect(qx + i * mod, qy + 6 * mod, mod, mod);
    ctx.fillRect(qx + 6 * mod, qy + i * mod, mod, mod);
  }

  // Deterministic data pattern representing encrypted credential hash
  const dataPattern = [
    [0, 8], [1, 9], [2, 10], [3, 8], [4, 11], [5, 9],
    [8, 0], [9, 1], [10, 2], [11, 3], [12, 4], [13, 5],
    [8, 8], [8, 9], [8, 11], [8, 13], [9, 8], [9, 12],
    [10, 9], [10, 11], [10, 13], [11, 8], [11, 10], [11, 12],
    [12, 9], [12, 11], [12, 13], [13, 8], [13, 10],
    [8, 15], [8, 17], [8, 19], [9, 16], [9, 18], [9, 20],
    [10, 15], [10, 18], [11, 16], [11, 19], [12, 17], [12, 20],
    [15, 8], [15, 10], [15, 12], [16, 9], [16, 11],
    [17, 8], [17, 10], [17, 13], [18, 9], [18, 12],
    [15, 15], [15, 17], [15, 19], [16, 16], [16, 18], [16, 20],
    [17, 15], [17, 17], [17, 19], [18, 16], [18, 18], [19, 17], [19, 19]
  ];

  ctx.fillStyle = "#0A2540";
  dataPattern.forEach(([r, c]) => {
    ctx.fillRect(qx + c * mod, qy + r * mod, mod, mod);
  });

  // QR Code Sub-Labels
  ctx.textAlign = "center";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillStyle = "#0756A5";
  ctx.fillText("VERIFICATION QR", 0, size / 2 + 15);

  ctx.font = "600 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#64748B";
  ctx.fillText("(DEMO PLACEHOLDER)", 0, size / 2 + 28);

  ctx.restore();
}

/**
 * Render the full LearnWithUs Demo Certificate onto an HTML5 Canvas.
 * Can be drawn to any provided canvas element or created in memory.
 */
export function renderDemoCertificateToCanvas(canvas, customData = {}) {
  const data = { ...DEMO_CERTIFICATE_DATA, ...customData };
  const width = 2380;
  const height = 1684;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Pure Crisp White Background (ALWAYS white, immune to dark mode)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Subtle background parchment/linework pattern
  ctx.strokeStyle = "rgba(7, 86, 165, 0.025)";
  ctx.lineWidth = 1;
  for (let i = 40; i < width; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 40);
    ctx.lineTo(i, height - 40);
    ctx.stroke();
  }

  // 2. Visible Diagonal "DEMO" Watermark across center
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-26 * Math.PI) / 180);
  ctx.font = "900 240px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(7, 86, 165, 0.085)";
  ctx.fillText(data.watermarkText, 0, -20);
  ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "rgba(7, 86, 165, 0.12)";
  ctx.letterSpacing = "6px";
  ctx.fillText(data.sampleNotice, 0, 110);
  ctx.restore();

  // 3. Elegant Academic Border Framing (Navy & Royal Blue)
  // Outer Solid Navy Frame
  ctx.strokeStyle = "#0A2540";
  ctx.lineWidth = 9;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Middle Thin Accent
  ctx.strokeStyle = "#93C5FD";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Inner Royal Blue Frame
  ctx.strokeStyle = "#0756A5";
  ctx.lineWidth = 3.5;
  ctx.strokeRect(58, 58, width - 116, height - 116);

  // 4. Classical Corner Academic Ornaments
  const cornerSize = 48;
  const drawCorner = (x, y, flipX, flipY) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.strokeStyle = "#0756A5";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.stroke();

    ctx.fillStyle = "#0756A5";
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawCorner(70, 70, false, false);
  drawCorner(width - 70, 70, true, false);
  drawCorner(70, height - 70, false, true);
  drawCorner(width - 70, height - 70, true, true);

  // 5. Top Bar: Official Sample Notice Pill & ID Badge
  const topY = 110;
  // Notice Pill in Center
  const noticeText = "★ SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE ★";
  ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const noticeWidth = ctx.measureText(noticeText).width + 36;
  ctx.fillStyle = "#F0F7FF";
  ctx.strokeStyle = "#BFDBFE";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect((width - noticeWidth) / 2, topY - 18, noticeWidth, 34, 17);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0756A5";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(noticeText, width / 2, topY - 1);

  // Left Trust Indicator
  ctx.textAlign = "left";
  ctx.font = "600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0756A5";
  ctx.fillText("🛡 Verified Educational Credential Format", 90, topY);

  // Right Certificate ID Badge
  ctx.textAlign = "right";
  ctx.font = "bold 17px 'Courier New', monospace";
  ctx.fillStyle = "#0A2540";
  ctx.fillText(`CERTIFICATE ID: `, width - 230, topY);
  ctx.fillStyle = "#0756A5";
  ctx.font = "900 18px 'Courier New', monospace";
  ctx.fillText(data.certificateId, width - 90, topY);

  // Horizontal Divider Line below Top Bar
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(90, topY + 28);
  ctx.lineTo(width - 90, topY + 28);
  ctx.stroke();

  // 6. Heraldic Laurel Crest Emblem in Royal Blue & White
  const crestY = 240;
  ctx.save();
  ctx.translate(width / 2, crestY);

  // Outer concentric circles
  ctx.strokeStyle = "#0756A5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#93C5FD";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Laurel branches left & right
  ctx.fillStyle = "#0756A5";
  for (let angle = 30; angle <= 150; angle += 24) {
    const rad = (angle * Math.PI) / 180;
    const lx = Math.cos(rad) * 44;
    const ly = Math.sin(rad) * 44;
    ctx.beginPath();
    ctx.ellipse(-ly, lx, 7, 3, rad, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(ly, lx, 7, 3, -rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Open Book with Code Brackets
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#0756A5";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(-18, -16, -26, -14);
  ctx.lineTo(-26, 16);
  ctx.quadraticCurveTo(-16, 14, 0, 20);
  ctx.quadraticCurveTo(16, 14, 26, 16);
  ctx.lineTo(26, -14);
  ctx.quadraticCurveTo(18, -16, 0, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spine
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(0, 20);
  ctx.stroke();

  // Code brackets on pages
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.lineTo(-17, 3);
  ctx.lineTo(-12, 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(17, 3);
  ctx.lineTo(12, 8);
  ctx.stroke();

  ctx.restore();

  // 7. Academy Title & Subtitle
  ctx.textAlign = "center";
  ctx.font = "900 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0A2540";
  ctx.letterSpacing = "6px";
  ctx.fillText(data.academyTitle, width / 2, 335);

  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0756A5";
  ctx.letterSpacing = "4px";
  ctx.fillText(data.academySubtitle, width / 2, 368);
  ctx.letterSpacing = "normal";

  // 8. Certificate of Completion Title
  ctx.font = "900 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0756A5";
  ctx.letterSpacing = "8px";
  ctx.fillText("CERTIFICATE OF COMPLETION", width / 2, 450);
  ctx.letterSpacing = "normal";

  // Decorative Rule with Diamond
  const ruleY = 482;
  ctx.strokeStyle = "#3B82F6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 140, ruleY);
  ctx.lineTo(width / 2 - 25, ruleY);
  ctx.moveTo(width / 2 + 25, ruleY);
  ctx.lineTo(width / 2 + 140, ruleY);
  ctx.stroke();

  ctx.fillStyle = "#0756A5";
  ctx.beginPath();
  ctx.arc(width / 2, ruleY, 5, 0, Math.PI * 2);
  ctx.fill();

  // 9. Presentation Line
  ctx.font = "italic 23px Georgia, serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("This certificate is proudly presented to", width / 2, 535);

  // 10. Student Recipient Name (Prominent & Elegant)
  ctx.font = "bold 68px Georgia, serif";
  ctx.fillStyle = "#0A2540";
  ctx.fillText(data.studentName, width / 2, 630);

  // Name Underline Accent
  const nameWidth = ctx.measureText(data.studentName).width + 80;
  ctx.strokeStyle = "#0756A5";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo((width - nameWidth) / 2, 655);
  ctx.lineTo((width + nameWidth) / 2, 655);
  ctx.stroke();

  // 11. Completion Statement & Course Name
  ctx.font = "20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("For successfully completing", width / 2, 715);

  ctx.font = "900 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0756A5";
  ctx.fillText(data.fullCourseTitle, width / 2, 785);

  // 12. Structured Course Metadata Attributes Box
  const metaBoxY = 835;
  const metaBoxWidth = 1400;
  const metaBoxHeight = 85;
  const metaBoxX = (width - metaBoxWidth) / 2;

  ctx.fillStyle = "#F8FAFC";
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(metaBoxX, metaBoxY, metaBoxWidth, metaBoxHeight, 16);
  ctx.fill();
  ctx.stroke();

  // 4 Meta Columns: Student Name | Course Name | Duration | Issued By
  const cols = [
    { label: "STUDENT NAME", value: data.studentName },
    { label: "COURSE NAME", value: data.courseName },
    { label: "COURSE DURATION", value: data.duration },
    { label: "ISSUED BY", value: data.issuedBy }
  ];

  const colWidth = metaBoxWidth / 4;
  cols.forEach((col, idx) => {
    const cx = metaBoxX + idx * colWidth + colWidth / 2;
    ctx.textAlign = "center";
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.letterSpacing = "1.5px";
    ctx.fillText(col.label, cx, metaBoxY + 32);
    ctx.letterSpacing = "normal";

    ctx.font = "900 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#0A2540";
    ctx.fillText(col.value, cx, metaBoxY + 62);

    if (idx < 3) {
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(metaBoxX + (idx + 1) * colWidth, metaBoxY + 16);
      ctx.lineTo(metaBoxX + (idx + 1) * colWidth, metaBoxY + metaBoxHeight - 16);
      ctx.stroke();
    }
  });

  // 13. Horizontal Divider Line above Footer
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(110, 975);
  ctx.lineTo(width - 110, 975);
  ctx.stroke();

  // 14. Signatures, Official Academic Seal, & Placeholder QR Code Footer
  const footerY = 1010;

  // 14A. LEFT: Date of Issuance
  ctx.textAlign = "left";
  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0A2540";
  ctx.fillText(data.completionDate, 140, footerY + 50);

  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, footerY + 68);
  ctx.lineTo(390, footerY + 68);
  ctx.stroke();

  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#475569";
  ctx.letterSpacing = "2px";
  ctx.fillText("DATE OF ISSUANCE", 140, footerY + 95);
  ctx.letterSpacing = "normal";

  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0756A5";
  ctx.fillText("Valid Academic Session: 2026", 140, footerY + 120);

  // 14B. CENTER-LEFT: Circular Academic Seal in Royal Blue & Crisp White
  const sealX = width / 2 - 220;
  const sealY = footerY + 68;

  ctx.save();
  ctx.translate(sealX, sealY);

  // Outer circles
  ctx.fillStyle = "#F0F7FF";
  ctx.strokeStyle = "#0756A5";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#004085";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Circular seal text around perimeter
  ctx.font = "900 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0756A5";
  const sealText = "★ OFFICIAL VERIFIED CREDENTIAL ★ LEARN WITH US ★ DEMO ★";
  for (let i = 0; i < sealText.length; i++) {
    const char = sealText[i];
    const angle = (i / sealText.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -46);
    ctx.textAlign = "center";
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  // Inner core & star
  ctx.fillStyle = "#0756A5";
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();

  // White 5-pointed star
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerA = (i * 72 - 90) * (Math.PI / 180);
    const innerA = ((i * 72 + 36) - 90) * (Math.PI / 180);
    const ox = Math.cos(outerA) * 13;
    const oy = Math.sin(outerA) * 13;
    const ix = Math.cos(innerA) * 5.5;
    const iy = Math.sin(innerA) * 5.5;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 14C. CENTER-RIGHT: Placeholder Verification QR Code
  const qrX = width / 2 + 200;
  const qrY = footerY + 68;
  drawPlaceholderQrCode(ctx, qrX, qrY, 100);

  // 14D. RIGHT: Authorized Signature & Academic Team
  ctx.textAlign = "right";

  // Cursive signature vector path
  ctx.save();
  ctx.translate(width - 410, footerY);
  ctx.strokeStyle = "#0756A5";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(30, 48);
  ctx.bezierCurveTo(55, 10, 85, 15, 110, 38);
  ctx.bezierCurveTo(125, 52, 140, 25, 165, 30);
  ctx.bezierCurveTo(185, 34, 195, 55, 220, 35);
  ctx.bezierCurveTo(240, 18, 255, 45, 280, 42);
  ctx.stroke();

  // Flourish loop
  ctx.beginPath();
  ctx.moveTo(40, 45);
  ctx.bezierCurveTo(90, 75, 190, 60, 290, 38);
  ctx.stroke();
  ctx.restore();

  // Underline for signature
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width - 390, footerY + 68);
  ctx.lineTo(width - 140, footerY + 68);
  ctx.stroke();

  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0A2540";
  ctx.letterSpacing = "1.5px";
  ctx.fillText(data.authorizedBy.toUpperCase(), width - 140, footerY + 95);
  ctx.letterSpacing = "normal";

  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0756A5";
  ctx.fillText(data.academicTeam, width - 140, footerY + 120);

  // 15. Bottom Academic Disclaimer & Verification Note
  const disclaimY = 1200;
  ctx.strokeStyle = "#F1F5F9";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(110, disclaimY);
  ctx.lineTo(width - 110, disclaimY);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillStyle = "#0756A5";
  ctx.fillText(
    `Online Demo Verification: https://learnwithus.learnwithus2008.workers.dev/#/verify-certificate/${data.certificateId}`,
    width / 2,
    disclaimY + 28
  );

  ctx.font = "500 12.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748B";
  ctx.fillText(
    "Disclaimer: This is a SAMPLE DEMONSTRATION document created for layout preview purposes only. It does not confer accredited college credit, degree status, or formal certification.",
    width / 2,
    disclaimY + 52
  );
}

/**
 * Builds a valid binary A4 Landscape PDF from a JPEG Uint8Array buffer.
 * A4 dimensions: 297mm x 210mm = 841.89 pt x 595.28 pt.
 */
function buildA4LandscapePdfBinary(jpgBuffer, imgWidth = 2380, imgHeight = 1684) {
  const widthPt = 841.89;
  const heightPt = 595.28;

  const enc = new TextEncoder();
  const header = enc.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  const obj1 = enc.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const obj2 = enc.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  const obj3 = enc.encode(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Resources << /XObject << /Im1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`
  );

  const streamContent = `q\n${widthPt} 0 0 ${heightPt} 0 0 cm\n/Im1 Do\nQ\n`;
  const obj4 = enc.encode(
    `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`
  );

  const obj5Header = enc.encode(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpgBuffer.length} >>\nstream\n`
  );
  const obj5Footer = enc.encode("\nendstream\nendobj\n");

  // Compute byte offsets for cross-reference table
  let offset = header.length;
  const offsets = [];

  offsets.push(offset);
  offset += obj1.length;

  offsets.push(offset);
  offset += obj2.length;

  offsets.push(offset);
  offset += obj3.length;

  offsets.push(offset);
  offset += obj4.length;

  offsets.push(offset);
  offset += obj5Header.length + jpgBuffer.length + obj5Footer.length;

  let xrefStr = "xref\n0 6\n0000000000 65535 f \n";
  for (const off of offsets) {
    xrefStr += String(off).padStart(10, "0") + " 00000 n \n";
  }

  const trailerStr = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
  const xrefBuf = enc.encode(xrefStr + trailerStr);

  const totalLength =
    header.length +
    obj1.length +
    obj2.length +
    obj3.length +
    obj4.length +
    obj5Header.length +
    jpgBuffer.length +
    obj5Footer.length +
    xrefBuf.length;

  const pdfArray = new Uint8Array(totalLength);
  let cur = 0;

  const append = (buf) => {
    pdfArray.set(buf, cur);
    cur += buf.length;
  };

  append(header);
  append(obj1);
  append(obj2);
  append(obj3);
  append(obj4);
  append(obj5Header);
  append(jpgBuffer);
  append(obj5Footer);
  append(xrefBuf);

  return pdfArray;
}

/**
 * Generates and downloads the high-quality A4 landscape PDF certificate.
 */
export async function downloadDemoCertificatePdf(customData = {}) {
  const canvas = document.createElement("canvas");
  renderDemoCertificateToCanvas(canvas, customData);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to render certificate image blob"));
          return;
        }

        try {
          const arrayBuffer = await blob.arrayBuffer();
          const jpgBuffer = new Uint8Array(arrayBuffer);
          const pdfBytes = buildA4LandscapePdfBinary(jpgBuffer, canvas.width, canvas.height);

          const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          const safeId = (customData.certificateId || DEMO_CERTIFICATE_DATA.certificateId).replace(/[^a-zA-Z0-9_-]/g, "");
          a.href = url;
          a.download = `LearnWithUs-Demo-Certificate-${safeId}.pdf`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 150);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      },
      "image/jpeg",
      0.95
    );
  });
}

/**
 * Generates and downloads the certificate as a high-resolution PNG image.
 */
export async function downloadDemoCertificatePng(customData = {}) {
  const canvas = document.createElement("canvas");
  renderDemoCertificateToCanvas(canvas, customData);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to render certificate PNG blob"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const safeId = (customData.certificateId || DEMO_CERTIFICATE_DATA.certificateId).replace(/[^a-zA-Z0-9_-]/g, "");
        a.href = url;
        a.download = `LearnWithUs-Demo-Certificate-${safeId}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 150);
        resolve(true);
      },
      "image/png"
    );
  });
}
