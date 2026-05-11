const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.PASSWORD
    }
});

module.exports = transporter;

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail,name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hi ${name},\n\nThank you for registering with Backend Ledger. We're excited to have you on board!`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering with Backend Ledger. We're excited to have you on board!</p>`;

    await sendEmail(userEmail,subject,text,html);


}

async function sendTransactionEmail(userEmail,name,amount,toAccount){
  const subject = 'Transaction Sucessful!';
  const text = `Hi ${name},\n\nYour transaction of amount ${amount} to account ${toAccount} was successful.`;
  const html = `<p>Hi ${name},</p><p>Your transaction of amount ${amount} to account ${toAccount} was successful.</p>`;

  await sendEmail(userEmail,subject,text,html);
}

async function sendFailedTransactionEmail(userEmail,name,amount,toAccount){
  const subject = 'Transaction Failed!';
  const text = `Hi ${name},\n\nYour transaction of amount ${amount} to account ${toAccount} has failed. Please try again later.`;
  const html = `<p>Hi ${name},</p><p>Your transaction of amount ${amount} to account ${toAccount} has failed. Please try again later.</p>`;

  await sendEmail(userEmail,subject,text,html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendFailedTransactionEmail
}