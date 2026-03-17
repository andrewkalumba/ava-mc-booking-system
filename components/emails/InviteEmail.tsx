import * as React from 'react';

interface InviteEmailProps {
  inviteeName:    string;
  dealershipName: string;
  role:           string;
  inviteUrl:      string;
  inviterName:    string;
}

export function InviteEmail({
  inviteeName,
  dealershipName,
  role,
  inviteUrl,
}: InviteEmailProps) {
  const roleLabel =
    role === 'admin'   ? 'Administratör' :
    role === 'sales'   ? 'Säljare'       :
    role === 'service' ? 'Servicetekniker' : role;

  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Du har bjudits in till {dealershipName}</title>
      </head>
      <body style={styles.body}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={styles.wrapper}>
          <tr>
            <td align="center" style={{ padding: '32px 16px' }}>
              <table width="560" cellPadding="0" cellSpacing="0" style={styles.card}>

                {/* Orange header */}
                <tr>
                  <td style={styles.header}>
                    <span style={styles.logoText}>BikeMeNow</span>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={styles.body2}>

                    {/* Greeting */}
                    <p style={styles.greeting}>Hej {inviteeName},</p>

                    {/* Heading */}
                    <h1 style={styles.title}>
                      Du har bjudits in till {dealershipName}
                    </h1>

                    {/* Body copy */}
                    <p style={styles.para}>
                      {dealershipName} har bjudit in dig att gå med i BikeMeNow som{' '}
                      <strong style={styles.roleHighlight}>{roleLabel}</strong>.
                      Klicka på knappen nedan för att verifiera din identitet med
                      BankID och aktivera ditt konto.
                    </p>

                    {/* CTA button */}
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td style={{ paddingTop: 28, paddingBottom: 28 }}>
                          <a href={inviteUrl} style={styles.button}>
                            Acceptera inbjudan →
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Disclaimer */}
                    <p style={styles.disclaimer}>
                      Länken gäller i 7 dagar. Om du inte begärt den här inbjudan
                      kan du ignorera detta mejl.
                    </p>

                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={styles.footerBar}>
                    <p style={styles.footerText}>
                      BikeMeNow · Inbjudan från {dealershipName}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#f5f5f5',
    margin: 0,
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },
  wrapper: {
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: 560,
    width: '100%',
  },
  header: {
    backgroundColor: '#E8612A',
    padding: '28px 40px',
    textAlign: 'left' as const,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
  body2: {
    padding: '36px 40px 28px',
  },
  greeting: {
    fontSize: 15,
    color: '#E8612A',
    margin: '0 0 10px',
    fontWeight: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 18px',
    lineHeight: 1.3,
  },
  para: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 1.65,
    margin: 0,
  },
  roleHighlight: {
    color: '#E8612A',
    fontWeight: 700,
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#E8612A',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 600,
    padding: '13px 28px',
    borderRadius: 6,
    textDecoration: 'none',
  },
  disclaimer: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 1.6,
    margin: 0,
  },
  footerBar: {
    borderTop: '1px solid #F3F4F6',
    padding: '16px 40px',
    textAlign: 'left' as const,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    margin: 0,
  },
};
