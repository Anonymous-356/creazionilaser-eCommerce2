   // Example using Nodemailer in a Express.js backend
    import  nodemailer  from "nodemailer";

    const transporter =  nodemailer.createTransport({
        host: 'Creazionilaser.com',
        port: 587, // or 465 for SSL
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'noreply@creazionilaser.com',
            pass: 'Z6sRdpdzkWfWTPhjuEeB'
        }
    });

    export default transporter;

    //SMTP Creazionilaser.com
    //HOST : mail.creazionilaser.com
    //PORT : 587
    //USER : noreply@creazionilaser.com
    //PASS : Z6sRdpdzkWfWTPhjuEeB