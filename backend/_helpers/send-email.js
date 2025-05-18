const nodemailer = require('nodemailer');
const config = require('config.js');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    const transporter = nodemailer.createTransport(config.smtpOptions);

    try {
        const info = await transporter.sendMail({ from, to, subject, html });
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info)); // 👈 This is how you "view" it
    } catch (err) {
        console.error('Email send failed:', err);
    }
}
