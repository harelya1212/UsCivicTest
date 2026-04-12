# Submission Credentials Runbook
## Civic Citizenship

**Purpose:** Operational handoff checklist for the person completing Expo, Apple App Store Connect, and Google Play submission setup  
**Target Use:** Before Apr 1 production build and Apr 2 store submission

---

## Scope

This runbook covers the external accounts and credentials that are not solved by code changes:
- Expo / EAS account access
- Apple Developer / App Store Connect access
- Google Play Console access
- Supporting public URLs and contact points

---

## Owner Checklist

### Required Owner Information
- Submission owner name
- Submission owner email
- Backup owner name/email
- Access to password manager or credential vault

---

## 1. Expo / EAS Access

### Required
- Expo account login
- Access to the correct Expo owner/team
- Project ownership confirmation for `civic-citizenship`

### Commands
```bash
npx eas whoami
npx eas login
npx eas build:configure
```

### Verify
- [ ] `npx eas whoami` returns the correct account
- [ ] Expo owner in `app.json` matches intended team
- [ ] Build configuration completes without ownership confusion

### Record
- Expo account email: __________________
- Expo owner/team: __________________
- Login verified date: __________________

---

## 2. Apple Developer / App Store Connect

### Required Access
- Apple Developer membership active
- App Store Connect role sufficient for app creation/submission
- Access to certificates/provisioning flow via EAS or account owner

### App Identity
- App name: `Civic Citizenship`
- Bundle ID: `com.civiceducation.citizenship`
- Version: `1.0.0`
- Build number: `1`

### Verify
- [ ] Apple Developer membership active
- [ ] App Store Connect access works
- [ ] Bundle ID exists or can be created
- [ ] App record exists or is ready to create
- [ ] Team ID known
- [ ] EAS can manage signing credentials or signer is available

### Record
- Apple account email: __________________
- Team name: __________________
- Team ID: __________________
- App Store Connect access verified: __________________

### Submission-Day Notes
- Confirm privacy URL is live
- Confirm support URL is live
- Confirm screenshots are exported and available locally

---

## 3. Google Play Console

### Required Access
- Google Play Console login
- Permission to create releases and update listing
- Access to app signing / release management path

### App Identity
- App name: `Civic Citizenship`
- Package name: `com.civiceducation.citizenship`
- Version code: `1`

### Verify
- [ ] Google Play Console access works
- [ ] App record exists or can be created
- [ ] Package name matches app.json
- [ ] Release permissions confirmed
- [ ] Content rating workflow owner known
- [ ] If automated submit is used, service account path is ready

### Record
- Google account email: __________________
- Play Console app record status: __________________
- Release permissions verified: __________________
- Service account status: __________________

---

## 4. Public URLs Required For Submission

### Required URLs
- Privacy policy URL
- Terms of service URL
- Support URL
- Marketing/homepage URL if used in store metadata

### Verify
- [ ] All URLs use HTTPS
- [ ] Pages load on desktop and mobile
- [ ] Content matches store listing claims
- [ ] Contact email addresses are valid

### Record
- Privacy URL: __________________
- Terms URL: __________________
- Support URL: __________________
- Marketing URL: __________________

---

## 5. Submission Handoff Package

Before build/submission, the owner should have:
- [ ] `PRODUCTION_BUILD_PREFLIGHT.md`
- [ ] `BUILD_CREDENTIALS_AND_ACCOUNTS_CHECKLIST.md`
- [ ] `STORE_ASSET_PRODUCTION_BRIEF.md`
- [ ] `STORE_ASSET_CAPTURE_CHECKLIST.md`
- [ ] Final exported screenshots and feature graphic
- [ ] Privacy/support URLs ready

---

## 6. Go / No-Go Decision

Proceed to production build only if:
- [ ] Expo access confirmed
- [ ] Apple access confirmed
- [ ] Google Play access confirmed
- [ ] Legal/support URLs confirmed
- [ ] Assets confirmed
- [ ] App metadata confirmed

---

## 7. Escalation Points

If blocked, escalate immediately when:
- Expo owner/account is incorrect
- Apple team access is missing
- Google Play release permissions are missing
- Privacy URL is not live
- Bundle/package IDs do not match store records

---

**Status:** Ready for submission owner handoff  
**Next Step:** Fill in all blanks and verify account access before `npx eas build:configure`
