# FairForm AI Features - Compliance & Responsible AI Policy

**Document Version:** 1.0  
**Last Updated:** October 11, 2025  
**Effective Date:** October 11, 2025  
**Owner:** FairForm Product Team  
**Review Schedule:** Quarterly

---

## 🎯 Purpose

This document outlines FairForm's commitment to responsible, ethical, and compliant use of artificial intelligence (AI) features. It defines the limitations, safeguards, and user controls implemented to ensure AI assists—but never replaces—proper legal counsel.

---

## ⚖️ Core Principle: Educational Assistance, Not Legal Advice

### What FairForm AI Does

FairForm's AI features are **educational tools** designed to help self-represented litigants:

✅ **Understand** their legal situation in plain language  
✅ **Classify** their issue into common legal categories  
✅ **Navigate** court processes with guided information  
✅ **Organize** their case information and documents

### What FairForm AI Does NOT Do

❌ **Provide legal advice** or recommendations about specific legal actions  
❌ **Predict legal outcomes** or guarantee results  
❌ **Replace qualified legal counsel** or attorney representation  
❌ **Create binding legal documents** (we provide templates and guidance only)  
❌ **Make decisions** on behalf of users  
❌ **Guarantee accuracy** of all classifications or information

---

## 🔒 User Control & Transparency

### Explicit Opt-In Required

**Default:** AI features are **OFF** for all users  
**Access:** Users must explicitly enable AI features in Settings  
**Control:** Users can opt-out at any time without losing access to other FairForm features

### Opt-In Process

1. User navigates to **Settings** page
2. User reviews AI Participation section with disclaimer
3. User clicks "Learn More" to read this compliance document (optional)
4. User toggles "Enable AI-Assisted Intake" switch to ON
5. User clicks "Save Changes" to confirm
6. User can now access AI Intake feature at `/intake`

### Opt-Out Process

1. User navigates to **Settings** page
2. User toggles "Enable AI-Assisted Intake" switch to OFF
3. User clicks "Save Changes"
4. Access to `/intake` is immediately revoked
5. No AI features will be used for this user
6. Previously created cases remain accessible (AI metadata preserved)

---

## 🛡️ Content Safety & Moderation

### OpenAI Moderation Layer

All user input to AI features passes through **OpenAI's Moderation API** before processing:

**Categories Monitored:**
- Self-harm or suicide-related content
- Hate speech or harassment
- Violence or threats
- Sexual content
- Illegal activities

**Actions Taken:**
- **Block:** Content flagged as high-risk is rejected with user-friendly message
- **Review:** Borderline content is flagged for potential manual review
- **Pass:** Safe content proceeds to AI classification

**User Impact:**
- Blocked content receives message: "We're unable to process this request. Please review your description."
- No specific moderation reasons disclosed to user (privacy protection)
- All moderation events logged anonymously for system monitoring

---

## 🔐 Privacy & Data Protection

### Data Collection

**What We Collect When You Use AI Features:**
- Your problem description (text input)
- Classification results (case type, jurisdiction, summary)
- Confidence scores and risk levels
- Timestamp of classification
- Your timezone (for accurate deadline calculations)

**What We DO NOT Collect:**
- Raw text after initial classification (not stored in cases)
- Personal identifying details beyond user ID
- Conversation history or chat logs
- Screenshots or voice recordings

### Data Storage

| Data Type | Storage Location | Retention | Access |
|-----------|-----------------|-----------|--------|
| Case Summary | Firestore `cases` collection | Until user deletes case | User only |
| AI Metadata | Firestore `cases` (aiGenerated, confidence, etc.) | Until user deletes case | User only |
| Anonymized Logs | Firestore `aiIntakeLogs` collection | 90 days | Admins only |
| User Opt-In Status | Firestore `users` collection | Until account deletion | User only |

### Anonymization

**Intake Logs (`aiIntakeLogs` collection):**
- User ID is **hashed** (SHA-256) - not reversible
- Original text is **not stored** in logs
- Only classification outputs logged (case type, confidence, risk)
- Moderation verdicts logged for safety monitoring
- No PII (personally identifiable information) in logs

### Data Deletion

**User Account Deletion:**
- All cases deleted (including AI metadata)
- User settings deleted
- Anonymized logs remain (cannot be linked to user)

**Individual Case Deletion:**
- Case and all AI metadata deleted
- Associated anonymized log entry remains

---

## 🧠 AI System Details

### Technology Stack

