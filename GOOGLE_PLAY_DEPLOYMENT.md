# Google Play Deployment Runbook

## Goal

Publish the BG Laundry Customer App (`org.bglaundry.customer`) on Google Play.

Account status: new personal Play Console account created and verified on September 17, 2026.

## Current Status

### Completed

- [x] Android package is `org.bglaundry.customer`.
- [x] App version is `1.0.17` with version code `18`.
- [x] Android target SDK is 36.
- [x] Customer API uses HTTPS.
- [x] Release manifest disables cleartext traffic.
- [x] Unnecessary storage and overlay permissions were removed from the main release manifest.
- [x] Android backups are disabled in the release manifest.
- [x] Privacy policy source page exists at `/privacy-policy`.
- [x] Customer Expo config includes `https://www.bglaundry.org/privacy-policy`.
- [x] Web production build passes.
- [x] Android debug build passes.
- [x] Release builds no longer fall back to `debug.keystore`.
- [x] Google Play Billing is not required for laundry pickup, cleaning, delivery, or other physical services. Physical-service payments may use the configured payment gateway.

### Not complete

- [ ] Deploy the web app. The live privacy URL currently returns 404.
- [x] Add customer account deletion in the mobile app and backend.
- [x] Add a public external account-deletion request page and enter its URL in Play Console.
- [ ] Confirm the legal business/developer name and privacy contact email.
- [ ] Confirm the actual payment, SMS, Firebase, storage, and notification providers.
- [ ] Complete and verify the Data Safety form.
- [ ] Configure a production upload keystore or EAS-managed Android credentials.
- [ ] Produce the final signed Android App Bundle (AAB).
- [ ] Create Play Store icon, feature graphic, and phone screenshots.
- [ ] Complete store listing, content rating, target audience, app access, and developer contact sections.
- [ ] Run closed testing with 12 continuously opted-in testers for 14 days.
- [ ] Apply for production access and wait for Google’s decision.
- [ ] Submit and roll out the production release.

## Do This First

### 1. Deploy and verify the website

Deploy the `apps/web` application using the normal production deployment process. Then verify:

- `https://www.bglaundry.org/privacy-policy` loads in an incognito browser.
- The page is HTML, public, non-geofenced, and does not require login.
- The policy names BG Laundry and includes a valid privacy contact.
- The external account deletion page loads publicly.

Google Play does not accept a broken, private, geofenced, or PDF-only privacy policy URL.

### 2. Finish account deletion

Google requires account creation apps to provide account deletion both:

- Inside the app.
- Through an external web resource.

Deletion must remove associated personal data. Any records retained for fraud prevention, accounting, tax, or legal reasons must be clearly explained in the privacy policy and Data Safety declarations.

Implementation checklist:

- [ ] Add authenticated `DELETE /api/v1/users/account`.
- [ ] Delete or anonymize the customer profile, saved addresses, push token, password reset tokens, orders, order items, tracking events, and payment records according to the approved retention policy.
- [ ] Add a discoverable Delete account action in the customer Profile screen.
- [ ] Clear the local session and local saved addresses after successful deletion.
- [x] Add a public `/delete-account` web page with a straightforward request flow.
- [ ] Enter the public deletion URL in Play Console.

### 3. Confirm policy facts

Before final submission, confirm these values with the business owner:

- Legal business/developer name: ____________________
- Privacy/support email: ____________________
- Business address or registered contact, if applicable: ____________________
- Payment provider(s): ____________________
- SMS/OTP provider(s): ____________________
- Firebase services used: ____________________
- Storage, maps, analytics, or crash-reporting providers: ____________________
- Data retention periods: ____________________
- Countries where the service is offered: ____________________

Do not submit the Data Safety form until these answers are known.

## Build and Signing

### Production signing

There is currently no production keystore/upload key. Use EAS credentials or create a key through an approved secure process. Never commit keystores or passwords.

Recommended EAS path:

```bash
cd apps/customer-app
eas credentials
eas build --platform android --profile production
```
- [x] Add a public `/delete-account` web page with a straightforward request flow.

Before building, ensure the EAS project is connected to the correct Expo owner/project and that the Android package remains `org.bglaundry.customer`.

The native Gradle project requires these values if building locally:

- `BGLAUNDRY_RELEASE_STORE_FILE`
- `BGLAUNDRY_RELEASE_STORE_PASSWORD`
- `BGLAUNDRY_RELEASE_KEY_ALIAS`
- `BGLAUNDRY_RELEASE_KEY_PASSWORD`

Local validation commands:

```bash
pnpm --filter web build
cd apps/customer-app/android
./gradlew :app:assembleDebug --no-daemon
./gradlew :app:bundleRelease --no-daemon
```

### Release checks

- [ ] AAB is signed with the production upload key, not the debug key.
- [ ] AAB has package `org.bglaundry.customer`.
- [ ] Version code is higher than any existing Play upload.
- [ ] Release has no cleartext HTTP requirement.
- [ ] Release does not contain unnecessary storage or overlay permissions.
- [ ] AAB installs and starts on supported real Android devices.

