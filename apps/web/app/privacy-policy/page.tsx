import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | BG Laundry',
  description: 'Privacy Policy for the BG Laundry website and customer application.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="policy-page">
      <div className="policy-shell">
        <header className="policy-header">
          <Link className="policy-brand" href="/" aria-label="BG Laundry home">
            <span className="policy-brand-mark">BG</span>
            <span>BG Laundry</span>
          </Link>
          <p className="policy-updated">Last updated: September 17, 2026</p>
        </header>

        <article className="policy-content">
          <p className="policy-eyebrow">Privacy</p>
          <h1>Privacy Policy</h1>
          <p className="policy-lead">
            BG Laundry respects your privacy. This policy explains what information we collect,
            why we use it, and the choices available to you when you use our website or customer
            application.
          </p>

          <section>
            <h2>1. Information we collect</h2>
            <p>Depending on how you use BG Laundry, we may collect:</p>
            <ul>
              <li>Account details such as your name, phone number, email address, and password credentials.</li>
              <li>Pickup and delivery details, including saved home, office, and other addresses.</li>
              <li>Order information, including selected services, garment details, schedules, status, and order history.</li>
              <li>Payment and transaction information needed to initiate and confirm checkout. Payment details are processed by the payment provider shown at checkout.</li>
              <li>Messages or support information that you send to us.</li>
              <li>Technical information such as device type, app version, IP address, and notification/device identifiers used to keep the service secure and deliver order updates.</li>
            </ul>
          </section>

          <section>
            <h2>2. How we use information</h2>
            <p>We use information to:</p>
            <ul>
              <li>Create and secure your account and verify your phone number.</li>
              <li>Schedule pickups, process laundry orders, deliver items, and provide customer support.</li>
              <li>Process payments, prevent fraud, and maintain transaction records.</li>
              <li>Send service messages such as verification codes, order status updates, and delivery notifications.</li>
              <li>Improve, troubleshoot, and protect our website, application, and services.</li>
              <li>Meet legal, accounting, and regulatory obligations.</li>
            </ul>
          </section>

          <section>
            <h2>3. How we share information</h2>
            <p>
              We share information only as needed to operate BG Laundry. This may include sharing
              relevant details with our laundry and delivery staff, payment providers, cloud and
              authentication providers such as Firebase, messaging providers, and technical
              service providers who process information on our behalf. We do not sell your personal
              information. We may also disclose information where required by law or necessary to
              protect our users, business, or services.
            </p>
          </section>

          <section>
            <h2>4. Security and retention</h2>
            <p>
              We use reasonable technical and organizational safeguards, including encrypted
              connections where supported, to protect your information. We retain information for
              as long as needed to provide the service, maintain business and transaction records,
              resolve disputes, prevent abuse, and comply with legal obligations. Retention periods
              vary by the type of information and its purpose.
            </p>
          </section>

          <section>
            <h2>5. Your choices</h2>
            <p>
              You may ask us to access, correct, or delete personal information associated with
              your account, subject to applicable law and records we must retain. You can manage
              notification permissions in your device settings. To make a privacy request, contact
              us using the details below. We may need to verify your identity before completing a
              request.
            </p>
          </section>

          <section>
            <h2>6. Children&apos;s privacy</h2>
            <p>
              BG Laundry is not directed to children under 13, and we do not knowingly collect
              personal information from children under 13. If you believe a child has provided us
              with personal information, please contact us so we can take appropriate action.
            </p>
          </section>

          <section>
            <h2>7. Changes to this policy</h2>
            <p>
              We may update this policy when our services or legal requirements change. The updated
              version will be posted on this page with a new revision date.
            </p>
          </section>

          <section>
            <h2>8. Contact us</h2>
            <p>
              For privacy questions or requests, email{' '}
              <a href="mailto:support@bglaundry.com">support@bglaundry.com</a>.
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