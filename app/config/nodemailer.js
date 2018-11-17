const pug = require('pug');
const path = require('path');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const secret = require('./secret.js');

const loadTemplate = (templateName, templateData) => {
    const filePath = path.resolve(__dirname, '../templates/'+ templateName + '.pug');
    return pug.compileFile(filePath)(templateData);
};

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: secret.nodemailer
    }
  })
);

const send = (to, subject, templateName, templateData) => {
  let config = {
    from: 'Sosharu <no-reply@sosharu.local>',
    to: to,
    subject: subject,
    html: loadTemplate(templateName, templateData),
  };
  transporter.sendMail(config, (err, resp) => {
    if (err) return console.log(err);
    console.log(resp);
  });
};

const registration = (data) => send(data.email, 'Thanks for Registeration', 'register', data);



module.exports = { send, transporter, registration };
