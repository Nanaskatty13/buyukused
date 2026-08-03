const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (to, name) => {
    try {
        await transporter.sendMail({
            from: `"KN Smart Gadgets Hub" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Welcome to KN Smart Gadgets Hub 🎉',
            html: `
                <h2>Hello ${name},</h2>
                <p>Thanks for signing up at KN Smart Gadgets Hub.</p>
                <p>Buy, sell and swap gadgets easily with us.</p>
                <br>
                <b>KN Smart Gadgets Hub</b>
            `
        });

        console.log('Welcome email sent');
    } catch (error) {
        console.log(error);
    }
};

const sendResetEmail = async (to, resetLink) => {
    try {
        await transporter.sendMail({
            from: `"KN Smart Gadgets Hub" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Reset Your Password',
            html: `
                <h2>Password Reset</h2>
                <p>Click link below to reset your password:</p>

                <a href="${resetLink}">
                    Reset Password
                </a>

                <p>If you did not request this, ignore this email.</p>
            `
        });

        console.log('Reset email sent');
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendResetEmail
};