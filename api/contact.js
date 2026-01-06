// api/contact.js
// Place this file in your project root under: api/contact.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, business, message } = req.body;

    // Basic validation
    if (!name || !email || !business) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Configure your email service here
    // Option 1: Using SendGrid
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const TO_EMAIL = process.env.TO_EMAIL; // Your email address

    if (!SENDGRID_API_KEY || !TO_EMAIL) {
      console.error('Missing environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const emailData = {
      personalizations: [{
        to: [{ email: TO_EMAIL }],
        subject: `New Baseline Enquiry from ${business}`
      }],
     from: {
  email: 'br.robinson.uk@gmail.com',
  name: 'Baseline'
},

      reply_to: {
        email: email,
        name: name
      },
      content: [{
        type: 'text/html',
        value: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Business:</strong> ${business}</p>
          <p><strong>Message:</strong></p>
          <p>${message || 'No message provided'}</p>
          <hr>
          <p><small>Submitted from Baseline website contact form</small></p>
        `
      }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error processing form:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
