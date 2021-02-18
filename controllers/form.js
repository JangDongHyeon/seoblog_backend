
const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.contactForm = async (req, res, next) => {
    try {
        const { email, name, message } = req.body;
        const emailData = {
            to: process.env.EMAIL_TO,
            from: email,
            // subject: `Contact form - ${process.env.subject}`,
            subject: `Contact form - hi`,
            text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
            html: `
            <h4>Email received from contact form:</h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `
        };
        sgMail.send(emailData).then(sent => {
            return res.json({
                success: true
            });
        });
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.contactBlogAuthorForm = (req, res) => {
    try {
        const { authorEmail, email, name, message } = req.body;
        // console.log(req.body);

        let maillist = [authorEmail, process.env.EMAIL_TO];

        const emailData = {
            to: maillist,
            from: email,
            subject: `Someone messaged you from ${process.env.APP_NAME}`,
            text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
            html: `
            <h4>Message received from:</h4>
            <p>name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `
        };

        sgMail.send(emailData).then(sent => {
            return res.json({
                success: true
            });
        });
    } catch (error) {
        console.error(error);
        next(error)
    }
};