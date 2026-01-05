const PDFDocument = require('pdfkit');

const generateUserHistoryPDF = (user, history, payments, res) => {
    const doc = new PDFDocument();

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Members App - User History Report', { align: 'center' });
    doc.moveDown();

    // User Info
    doc.fontSize(14).text(`User: ${user.first_name} ${user.last_name} (${user.email})`);
    doc.text(`Member Type: ${user.member_type || 'N/A'}`);
    doc.text(`Status: ${user.status}`);
    doc.moveDown();

    // Action History
    doc.fontSize(16).text('Action History');
    doc.moveDown(0.5);

    history.forEach(action => {
        doc.fontSize(12).text(`${new Date(action.created_at).toLocaleDateString()} - ${action.action_type}`);
        doc.fontSize(10).text(action.action_description);
        doc.moveDown(0.5);
    });

    doc.moveDown();

    // Payment History
    doc.fontSize(16).text('Payment History');
    doc.moveDown(0.5);

    payments.forEach(payment => {
        doc.fontSize(12).text(`${new Date(payment.created_at).toLocaleDateString()} - €${payment.amount}`);
        doc.fontSize(10).text(`Method: ${payment.payment_method} | Status: ${payment.payment_status}`);
        doc.moveDown(0.5);
    });

    doc.end();
};

module.exports = {
    generateUserHistoryPDF
};