## Play Console Setup

Complete the app dashboard before production access:

- [ ] App name: BG Laundry.
- [ ] Short description, maximum 80 characters.
- [ ] Full description, maximum 4,000 characters.
- [ ] Category selected, likely Shopping or Lifestyle.
- [ ] Developer contact email and website.
- [ ] Privacy policy URL: `https://www.bglaundry.org/privacy-policy`.
- [ ] Account deletion URL: `https://www.bglaundry.org/delete-account`.
- [ ] App icon, 512 x 512 PNG with no transparency where required.
- [ ] Feature graphic, 1024 x 500 PNG or JPEG.
- [ ] At least two phone screenshots showing real app functionality.
- [ ] Content rating questionnaire completed.
- [ ] Target audience and child-directed-app declarations completed accurately.
- [ ] App access instructions and reviewer test credentials supplied.
- [ ] Data Safety form completed and matched to the privacy policy.

## Data Safety Review

Confirm every SDK and server integration before declaring data:

- Account identity: name, phone number, email, authentication credentials.
- Location/address data: pickup, delivery, home, office, and saved addresses.
- Order data: selected services, garment details, schedules, order history, status.
- Payment data: transaction and gateway reference data; do not claim to store card details unless the system actually does.
- App/device data: push token, device/app technical information, and any crash or analytics data if present.
- Sharing: BG Laundry API/database, Firebase, SMS provider, payment gateway, delivery staff, and other actual processors.
- Security: HTTPS in transit and appropriate server/database access controls.
- Deletion: in-app and external deletion mechanisms, plus any legally required retention.

The privacy policy, in-app disclosures, and Play Data Safety section must describe the same real behavior.

## Permissions and Policy Checks

- [x] No release `SYSTEM_ALERT_WINDOW` permission is intended.
- [x] No release `READ_EXTERNAL_STORAGE` or `WRITE_EXTERNAL_STORAGE` permission is intended.
- [x] Release cleartext traffic is disabled.
- [ ] Inspect the final merged release manifest after the AAB is built.
- [ ] Confirm no transitive SDK adds a restricted permission that is not needed.
- [ ] Request notification permission only when needed and explain order-update notifications.
- [ ] If location is ever added, use foreground/minimum scope only and disclose its purpose.
- [ ] Do not add SMS, call-log, background-location, all-files, accessibility, or exact-alarm permissions without a genuine core feature and required Play declaration.
- [ ] Confirm all app and SDK data collection is limited to expected laundry functionality.

## Testing Plan

### Internal testing

1. Upload the signed AAB to Internal testing.
2. Install it on several real Android devices.
3. Test signup, OTP, login, password reset, profile, addresses, booking, payment, order tracking, notifications, logout, and deletion.
4. Fix release-only issues before starting the closed-test clock.

### Closed testing

For a new personal developer account created after November 13, 2023, Google requires:

- At least 12 testers opted in.
- All required testers continuously opted in for at least 14 days.
- Meaningful tester engagement and feedback.

Process:

1. Create a Closed testing track.
2. Add at least 12 testers, preferably more than 12 to allow for dropouts.
3. Send the opt-in link and verify each tester has joined.
4. Keep testers opted in continuously for 14 days.
5. Ask testers to use the main features and report feedback.
6. Record tester feedback, issues, fixes, and release versions.
7. Keep the test running if Google reports insufficient tester count or engagement.

### Production access application

After the 14-day requirement:

1. Open the Play Console Dashboard.
2. Select Apply for production access.
3. Explain how testers were recruited.
4. Explain tester engagement and whether usage matched expected users.
5. Summarize feedback and fixes.
6. Explain why the app is production-ready.
7. Submit and monitor the decision. Google says review is usually seven days or less, but it can take longer.

## Final Release

After production access is approved:

1. Complete any remaining Play Console declarations.
2. Upload the signed AAB to Production.
3. Use a staged rollout first if appropriate.
4. Review pre-launch reports and device compatibility.
5. Submit for review.
6. Monitor policy status, crashes, ANRs, payments, OTP, and customer support after launch.

## Advance Notice Link

The Google advance-notice page is not a normal requirement for BG Laundry. It applies to special cases such as documented third-party intellectual-property authorization, government affiliations, healthcare affiliations, accessibility services, gambling ratings, charities, law-enforcement documents, or regulator documents. Use it only if one of those cases applies.

## Official References

- [Google Play Developer Content Policy](https://play.google/developer-content-policy/)
- [User Data Policy](https://support.google.com/googleplay/android-developer/answer/9888076)
- [Permissions and APIs](https://support.google.com/googleplay/android-developer/answer/12579724)
- [Payments Policy](https://support.google.com/googleplay/android-developer/answer/9858738)
- [Target API Policy](https://support.google.com/googleplay/android-developer/answer/11917020)
- [New Personal Account Testing Requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Advance Notice to App Review](https://support.google.com/googleplay/android-developer/answer/6320428)
