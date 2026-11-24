import { BatchCompletionEmailPayload } from "../interfaces/mail-payload.interface";

function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateVi(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function buildBatchCompletionEmail(payload: BatchCompletionEmailPayload): {
  subject: string;
  text: string;
  html: string;
} {
  const completedDate = formatDateVi(new Date());
  const qtyFormatted = Number(payload.quantity || 0).toLocaleString("vi-VN");
  const subject = `[vCraft] Lô tranh "${payload.quoteTitle}" đã hoàn tất chế tác · Mã định danh ${payload.batchCode}`;

  const safeRecipient = escapeHtml(payload.recipientName || "Quý khách");
  const safeTitle = escapeHtml(payload.quoteTitle);
  const safeWorkshop = escapeHtml(payload.workshopName);
  const safeBatchCode = escapeHtml(payload.batchCode);
  const safeTraceUrl = escapeHtml(payload.traceUrl);

  const itemsRowsHtml =
    payload.items && payload.items.length > 0
      ? `
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #78716c;">
              DANH SÁCH TÁC PHẨM TRONG LÔ (${payload.items.length})
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid #ded8c8;">
              <thead>
                <tr style="background-color: #f4efe3;">
                  <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #2b2621; border-bottom: 1px solid #ded8c8;">Tác phẩm</th>
                  <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #2b2621; border-bottom: 1px solid #ded8c8;">Kích thước</th>
                  <th align="right" style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #2b2621; border-bottom: 1px solid #ded8c8;">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                ${payload.items
                  .map(
                    (item, idx) => `
                  <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#fcfaf4"};">
                    <td style="padding: 10px 12px; font-size: 13px; color: #2b2621; border-bottom: 1px solid #ece6d8;">
                      <strong>${escapeHtml(item.artworkName)}</strong>
                      ${item.category ? `<br/><span style="font-size: 11px; color: #78716c;">${escapeHtml(item.category)}</span>` : ""}
                    </td>
                    <td style="padding: 10px 12px; font-size: 13px; color: #57534e; border-bottom: 1px solid #ece6d8;">
                      ${escapeHtml(item.dimensions || "Tiêu chuẩn")}
                    </td>
                    <td align="right" style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #2b2621; border-bottom: 1px solid #ece6d8;">
                      ${Number(item.quantity || 0).toLocaleString("vi-VN")} bản
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </td>
        </tr>
      `
      : "";

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7ef; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2b2621; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf7ef; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; width: 100%; background-color: #ffffff; border: 1px solid #ded8c8;">
          <!-- Top accent bar -->
          <tr>
            <td style="height: 4px; background-color: #9c3826; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #ece6d8;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #9c3826;">
                      VCRAFT · SẮC MỘC ĐÔNG HỒ
                    </span>
                    <h1 style="margin: 8px 0 0 0; font-family: 'Times New Roman', Times, serif; font-size: 25px; font-weight: 700; line-height: 1.3; color: #2b2621;">
                      Lô tranh của bạn đã hoàn tất chế tác
                    </h1>
                  </td>
                  <td align="right" valign="middle" style="width: 56px; padding-left: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #9c3826;">
                      <tr>
                        <td style="padding: 2px;">
                          <div style="background-color: #9c3826; color: #faf7ef; padding: 6px 8px; text-align: center; font-family: 'SimSun', 'Songti SC', 'Noto Serif CJK SC', 'Times New Roman', serif; font-size: 17px; font-weight: 400; line-height: 1.1;">
                            東<br/>湖
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting & Intro -->
          <tr>
            <td style="padding: 24px 32px 18px 32px; font-size: 14.5px; line-height: 1.65; color: #2b2621;">
              <p style="margin: 0 0 12px 0;">Kính gửi <strong>${safeRecipient}</strong>,</p>
              <p style="margin: 0;">
                Nghệ nhân tại <strong>${safeWorkshop}</strong> vừa hoàn thiện chế tác và xuất bản trang truy xuất nguồn gốc cho lô tranh <strong>&ldquo;${safeTitle}&rdquo;</strong> của bạn. Toàn bộ hành trình in khắc gỗ thủ công và nhật ký sản xuất đã được lưu giữ vĩnh viễn kèm mã QR định danh dưới đây.
              </p>
            </td>
          </tr>

          <!-- Batch Info Summary -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf7ef; border: 1px solid #ded8c8;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13.5px; line-height: 1.6;">
                      <tr>
                        <td style="padding: 4px 0; color: #78716c; width: 42%;">Mã định danh lô tranh:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #9c3826; font-family: 'Courier New', Courier, monospace; font-size: 14px;">${safeBatchCode}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #78716c;">Xưởng chế tác:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #2b2621;">${safeWorkshop}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #78716c;">Tổng số lượng xuất xưởng:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #2b2621;">${qtyFormatted} bản in thủ công</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #78716c;">Ngày xuất xưởng:</td>
                        <td style="padding: 4px 0; color: #2b2621;">${completedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${itemsRowsHtml}

          <!-- QR Code & Trace CTA -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #ded8c8; background-color: #ffffff;">
                <tr>
                  <td align="center" style="padding: 24px 20px;">
                    <p style="margin: 0 0 14px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #78716c;">
                      MÃ QR TRUY XUẤT NGUỒN GỐC LÔ TRANH
                    </p>
                    <div style="display: inline-block; padding: 12px; background-color: #faf7ef; border: 1px solid #ded8c8;">
                      <img src="cid:vcraft-qr-code" alt="Mã QR truy xuất lô tranh ${safeBatchCode}" width="220" height="220" style="display: block; width: 220px; height: 220px;" />
                    </div>
                    <p style="margin: 14px auto 20px auto; max-width: 440px; font-size: 13px; line-height: 1.6; color: #57534e;">
                      Quét mã QR để dõi theo từng lớp ván khắc, quy trình in màu tự nhiên và câu chuyện của nghệ nhân trong quá trình hoàn thiện lô tranh của bạn.
                    </p>
                    <a href="${safeTraceUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 13px 26px; background-color: #9c3826; color: #ffffff; text-decoration: none; font-size: 13.5px; font-weight: 600; letter-spacing: 0.03em;">
                      Khám Phá Trang Truy Xuất Nguồn Gốc Lô Tranh
                    </a>
                    <p style="margin: 14px 0 0 0; font-size: 12px; color: #78716c; word-break: break-all;">
                      Hoặc mở trực tiếp liên kết: <a href="${safeTraceUrl}" style="color: #9c3826; text-decoration: underline;">${safeTraceUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f4efe3; border-top: 1px solid #ded8c8; font-size: 12px; line-height: 1.6; color: #78716c;">
              <p style="margin: 0 0 4px 0; color: #2b2621; font-weight: 600;">vCraft · Nền tảng kết nối làng nghề tranh dân gian Đông Hồ</p>
              <p style="margin: 0;">Email này được gửi tự động khi xưởng hoàn tất chế tác lô tranh của bạn. Xin cảm ơn bạn đã đồng hành cùng nghệ nhân lưu giữ hồn quê Việt.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const itemsText =
    payload.items && payload.items.length > 0
      ? "\nDanh sách tác phẩm:\n" +
        payload.items
          .map(
            (it) =>
              `- ${it.artworkName} (${it.dimensions || "Tiêu chuẩn"}): ${Number(it.quantity || 0).toLocaleString("vi-VN")} bản`,
          )
          .join("\n")
      : "";

  const text = [
    `Kính gửi ${payload.recipientName || "Quý khách"},`,
    "",
    `Nghệ nhân tại ${payload.workshopName} đã hoàn thiện chế tác và xuất bản trang truy xuất nguồn gốc cho lô tranh "${payload.quoteTitle}".`,
    "",
    `Mã định danh lô tranh: ${payload.batchCode}`,
    `Xưởng chế tác: ${payload.workshopName}`,
    `Tổng số lượng xuất xưởng: ${qtyFormatted} bản in thủ công`,
    `Ngày xuất xưởng: ${completedDate}`,
    itemsText,
    "",
    `Xem trang truy xuất nguồn gốc: ${payload.traceUrl}`,
    `Ảnh mã QR chất lượng cao được đính kèm trong email này (vcraft-qr-${payload.batchCode}.png).`,
    "",
    "Trân trọng,",
    "vCraft · Sắc mộc Đông Hồ",
  ].join("\n");

  return { subject, text, html };
}
