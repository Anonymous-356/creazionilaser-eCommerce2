   // Example using Nodemailer in a Express.js backend
    import  nodemailer  from "nodemailer";

    const transporter =  nodemailer.createTransport({
        host: 'mail.efficientitconsulting.com',
        port: 587, // or 465 for SSL
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'admin@efficientitconsulting.com',
            pass: 'Admin*&^786'
        }
    });

    export default transporter;

    //SMTP Creazionilaser.com
    //HOST : mail.creazionilaser.com
    //PORT : 587
    //USER : noreply@creazionilaser.com
    //PASS : Z6sRdpdzkWfWTPhjuEeB