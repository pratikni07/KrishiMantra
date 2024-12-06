const nodemailer = require("nodemailer");
require('dotenv').config()


const mailSender = async (email:string, title:string, body:string) => {
    try{
            let transporter = nodemailer.createTransport({
                host:process.env.MAIL_HOST,
                port: 587,
                auth:{
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                }
            })
            let info = await transporter.sendMail({
                from: `"Study Notion" <${process.env.MAIL_USER}>`,
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log(info);
            return info;
    }
    catch(error:any) {
        console.log(error.message);
        return error;
    }
}


module.exports = mailSender;