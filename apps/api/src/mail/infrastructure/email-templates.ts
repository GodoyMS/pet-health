const BRAND = {
  name: "Pet Health Tracker",
  primary: "#2A9B8F",
  primaryDark: "#1F7A71",
  gradientStart: "#31A396",
  gradientEnd: "#46B86E",
  background: "#FAFAFA",
  card: "#FFFFFF",
  foreground: "#1A1A1A",
  muted: "#737373",
  border: "#E5E5E5",
  fontFamily: "'DM Sans', Arial, Helvetica, sans-serif"
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(params: {
  preheader: string;
  title: string;
  bodyHtml: string;
  footerNote: string;
}): string {
  const preheader = escapeHtml(params.preheader);
  const title = escapeHtml(params.title);
  const footerNote = escapeHtml(params.footerNote);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:${BRAND.background};color:${BRAND.foreground};font-family:${BRAND.fontFamily};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd});padding:28px 32px;">
              <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;">
                ${escapeHtml(BRAND.name)}
              </p>
              <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#FFFFFF;font-weight:700;">
                ${title}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;border-top:1px solid ${BRAND.border};">
              <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">
                ${footerNote}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function codeBlock(code: string): string {
  const digits = escapeHtml(code)
    .split("")
    .map(
      (digit) =>
        `<span style="display:inline-block;min-width:34px;margin:0 3px;padding:12px 0;border-radius:8px;background:${BRAND.background};border:1px solid ${BRAND.border};font-size:22px;font-weight:700;letter-spacing:0;color:${BRAND.primaryDark};">${digit}</span>`
    )
    .join("");

  return `<div style="text-align:center;margin:24px 0;">${digits}</div>`;
}

export function buildVerificationEmail(params: {
  name: string;
  code: string;
}): { subject: string; html: string; text: string } {
  const name = escapeHtml(params.name.trim() || "there");
  const subject = `Verify your ${BRAND.name} email`;
  const text = [
    `Hi ${params.name.trim() || "there"},`,
    "",
    `Your verification code is ${params.code}.`,
    "It expires in 10 minutes.",
    "",
    `If you did not create a ${BRAND.name} account, you can ignore this email.`
  ].join("\n");

  const html = layout({
    preheader: `Your verification code is ${params.code}`,
    title: "Confirm your email",
    footerNote:
      "If you did not create this account, you can safely ignore this email.",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${BRAND.foreground};">
        Hi ${name},
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">
        Enter this code to finish creating your ${escapeHtml(BRAND.name)} account.
        The code expires in <strong style="color:${BRAND.foreground};">10 minutes</strong>.
      </p>
      ${codeBlock(params.code)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
        Never share this code with anyone.
      </p>
    `
  });

  return { subject, html, text };
}

export function buildPasswordResetEmail(params: {
  name: string;
  code: string;
}): { subject: string; html: string; text: string } {
  const name = escapeHtml(params.name.trim() || "there");
  const subject = `Reset your ${BRAND.name} password`;
  const text = [
    `Hi ${params.name.trim() || "there"},`,
    "",
    `Your password reset code is ${params.code}.`,
    "It expires in 10 minutes.",
    "",
    `If you did not request a password reset, you can ignore this email.`
  ].join("\n");

  const html = layout({
    preheader: `Your password reset code is ${params.code}`,
    title: "Reset your password",
    footerNote:
      "If you did not request a password reset, you can safely ignore this email.",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${BRAND.foreground};">
        Hi ${name},
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">
        Use this code to choose a new password for your ${escapeHtml(BRAND.name)} account.
        The code expires in <strong style="color:${BRAND.foreground};">10 minutes</strong>.
      </p>
      ${codeBlock(params.code)}
      <p style="margin:0;font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
        Never share this code with anyone.
      </p>
    `
  });

  return { subject, html, text };
}
