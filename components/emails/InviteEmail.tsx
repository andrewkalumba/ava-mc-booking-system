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
  inviterName,
}: InviteEmailProps) {
  const roleLabel =
    role === 'admin'   ? 'Administrator' :
    role === 'sales'   ? 'Sales Staff'   :
    role === 'service' ? 'Service Staff' : role;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>You&apos;re invited to {dealershipName}</title>
      </head>
      <body style={styles.body}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={styles.wrapper}>
          <tr>
            <td align="center">
              <table width="560" cellPadding="0" cellSpacing="0" style={styles.card}>

                {/* Brand bar */}
                <tr>
                  <td style={styles.brandBar} />
                </tr>

                {/* Header */}
                <tr>
                  <td style={styles.header}>
                    <div style={styles.logoBox}>
                      <span style={styles.logoText}>B</span>
                    </div>
                    <p style={styles.appName}>BikeMeNow</p>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={styles.body2}>
                    <h1 style={styles.title}>You&apos;re invited!</h1>
                    <p style={styles.para}>
                      Hi <strong>{inviteeName}</strong>,
                    </p>
                    <p style={styles.para}>
                      <strong>{inviterName}</strong> has invited you to join{' '}
                      <strong>{dealershipName}</strong> on BikeMeNow as a{' '}
                      <span style={styles.roleBadge}>{roleLabel}</span>.
                    </p>

                    {/* CTA */}
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center" style={{ paddingTop: 28, paddingBottom: 28 }}>
                          <a href={inviteUrl} style={styles.button}>
                            Accept Invitation
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style={styles.hint}>
                      Or copy and paste this link into your browser:
                    </p>
                    <p style={styles.link}>{inviteUrl}</p>

                    <hr style={styles.divider} />

                    <p style={styles.footer}>
                      This invitation was sent by {inviterName} at {dealershipName}.
                      If you weren&apos;t expecting this, you can safely ignore this email.
                      The link expires in 48 hours.
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={styles.footerBar}>
                    <p style={styles.footerText}>
                      BikeMeNow · Motorcycle Dealership Platform
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
    backgroundColor: '#f5f7fa',
    margin: 0,
    padding: '40px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  wrapper: {
    backgroundColor: '#f5f7fa',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    maxWidth: 560,
    width: '100%',
  },
  brandBar: {
    height: 4,
    background: 'linear-gradient(90deg, #FF6B2C 0%, #ff9a6c 60%, transparent 100%)',
  },
  header: {
    backgroundColor: '#0b1524',
    padding: '28px 40px',
    textAlign: 'center' as const,
  },
  logoBox: {
    display: 'inline-block',
    width: 48,
    height: 48,
    backgroundColor: '#FF6B2C',
    borderRadius: 12,
    lineHeight: '48px',
    textAlign: 'center' as const,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 700,
  },
  appName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 700,
    margin: '8px 0 0',
    letterSpacing: '0.02em',
  },
  body2: {
    padding: '40px 40px 32px',
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: '#0b1524',
    margin: '0 0 20px',
  },
  para: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 1.6,
    margin: '0 0 12px',
  },
  roleBadge: {
    display: 'inline-block',
    backgroundColor: '#FF6B2C',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 700,
    padding: '2px 10px',
    borderRadius: 20,
    verticalAlign: 'middle',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#FF6B2C',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 700,
    padding: '14px 36px',
    borderRadius: 12,
    textDecoration: 'none',
    letterSpacing: '0.01em',
  },
  hint: {
    fontSize: 13,
    color: '#94a3b8',
    margin: '0 0 6px',
  },
  link: {
    fontSize: 12,
    color: '#FF6B2C',
    wordBreak: 'break-all' as const,
    margin: '0 0 24px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '24px 0',
  },
  footer: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
  },
  footerBar: {
    backgroundColor: '#f8fafc',
    padding: '16px 40px',
    borderTop: '1px solid #f1f5f9',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    margin: 0,
  },
};
