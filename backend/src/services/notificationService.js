const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verifyEmailConnection() {
  await transporter.verify();

  console.log("✅ SMTP Hostinger conectado correctamente");

  return true;
}

async function sendEmail({ to, subject, html }) {
  if (!to) {
    throw new Error("Destinatario de correo requerido");
  }

  const info = await transporter.sendMail({
    from: `"Rivecor Store" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log("📧 Correo enviado:", info.messageId);

  return info;
}

function buildBaseEmail(content) {
  return `
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Rivecor Store</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#070809;
    font-family:Arial,Helvetica,sans-serif;
    color:#ffffff;
  "
>

  <div
    style="
      max-width:650px;
      margin:0 auto;
      padding:30px 20px;
    "
  >

    <div
      style="
        background:#111318;
        border:1px solid #5b6372;
        border-radius:20px;
        overflow:hidden;
      "
    >

      <!-- HEADER -->

      <div
        style="
          padding:28px;
          text-align:center;
          background:#0b0d10;
          border-bottom:1px solid #5b6372;
        "
      >

        <h1
          style="
            margin:0;
            color:#f9dd6f;
            font-size:28px;
            letter-spacing:1px;
          "
        >
          RIVECOR STORE
        </h1>

      </div>


      <!-- CONTENIDO -->

      <div
        style="
          padding:30px;
        "
      >

        ${content}

      </div>


      <!-- FOOTER -->

      <div
        style="
          padding:20px;
          text-align:center;
          background:#0b0d10;
          border-top:1px solid #5b6372;
          color:#c1b782;
          font-size:12px;
        "
      >

        Rivecor Store · Coquimbo, Chile

      </div>

    </div>

  </div>

</body>

</html>
  `;
}

module.exports = {
  sendEmail,
  buildBaseEmail,
  verifyEmailConnection,
};