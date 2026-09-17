import Link from 'next/link';

export const metadata = {
  title: 'Delete Your BG Laundry Account',
  description: 'Request deletion of your BG Laundry customer account and personal data.',
};

export default function DeleteAccountPage() {
  return (
    <main className="policy-page">
      <div className="policy-shell">
        <header className="policy-header">
          <Link className="policy-brand" href="/" aria-label="BG Laundry home">
            <span className="policy-brand-mark">BG</span>
            <span>BG Laundry</span>
          </Link>
        </header>

        <article className="policy-content">
          <p className="policy-eyebrow">Account controls</p>
          <h1>Delete your account</h1>
          <p className="policy-lead">
            To request deletion of your BG Laundry customer account and associated personal data,
            email us from the address or phone number connected to your account.
          </p>
          <section>
            <h2>How to request deletion</h2>
            <p>
              Send an email to{' '}
              <a href="mailto:support@bglaundry.com?subject=BG%20Laundry%20account%20deletion">
                support@bglaundry.com
              </a>{' '}
              with the subject “BG Laundry account deletion” and include your registered phone
              number. We may ask for reasonable verification before processing the request.
            </p>
          </section>
          <section>
            <h2>What will be deleted</h2>
            <p>
              We will delete your customer profile, saved addresses, authentication information,
              push-notification token, orders, and associated personal data. Information that must
              be retained for legal, accounting, fraud-prevention, or dispute-resolution purposes
              will be retained only for the required period and then deleted or anonymized.
            </p>
          </section>
          <section>
            <h2>In-app deletion</h2>
            <p>
              Signed-in customers can also open Profile and choose Delete account. This immediately
              submits an authenticated deletion request and signs the customer out after success.
            </p>
          </section>
          <section>
            <h2>Privacy policy</h2>
            <p>
              Read the full <Link href="/privacy-policy">BG Laundry Privacy Policy</Link> for
              details about data use, retention, and contact options.
            </p>
          </section>
        </article>

        <footer className="policy-footer">
          <Link href="/">Back to BG Laundry</Link>
        </footer>
      </div>
    </main>
  );
}