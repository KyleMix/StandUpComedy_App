import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

export const mailer = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPassword ? { user: smtpUser, pass: smtpPassword } : undefined
});

export async function sendMail(options: { to: string; subject: string; html: string; text?: string }) {
  if (!smtpHost || !smtpUser) {
    console.warn("SMTP credentials not configured; skipping email send");
    return;
  }
  await mailer.sendMail({
    from: process.env.SMTP_FROM ?? `the-funny <${smtpUser}>`,
    ...options
  });
}

export const mailTemplates = {
  signInLink: (link: string) => ({
    subject: "Your sign-in link for the-funny",
    html: `<p>Click <a href="${link}">here</a> to sign in. This link expires in 15 minutes.</p>`,
    text: `Sign in using this link: ${link}`
  }),
  verificationSubmitted: (name: string) => ({
    subject: "Verification received",
    html: `<p>Hi ${name},</p><p>We received your verification request and will review it shortly.</p>`,
    text: `Hi ${name}, we received your verification request.`
  }),
  verificationDecision: (name: string, status: string) => ({
    subject: `Verification ${status.toLowerCase()}`,
    html: `<p>Hi ${name},</p><p>Your verification request was ${status.toLowerCase()}.</p>`,
    text: `Your verification request was ${status.toLowerCase()}.`
  }),
  applicationReceived: (gigTitle: string) => ({
    subject: `Application received for ${gigTitle}`,
    html: `<p>Thanks for applying to ${gigTitle}. We'll let you know once the promoter responds.</p>`,
    text: `Application received for ${gigTitle}.`
  })
};
