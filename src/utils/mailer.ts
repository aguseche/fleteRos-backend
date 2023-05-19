import nodemailer, { SentMessageInfo } from 'nodemailer';

class Mailer {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465 false for other ports
            auth: {
                user: process.env.MAIL_APP_USERNAME,
                pass: process.env.MAIL_APP_PASSWORD
            }
        });
    }

    public async sendMail(
        to: string,
        subject: string,
        html: string
    ): Promise<SentMessageInfo> {
        const mailOptions = {
            from: `FleteRos Contacto ${process.env.MAIL_APP_USERNAME}`,
            to,
            subject,
            html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return info;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default Mailer;