**AI Provider:** OpenAI  
**Model:** GPT-4o-mini  
**Purpose:** Classification and summarization only  
**Temperature:** 0.2 (deterministic, consistent outputs)  
**Response Format:** Structured JSON (validated against schema)

### AI Capabilities & Limitations

**What the AI Can Do Well:**
- Classify common civil legal issues (eviction, small claims, family law)
- Identify relevant jurisdiction (state, county, court level)
- Summarize user's situation in plain language
- Suggest general procedural next steps
- Assess complexity/risk level

**Current Limitations:**
- May misclassify complex or unusual cases
- Limited to U.S. civil law categories
- Cannot handle multi-jurisdiction cases
- No access to case law or statutes
- Cannot predict case outcomes
- No support for criminal matters (outside scope)

### Accuracy & Confidence

**Target Accuracy:** ≥80% classification accuracy (validated through manual QA)  
**Confidence Threshold:** Results below 60% confidence trigger warnings  
**User Confirmation:** All classifications require user review and approval before saving

**Quality Assurance:**
- Admin analytics dashboard monitors classification accuracy
- Low-confidence results flagged for review
- User feedback mechanism (future enhancement)
- Regular prompt refinement based on performance

---

## 📋 Disclaimers & User Notifications

### Required Disclaimers

All AI feature pages display prominent disclaimers:

**Primary Disclaimer (always visible):**
> ⚠️ AI features provide educational guidance only, not legal advice.

**Extended Disclaimer (AI Intake):**
> This AI-generated summary is for educational purposes only and does not constitute legal advice. Review carefully and consult with an attorney for legal guidance.

**Page-Level Notices:**
- AI Intake page: "AI-Assisted Intake (Experimental Beta)" badge
- Results page: Warning alert with disclaimer
- Settings page: AI participation section includes disclaimer

### User Acknowledgment

**Implicit Acknowledgment:**
- User opts in to AI features in Settings
- User reviews disclaimers on each AI feature page
- User confirms AI-generated summaries before saving

**No Separate Agreement:**
- No additional terms of service for AI features
- Covered under general FairForm Terms of Service
- Clear disclaimers at point of use sufficient

---

## 🔧 Feature Flags & Staged Rollout

### Two-Tier Access Control

**Level 1: Global Feature Flag** (`flags.aiIntake`)
- Controlled by FairForm team
- Can disable AI features system-wide instantly
- Used for staged rollout and emergency shutdown

**Level 2: User Opt-In** (`userSettings.aiParticipation`)
- Controlled by individual users
- Default: OFF (must explicitly enable)
- Can toggle on/off at any time

**Access Granted Only When:**
- Global flag is ON **AND**
- User opt-in is ON

### Rollout Strategy

**Phase 1: Internal Testing** (Current)
- Feature flag: OFF in production
- Available in staging only
- Team testing and QA validation

**Phase 2: Limited Beta** (Future)
- Feature flag: ON for beta users only
- Invite-only access
- Enhanced monitoring and feedback collection

**Phase 3: Public Release** (Future)
- Feature flag: ON for all users
- Opt-in required
- Full monitoring and analytics

### Emergency Shutdown

If critical issues arise:
1. Set `flags.aiIntake = false` in codebase
2. Deploy immediately
3. All users lose access to AI features
4. No data loss (cases preserved)
5. Users see "Service Unavailable" message

---

## 📊 Monitoring & Accountability

### System Monitoring

**Real-Time Metrics:**
- Classification accuracy rate
- Average confidence scores
- Moderation block rate
- API response times
- Error rates

**Admin Dashboard** (Story 12.5):
- View anonymized classification logs
- Filter by date, case type, confidence
- Export data for analysis
- Monitor moderation flags

### Audit Trail

**Logged for Each AI Interaction:**
- Timestamp of classification
- Case type determined
- Confidence and risk levels
- Moderation verdict
- Processing time
- User ID (hashed)

**NOT Logged:**
- User's actual problem description text
- Personal identifying information
- Email addresses or contact details

### Manual Review Process

**Triggers for Manual Review:**
- Moderation verdict = "review"
- Confidence < 60%
- Risk level = "high"
- User reports inaccurate classification (future)

**Review Actions:**
- Admin views anonymized log entry
- Assesses classification quality
- Documents findings for system improvement
- No changes to user's case (user controls their data)

---

## ⚖️ Legal & Regulatory Compliance

### Unauthorized Practice of Law (UPL) Prevention

**FairForm's Safeguards:**
1. **Clear Disclaimers:** Every AI feature prominently states "not legal advice"
2. **No Advocacy:** AI does not recommend specific legal strategies or actions
3. **Educational Only:** Information is general guidance, not case-specific advice
4. **User Decision:** All actions require explicit user confirmation
5. **Attorney Referral:** High-risk cases suggest seeking professional help

