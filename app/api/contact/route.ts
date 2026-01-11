export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as nodemailer from "nodemailer";
import crypto from "crypto";

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanText(input: unknown) {
  return String(input ?? "").replace(/\r/g, "").trim();
}

const PALETTE = {
  dark: "#0B0F19",
  orange: "#E35D17",
  orangeHover: "#CC4F10",
  text: "#111827",
  muted: "#6B7280",
  border: "#E6E8EF",
  bgMint: "#E9FAF7",
  bgPeach: "#FFF1E7",
  card: "#FFFFFF",
};

function buildEmailLayout(params: {
  preheader: string;
  title: string;
  subtitle?: string;
  contentHtml: string;
  footerHtml?: string;
}) {
  const { preheader, title, subtitle, contentHtml, footerHtml } = params;

  // NOTE: Google Fonts sering diblok beberapa email client (terutama Outlook).
  // Tapi kita tetap set Montserrat + fallback biar tetap enak.
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>

  <style>
    /* Montserrat (sebagian client tidak load—fallback tetap aman) */
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

    /* Reset ringan */
    html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
    table, td { border-collapse: collapse !important; }
    img { border:0; line-height:100%; outline:none; text-decoration:none; }
    a { text-decoration:none; }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .px { padding-left: 16px !important; padding-right: 16px !important; }
      .py { padding-top: 16px !important; padding-bottom: 16px !important; }
      .btn { display:block !important; width:100% !important; }
      .btn a { display:block !important; }
      .stack { display:block !important; width:100% !important; }
      .mt { margin-top: 12px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background:${PALETTE.bgMint};">
  <!-- Preheader (hidden) -->
  <div style="display:none; font-size:1px; color:${PALETTE.bgMint}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <!-- Background wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background: linear-gradient(120deg, ${PALETTE.bgMint} 0%, ${PALETTE.bgPeach} 100%);">
    <tr>
      <td align="center" style="padding:24px;" class="px py">

        <!-- Container -->
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0"
          class="container"
          style="width:640px; max-width:640px; font-family:'Montserrat', Arial, Helvetica, sans-serif;">

          <!-- Top Brand Bar -->
          <tr>
            <td style="background:${PALETTE.dark}; padding:18px 22px; border-radius:18px 18px 0 0;">
              <div style="color:#fff; font-size:12px; opacity:.85; letter-spacing:.2px; font-weight:600;">
                Yayasan Rumsram Biak - Papua
              </div>
              <div style="color:#fff; font-size:18px; font-weight:700; margin-top:4px;">
                ${escapeHtml(title)}
              </div>
              ${
                subtitle
                  ? `<div style="color:#fff; font-size:12px; opacity:.85; margin-top:6px;">${escapeHtml(
                      subtitle
                    )}</div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${PALETTE.card}; border:1px solid ${PALETTE.border}; border-top:0; padding:22px; border-radius:0 0 18px 18px;">
              ${contentHtml}
              ${
                footerHtml
                  ? `<div style="margin-top:18px; padding-top:16px; border-top:1px solid ${PALETTE.border};">
                      ${footerHtml}
                    </div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Bottom note -->
          <tr>
            <td style="padding:14px 6px 0; text-align:center; color:${PALETTE.muted}; font-size:12px; font-family:'Montserrat', Arial, Helvetica, sans-serif;">
              Email ini dikirim otomatis dari website Yayasan Rumsram.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(label: string, href: string) {
  return `
  <div class="btn" style="margin:0;">
    <a href="${href}"
      style="
        background:${PALETTE.orange};
        color:#fff;
        padding:12px 16px;
        border-radius:14px;
        font-weight:700;
        font-size:14px;
        display:inline-block;
        text-align:center;
      ">
      ${escapeHtml(label)}
    </a>
  </div>`;
}

function pillLink(label: string, href: string) {
  return `
  <a href="${href}"
    style="
      display:inline-block;
      padding:10px 12px;
      border-radius:14px;
      border:1px solid ${PALETTE.border};
      color:${PALETTE.text};
      background:#fff;
      font-weight:700;
      font-size:13px;
      margin-right:8px;
      margin-top:8px;
    ">
    ${escapeHtml(label)}
  </a>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = cleanText(body?.name);
    const email = cleanText(body?.email);
    const message = cleanText(body?.message);
    const website = cleanText(body?.website); // honeypot

    // honeypot anti-bot
    if (website) return NextResponse.json({ ok: true });

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Field wajib diisi (nama, email, pesan)." },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // tujuan email masuk (sementara kamu pakai gmail)
    const to = process.env.CONTACT_TO_EMAIL || "marifirfannn@gmail.com";

    const fromEmail = process.env.MAIL_FROM || "no-reply@rumsram.or.id";
    const fromName = process.env.MAIL_FROM_NAME || "Yayasan Rumsram";

    // kontak resmi (dari kamu)
    const officialEmail = "info@rumsram.or.id";
    const waNumber = "08123456789";
    const waLink = `https://wa.me/${waNumber.replace(/^0/, "62")}`;
    const siteUrl = "https://rumsram.or.id";

    if (!host || !user || !pass) {
      return NextResponse.json(
        { ok: false, error: "ENV SMTP belum lengkap (SMTP_HOST/SMTP_USER/SMTP_PASS)." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.verify();

    const ref = crypto.randomUUID().slice(0, 8).toUpperCase();

    // ======================
    // 1) Email masuk ke yayasan (admin)
    // ======================
    const adminText = `Pesan dari website ${siteUrl}

Ref: ${ref}
Nama: ${name}
Email: ${email}

Pesan:
${message}
`;

    const adminHtml = buildEmailLayout({
      preheader: `Pesan baru dari ${name} • Ref ${ref}`,
      title: "Pesan Baru dari Website",
      subtitle: `Ref: ${ref}`,
      contentHtml: `
        <div style="color:${PALETTE.text}; font-size:14px; line-height:1.7;">
          <div style="margin:0 0 12px; color:${PALETTE.muted}; font-weight:600; font-size:13px;">
            Sumber: <a href="${siteUrl}" style="color:${PALETTE.orange}; font-weight:700;">${siteUrl}</a>
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="border:1px solid ${PALETTE.border}; border-radius:16px; overflow:hidden;">
            <tr>
              <td style="padding:14px 14px; background:#fff;">
                <div style="font-weight:800; font-size:12px; letter-spacing:.2px; color:${PALETTE.muted}; margin-bottom:8px;">
                  CONTACT INFO
                </div>
                <div style="margin:0 0 6px;"><b>Nama:</b> ${escapeHtml(name)}</div>
                <div style="margin:0 0 6px;"><b>Email:</b> ${escapeHtml(email)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 14px; background:#F9FAFB; border-top:1px solid ${PALETTE.border};">
                <div style="font-weight:800; font-size:12px; letter-spacing:.2px; color:${PALETTE.muted}; margin-bottom:8px;">
                  MESSAGE
                </div>
                <div style="white-space:pre-wrap;">${escapeHtml(message)}</div>
              </td>
            </tr>
          </table>

          <div style="margin-top:14px; color:${PALETTE.muted}; font-size:12px;">
            Tips: klik reply untuk membalas pengirim (replyTo sudah diarahkan ke email pengirim).
          </div>
        </div>
      `,
      footerHtml: `
        <div style="font-size:12px; color:${PALETTE.muted};">
          Ref <b>${ref}</b> • Simpan email ini untuk tracking.
        </div>
      `,
    });

    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      replyTo: email,
      subject: `[Website] Pesan baru dari ${name} (Ref ${ref})`,
      text: adminText,
      html: adminHtml,
    });

    // ======================
    // 2) Auto-reply ke pengirim (user)
    // ======================
    const subjectReply = `Terima kasih - Pesan Anda sudah kami terima (Ref ${ref})`;

    const textReply = `Halo ${name},

Terima kasih telah menghubungi Yayasan Rumsram Biak - Papua.
Pesan Anda sudah kami terima dengan baik dan akan kami tindak lanjuti secepatnya.

Ref: ${ref}

Kontak resmi:
- Email   : ${officialEmail}
- WhatsApp: ${waNumber}
- Website : ${siteUrl}

Hormat kami,
Yayasan Rumsram
`;

    const userHtml = buildEmailLayout({
      preheader: `Pesan Anda sudah kami terima • Ref ${ref}`,
      title: "Terima kasih, pesan Anda sudah kami terima",
      subtitle: `Ref: ${ref}`,
      contentHtml: `
        <div style="color:${PALETTE.text}; font-size:14px; line-height:1.8;">
          <p style="margin:0 0 12px;">Halo <b>${escapeHtml(name)}</b>,</p>

          <p style="margin:0 0 12px;">
            Terima kasih telah menghubungi <b>Yayasan Rumsram</b>.
            Pesan Anda sudah masuk ke sistem kami dan akan kami tindak lanjuti secepatnya.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="margin:14px 0; border:1px solid ${PALETTE.border}; border-radius:16px; overflow:hidden;">
            <tr>
              <td style="padding:12px 14px; background:#fff;">
                <div style="font-weight:800; font-size:12px; letter-spacing:.2px; color:${PALETTE.muted}; margin-bottom:8px;">
                  RINGKASAN
                </div>
                <div style="margin:0 0 6px;"><b>Nama:</b> ${escapeHtml(name)}</div>
                <div style="margin:0 0 0;"><b>Email:</b> ${escapeHtml(email)}</div>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 12px; color:${PALETTE.muted};">
            Jika pesan ini bersifat mendesak, Anda dapat menghubungi kami melalui kontak resmi berikut:
          </p>

          <!-- CTA Primary -->
          ${primaryButton("Buka Website Resmi", siteUrl)}

          <!-- Secondary links -->
          <div style="margin-top:10px;">
            ${pillLink(`Email: ${officialEmail}`, `mailto:${officialEmail}`)}
            ${pillLink(`WhatsApp: ${waNumber}`, waLink)}
          </div>
        </div>
      `,
      footerHtml: `
        <div style="font-size:12px; color:${PALETTE.muted}; line-height:1.7;">
          Email ini dikirim otomatis. Jika Anda tidak merasa mengirim pesan melalui website, Anda dapat mengabaikan email ini.
        </div>
      `,
    });

    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: subjectReply,
      text: textReply,
      html: userHtml,
      replyTo: officialEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "SMTP error" },
      { status: 500 }
    );
  }
}
