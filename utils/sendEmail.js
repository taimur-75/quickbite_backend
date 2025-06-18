const sendEmail = async (to, subject, message) => {
  console.log(`\n--- Simulated Email ---\nTo: ${to}\nSubject: ${subject}\nMessage: ${message}\n----------------------`);
};

module.exports = sendEmail;
