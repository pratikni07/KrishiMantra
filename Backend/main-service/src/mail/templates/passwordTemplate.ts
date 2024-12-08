export const passwordUpdated = (email: string, message: string): string => {
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Update Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          margin-top: 20px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        .highlight {
          color: #4CAF50;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Password Update Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear User,</p>
          <p>${message}</p>
          <p>If you did not make this change, please contact our support team immediately at 
          <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>
          <p>Your account security is important to us.</p>
          <p>Best regards,<br>Your Application Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>`;
  };