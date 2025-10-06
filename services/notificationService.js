const cron = require('node-cron');
const db = require('../db');
const { emailTemplates, sendEmail } = require('./emailService');

class NotificationService {
    constructor() {
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        
        console.log('🔔 Starting notification service...');
        
        // Check for due dates every day at 9 AM
        cron.schedule('0 9 * * *', () => {
            this.checkDueDates();
        });
        
        // Check for overdue books every day at 10 AM
        cron.schedule('0 10 * * *', () => {
            this.checkOverdueBooks();
        });
        
        this.isRunning = true;
        console.log('✅ Notification service started');
    }

    async checkDueDates() {
        try {
            console.log('🔔 Checking for due date reminders...');
            
            // Find loans due in the next 2 days
            const twoDaysFromNow = new Date();
            twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
            
            const [loans] = await db.promise().query(`
                SELECT l.*, u.name, u.email, b.title, b.author 
                FROM loans l
                JOIN users u ON l.user_id = u.id
                JOIN books b ON l.book_id = b.id
                WHERE l.due_date = ? 
                AND l.status = 'active'
                AND l.return_date IS NULL
            `, [twoDaysFromNow.toISOString().split('T')[0]]);
            
            console.log(`Found ${loans.length} loans due in 2 days`);
            
            for (const loan of loans) {
                await this.sendDueDateReminder(loan);
            }
            
        } catch (error) {
            console.error('Error checking due dates:', error);
        }
    }

    async checkOverdueBooks() {
        try {
            console.log('🔔 Checking for overdue books...');
            
            const today = new Date().toISOString().split('T')[0];
            
            const [overdueLoans] = await db.promise().query(`
                SELECT l.*, u.name, u.email, b.title, b.author,
                       DATEDIFF(?, l.due_date) as days_overdue
                FROM loans l
                JOIN users u ON l.user_id = u.id
                JOIN books b ON l.book_id = b.id
                WHERE l.due_date < ? 
                AND l.status = 'active'
                AND l.return_date IS NULL
            `, [today, today]);
            
            console.log(`Found ${overdueLoans.length} overdue loans`);
            
            for (const loan of overdueLoans) {
                await this.sendOverdueNotice(loan);
            }
            
        } catch (error) {
            console.error('Error checking overdue books:', error);
        }
    }

    async sendDueDateReminder(loan) {
        const user = { name: loan.name, email: loan.email };
        const book = { title: loan.title, author: loan.author };
        
        const mailOptions = emailTemplates.dueDateReminder(user, book, loan.due_date);
        
        const result = await sendEmail(mailOptions);
        
        // Log the notification
        await db.promise().query(`
            INSERT INTO notifications (user_id, book_id, type, sent_at, status)
            VALUES (?, ?, 'due_reminder', NOW(), ?)
        `, [loan.user_id, loan.book_id, result.success ? 'sent' : 'failed']);
        
        return result;
    }

    async sendOverdueNotice(loan) {
        const user = { name: loan.name, email: loan.email };
        const book = { title: loan.title, author: loan.author };
        
        const mailOptions = emailTemplates.overdueNotice(user, book, loan.due_date, loan.days_overdue);
        
        const result = await sendEmail(mailOptions);
        
        // Log the notification
        await db.promise().query(`
            INSERT INTO notifications (user_id, book_id, type, sent_at, status)
            VALUES (?, ?, 'overdue', NOW(), ?)
        `, [loan.user_id, loan.book_id, result.success ? 'sent' : 'failed']);
        
        return result;
    }

    // Manual notification sending
    async sendManualNotification(userId, bookId, type) {
        try {
            const [users] = await db.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
            const [books] = await db.promise().query('SELECT * FROM books WHERE id = ?', [bookId]);
            
            if (users.length === 0 || books.length === 0) {
                throw new Error('User or book not found');
            }
            
            const user = users[0];
            const book = books[0];
            
            let mailOptions;
            if (type === 'due_reminder') {
                mailOptions = emailTemplates.dueDateReminder(user, book, new Date());
            } else if (type === 'overdue') {
                mailOptions = emailTemplates.overdueNotice(user, book, new Date(), 1);
            } else {
                throw new Error('Unknown notification type');
            }
            
            const result = await sendEmail(mailOptions);
            return result;
            
        } catch (error) {
            console.error('Manual notification failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new NotificationService();