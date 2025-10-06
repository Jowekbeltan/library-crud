const nodemailer = require('nodemailer');

// Email configuration (using Gmail as example)
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Email templates
const emailTemplates = {
    dueDateReminder: (user, book, dueDate) => ({
        from: '"Library Management System" <noreply@library.com>',
        to: user.email,
        subject: `📚 Due Date Reminder: ${book.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">📚 Library Book Due Date Reminder</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #e74c3c; margin-top: 0;">Book Due Soon!</h3>
                    <p><strong>Book:</strong> ${book.title}</p>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                </div>
                <p>Please return or renew this book before the due date to avoid late fees.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #7f8c8d; font-size: 0.9em;">
                        Best regards,<br>
                        Library Management System
                    </p>
                </div>
            </div>
        `
    }),
    
    overdueNotice: (user, book, dueDate, daysOverdue) => ({
        from: '"Library Management System" <noreply@library.com>',
        to: user.email,
        subject: `⚠️ Overdue Book: ${book.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e74c3c;">⚠️ Overdue Book Notice</h2>
                <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #721c24; margin-top: 0;">Book is Overdue!</h3>
                    <p><strong>Book:</strong> ${book.title}</p>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                    <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
                </div>
                <p>Please return this book immediately to avoid accumulating late fees.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #7f8c8d; font-size: 0.9em;">
                        Library Management System
                    </p>
                </div>
            </div>
        `
    })
};

// Send email function
async function sendEmail(mailOptions) {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    transporter,
    emailTemplates,
    sendEmail
};