### Data Protection Compliance

**Privacy Principles:**
- **Transparency:** Users know when AI is used and what data is collected
- **User Control:** Explicit opt-in, can opt-out anytime
- **Data Minimization:** Only collect what's necessary for classification
- **Anonymization:** Logs are anonymized and cannot identify users
- **Security:** Data encrypted in transit and at rest (Firestore)

**GDPR/CCPA Alignment:**
- Right to access: Users can view their data
- Right to deletion: Users can delete cases and accounts
- Right to opt-out: AI features opt-in by default
- Data portability: Export functionality (future)

### Third-Party Service Disclosure

**OpenAI Integration:**
- FairForm uses OpenAI's GPT-4o-mini model for classification
- User input is sent to OpenAI's API for processing
- OpenAI processes data according to their [Data Usage Policy](https://openai.com/policies/usage-policies)
- OpenAI does not use FairForm user data for model training (per API terms)
- Data transmission encrypted (HTTPS)

### Accessibility Compliance

**WCAG 2.1 AA Standards:**
- All AI features meet Level AA accessibility requirements
- Screen readers announce AI processing states
- Keyboard navigation fully supported
- Color not sole indicator of meaning (text labels included)
- Zero violations required per jest-axe testing

---

## 🚨 Known Risks & Mitigations

### Risk 1: AI Misclassification

**Risk:** AI incorrectly identifies case type or jurisdiction  
**Likelihood:** Medium (target 80% accuracy = 20% error rate)  
**Impact:** Medium (user may prepare incorrect documents)

**Mitigations:**
- Display confidence level to user
- Require user review and confirmation
- Allow editing of all AI-generated content
- Warn on low-confidence results (<60%)
- Provide "Start Over" option

### Risk 2: User Reliance on AI as Legal Advice

**Risk:** Users treat AI guidance as legal counsel  
**Likelihood:** Medium (users may not understand limitations)  
**Impact:** High (inappropriate legal decisions)

**Mitigations:**
- Prominent disclaimers on every AI feature page
- "Experimental Beta" badges on all AI features
- Link to attorney referral resources
- High-risk cases trigger professional help suggestions
- Clear "educational only" messaging throughout

### Risk 3: Harmful Content Input

**Risk:** Users input threatening, harmful, or illegal content  
**Likelihood:** Low (most users seeking legitimate help)  
**Impact:** Medium (platform reputation, legal liability)

**Mitigations:**
- OpenAI Moderation API on all inputs
- Content blocked before AI processing
- All moderation events logged for review
- Clear community guidelines (future)

### Risk 4: Data Privacy Breach

**Risk:** User data exposed or misused  
**Likelihood:** Low (Firestore security, encryption)  
**Impact:** High (user trust, legal liability)

**Mitigations:**
- Firestore security rules enforce user-only access
- Logs anonymized (hashed user IDs)
- No raw text stored in logs
- Regular security audits
- Encryption in transit and at rest

### Risk 5: AI Service Availability

**Risk:** OpenAI API unavailable or slow  
**Likelihood:** Low (OpenAI SLA: 99.9% uptime)  
**Impact:** Medium (feature unavailable, user frustration)

**Mitigations:**
- Feature flag allows instant shutdown
- Clear error messages on API failures
- Graceful degradation (users can create cases manually)
- Response time monitoring (≤3s target)
- Timeout handling with retry option

---

## 📖 User-Facing Documentation

### AI Feature FAQ

**Q: Is FairForm's AI a lawyer or legal advisor?**  
A: No. FairForm's AI is an educational tool that helps you understand and organize your legal situation. It does not provide legal advice and cannot replace a qualified attorney.

**Q: How accurate is the AI classification?**  
A: Our AI correctly classifies common legal issues about 80% of the time. We show you the confidence level for each classification, and you can always edit the results. When confidence is low (<60%), we recommend reviewing carefully or starting over.

**Q: What happens to my information?**  
A: Your case information is stored securely in your private FairForm account. We create anonymized logs (without your personal details) to monitor system performance and improve accuracy. Your text description is not stored after classification.

**Q: Can I opt out of AI features?**  
A: Yes, absolutely. AI features are optional and OFF by default. You can enable or disable them anytime in Settings. Opting out does not affect your access to other FairForm features.

**Q: Who sees my AI-generated case summary?**  
A: Only you. Your case information is private and visible only to your account. Administrators can view anonymized system logs (without your personal information) for quality monitoring.

**Q: What if the AI gets my case type wrong?**  
A: You review and approve all AI results before they're saved. You can edit the case type, jurisdiction, and summary. If the classification doesn't seem right, you can start over or create your case manually.

**Q: Is my data used to train AI models?**  
A: No. We use OpenAI's API service, which does not use customer data for model training. Your information is processed for classification only, then discarded by OpenAI per their API terms.

**Q: How do I know when AI is being used?**  
A: All AI features are clearly labeled with "AI-Assisted" or similar language, plus an "Experimental Beta" badge. You'll always know when you're using an AI feature.

---

## 🧪 Quality Assurance & Testing

### Pre-Release Testing Requirements

**Before AI features go live:**
- [ ] Manual QA testing with 50+ sample cases across all case types
- [ ] Accuracy validation (target: ≥80% correct classifications)
- [ ] Moderation testing with edge cases
- [ ] Accessibility audit (target: zero violations)
- [ ] Performance testing (target: ≤3s API response)
- [ ] Security audit of Firestore rules
- [ ] Legal review of all disclaimers and user-facing copy

### Ongoing Monitoring

**Weekly:**
- Review classification accuracy metrics
- Check moderation block rates
- Monitor API response times
- Review error logs

**Monthly:**
- Analyze case type distribution
- Assess confidence score trends
- Review user feedback (when available)
- Update prompts if accuracy degrades

**Quarterly:**
- Comprehensive accuracy audit
- Legal compliance review
- Update this document
- Security audit

---

## 📝 Compliance Checklist for New AI Features

Before launching any new AI feature in FairForm:

- [ ] **Legal Review:** Confirm feature does not constitute legal advice
- [ ] **Disclaimers:** Add prominent "educational only" disclaimers
- [ ] **Opt-In:** Respect user's AI participation setting
- [ ] **Moderation:** All user input passes through moderation
- [ ] **Privacy:** Anonymize any logs or analytics
- [ ] **Accuracy:** Test with diverse inputs, document limitations
- [ ] **Accessibility:** WCAG 2.1 AA compliance verified
- [ ] **Feature Flag:** Implement killswitch capability
- [ ] **Error Handling:** Graceful failures with user-friendly messages
- [ ] **Documentation:** Update this compliance document

---

## 🔄 Version History & Updates

### Version 1.0 - October 11, 2025
- Initial compliance documentation
- Covers AI Intake feature (Epic 12)
- Establishes opt-in policy and privacy protections
- Defines moderation and quality assurance processes

### Future Updates
- User feedback mechanisms (Q4 2025)
- Multi-language support compliance (2026)
- Enhanced analytics and reporting (2026)
- Integration with legal resource providers (TBD)

---

## 📞 Contact & Reporting

### Report an Issue

If you believe FairForm's AI provided inappropriate content or violated these policies:

**Email:** compliance@fairform.app (future)  
**In-App:** Settings → Help & Support → Report AI Issue (future)

### Legal Disclaimer Review

For questions about FairForm's legal disclaimers or compliance:

**Contact:** legal@fairform.app (future)

---

## ✅ Acknowledgment

By enabling AI features in FairForm Settings, you acknowledge that:

1. ✅ AI features are **educational tools only**, not legal advice
2. ✅ You have read and understand the limitations described in this document
3. ✅ You will **verify all AI-generated information** independently
4. ✅ You understand that **AI classifications may contain errors**
5. ✅ You will **consult a qualified attorney** for legal advice specific to your situation
6. ✅ You can opt-out of AI features at any time

---

## 🔗 Related Documents

- [FairForm Terms of Service](./terms-of-service.md) (future)
- [Privacy Policy](./privacy-policy.md) (future)
- [Accessibility Statement](./accessibility-audit.md)
- [AI Intake Technical Documentation](./prd/epic-12-ai-intake.md)
- [User Settings Documentation](./prd/epic-11-user-settings.md)

---

## 📜 Legal Notice

**Attorney Referral Notice:**

FairForm is not a law firm and does not provide legal advice. If you need legal representation or advice about your specific situation, please consult with a licensed attorney in your jurisdiction.

**California Users:** FairForm complies with California Rules of Professional Conduct regarding the unauthorized practice of law.

**Disclaimer of Warranties:**

FairForm's AI features are provided "as is" without warranties of any kind, either express or implied, including but not limited to accuracy, completeness, or fitness for a particular purpose.

---

**Document End**

*For questions about this compliance policy, contact the FairForm Product Team.*

