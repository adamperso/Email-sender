  const express = require('express');
  const nodemailer = require('nodemailer');
  const bodyParser = require('body-parser');

  const app = express();
  const port = 3000;

  console.log('🚀 Initialisation du serveur...');

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static('public'));

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'personneladam@gmail.com',
          pass: 'kdkc wzom ggof gmwh'
      }
  });

  console.log('📧 Transporteur email configuré');

  app.get('/', (req, res) => {
      console.log('📄 Page d\'accueil demandée');
      res.sendFile(__dirname + '/public/index.html');
  });

  app.post('/send-email', async (req, res) => {
      console.log('📨 Nouvelle demande d\'envoi d\'email reçue');
    
      const emailCount = parseInt(req.body.emailCount) || 50;
      const mailOptions = {
          from: {
              name: req.body.senderName.replace(/['"<>]/g, ''), // Supprime les caractères spéciaux
              address: req.body.senderEmail
          },
          to: req.body.recipient,
          subject: req.body.subject,
          text: req.body.message,
          html: req.body.message
      };

      let successCount = 0;
      let errors = [];

      console.log(`🔄 Début de l'envoi des ${emailCount} emails`);

      for(let i = 0; i < emailCount; i++) {
          console.log(`📤 Tentative d'envoi #${i + 1}`);
          try {
              await transporter.sendMail(mailOptions);
              successCount++;
              console.log(`✅ Email #${i + 1} envoyé avec succès`);
          } catch (error) {
              console.error(`❌ Erreur lors de l'envoi #${i + 1}:`, error.message);
              errors.push(`Erreur #${i+1}: ${error.message}`);
          }
      }

      res.json({
          status: errors.length === 0 ? 'success' : 'partial',
          message: `${successCount} emails envoyés sur ${emailCount}`,
          errors: errors
      });
  });

  app.listen(port, () => {
      console.log(`🌐 Serveur démarré sur http://localhost:${port}`);
  });