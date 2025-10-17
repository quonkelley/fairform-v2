## **Executive Summary**

Marion County uses the **Indiana Odyssey Case Management System** (deployed since 2013), with public access through **MyCase.in.gov**. However, **no public API exists** – data access requires either (1) formal bulk data applications through the Indiana Office of Court Services, or (2) web interface usage only. **Automated scraping is explicitly prohibited** and technically prevented by CAPTCHA.

**Feasibility Assessment:**

* **Short-term:** FairForm can create journey maps from publicly available procedural guides and legal resources (Indiana Legal Help, court manuals)  
* **Medium-term:** Apply for bulk data access ($88/hour one-time or $0.01-0.10/case monthly) to seed journey templates with real case patterns  
* **Long-term:** Explore partnership with Indiana courts or Tyler Technologies for official integration

**Key Finding:** FairForm should focus on **educational journey mapping** (like GPS directions) rather than live case data integration initially, which aligns with your "Legal GPS" positioning and avoids unauthorized practice of law concerns.

---

## **Table of Systems & APIs**

| Platform | URL | Data Type | Access Method | Restrictions | Cost |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **MyCase Indiana** | mycase.in.gov | Case search, dockets, some documents | Web interface only | No API, no scraping, CAPTCHA protected | Free |
| **Odyssey CMS** | N/A (backend system) | Complete case management data | Via bulk data application | Formal approval required, usage restrictions | $88/hr one-time OR $0.01-0.10/case monthly |
| **Indiana Legal Help** | indianalegalhelp.org | Forms, procedural guides, FAQs | Public website | Educational use encouraged | Free |
| **Marion County Clerk** | indy.gov/clerk | Official records, filing info | In-person or online search | Standard public records rules | Varies by request |
| **Indiana Courts Forms** | in.gov/courts/forms | Court forms, procedural rules | Public download | Free for individual use | Free |
| **Tyler Technologies Odyssey** | tylertech.com/odyssey | Case management platform | No public access | Proprietary system | N/A \- Courts only |

---

## **Marion County Court System Structure**

### **Civil Divisions**

**Marion Superior Courts (13 courts with civil jurisdiction)**

* Handle civil cases over $6,000/$10,000  
* Complex litigation, business disputes  
* Appeals from small claims

**Marion County Small Claims Courts (9 township courts)**

* **Jurisdiction:** Claims up to $10,000  
* **Townships:** Center, Decatur, Franklin, Lawrence, Perry, Pike, Warren, Washington, Wayne  
* **Venue Rule:** Must file where transaction occurred or property located (for landlord-tenant)  
* **Unique Feature:** Each township has separate court, judge, procedures

### **Key Marion County Distinctions**

1. **Township System:** Only county in Indiana with 9 separate small claims courts  
2. **$1,500 Rule:** LLCs/corporations must have attorney for claims over $1,500  
3. **Attorney Fees Recoverable:** In addition to $6,000 cap (unique to Marion County)  
4. **Reformed System:** Underwent major reforms 2012-2017 following Wall Street Journal investigation

---

## **Step-by-Step Case Journeys**

### **Journey 1: Small Claims Case (Marion County)**

**Applicable Law:** Indiana Small Claims Rules, Marion County Local Rules

| Step | Title | Description | Timing | Required Actions | Documents |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | **Pre-Filing** | Determine if claim qualifies for small claims | Before filing | Verify amount under $10,000; check statute of limitations (2-6 years) | Gather evidence, contracts, receipts |
| 2 | **File Notice of Claim** | Initiate case at appropriate township court | Day 1 | Complete Notice of Claim form; pay filing fee (\~$86-$100); file in correct township | Notice of Claim, supporting docs |
| 3 | **Service of Process** | Sheriff serves defendant with summons | Days 2-14 | Court arranges service; defendant receives Notice of Claim and Summons | Proof of Service (filed by sheriff) |
| 4 | **Defendant Response Period** | Defendant decides to respond or default | Within 10 days | Defendant may: (1) Answer, (2) Counterclaim, (3) Request jury trial, (4) Do nothing | Answer, Counterclaim (if applicable) |
| 5 | **Pre-Trial Settlement** | Parties attempt to settle | Days 15-30 | Court encourages settlement; mediation available | Settlement agreement (if reached) |
| 6 | **Hearing Scheduled** | Court sets hearing date | 2-3 weeks after filing | Appear on scheduled date; bring evidence and witnesses | Evidence, witness list |
| 7 | **Hearing/Trial** | Informal hearing before judge | Day of hearing | Present case informally; judge may decide immediately or take under advisement | All evidence presented |
| 8 | **Judgment Entered** | Court issues decision | Same day or within 2 weeks | Judgment for plaintiff or defendant; court determines amount | Court judgment |
| 9 | **Post-Judgment** | Collect judgment (if plaintiff wins) | After judgment | May pursue wage garnishment, liens, or other collection; or defendant may appeal | Proceedings Supplemental (if needed) |

**Total Timeline:** 3-8 weeks for possession/judgment; additional time for collection

**Notes for FairForm:**

* Emphasize informal nature: "No lawyer required"  
* Highlight court encourages settlement  
* Explain venue rules clearly (file in correct township)  
* Provide jurisdiction calculator (amount, statute of limitations)

---

### **Journey 2: Eviction (Marion County)**

**Applicable Law:** Indiana Code 32-31 (Landlord-Tenant), Small Claims Rules

| Step | Title | Description | Timing | Required Actions | Documents |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | **Notice to Tenant** | Landlord serves required notice | Before filing | **Nonpayment:** 10-day Notice to Pay or Quit\<br\>**Lease violation:** Notice to Cure or Quit\<br\>**Month-to-month:** 30-day Notice | Written notice, proof of delivery |
| 2 | **Notice Period** | Tenant has time to comply or vacate | 10-30 days | Tenant may: (1) Pay rent, (2) Cure violation, (3) Vacate, (4) Do nothing | N/A |
| 3 | **File Eviction** | Landlord files in township small claims court | After notice expires | File where property is located; pay filing fee ($86 \+ $13/additional defendant) | Notice of Claim, lease, proof of notice service |
| 4 | **Service by Sheriff** | Sheriff serves tenant with summons | Days 2-7 after filing | Court arranges service; tenant receives Summons and Notice of Claim with court date | Proof of Service |
| 5 | **Hearing Scheduled** | **Possession hearing** set | 2-3 weeks after filing | Both parties must appear; this hearing determines possession only | Evidence, lease, payment records |
| 6 | **Possession Hearing** | Court determines who gets possession | Day of hearing | Judge rules on possession; tenant can present defenses (lease disputes, retaliation, habitability) | All evidence presented |
| 7 | **Writ of Possession** | Court issues writ if landlord wins | Same day or next day | Landlord requests writ ($13 fee); gives tenant 48 hours to 5 days to vacate | Writ of Possession |
| 8 | **Sheriff Enforcement** | Sheriff removes tenant if needed | 2-5 days after writ | Tenant must vacate or sheriff enforces removal | Physical eviction |
| 9 | **Damages Hearing** | **Separate hearing** for monetary damages | \~2 months after possession hearing | Court determines unpaid rent and damages owed | Rent records, property damage evidence |
| 10 | **Collections** | Landlord collects judgment | After damages judgment | May pursue wage garnishment, liens | Proceedings Supplemental |

**Total Timeline:**

* **Possession:** 3-6 weeks from filing to tenant removal  
* **Full Process:** 2-4 months including damages

**Tenant Defenses Available:**

* Landlord failed to maintain habitability  
* Retaliation for requesting repairs  
* Discrimination  
* Landlord didn't follow proper notice requirements  
* Security deposit disputes

**Notes for FairForm:**

* Clear timeline visualization critical ("You are here" progress tracker)  
* Distinguish between possession and damages hearings  
* Emphasize two-step process  
* Provide notice requirement calculator  
* Explain tenant rights and defenses  
* Link to eviction sealing information (available 6 months after case closes if dismissed or no balance due)

---

## **Compliance & Legal Considerations**

### **Indiana Public Records Law (IC 5-14-3)**

**Key Provisions:**

* **Public Access Right:** "Any person may inspect and copy public records" during business hours  
* **Liberal Construction:** Burden of proof for nondisclosure is on agency, not requester  
* **No Purpose Required:** Agencies cannot deny requests because person won't state purpose  
* **Commercial Use Restrictions:** Agencies may restrict use for selling, advertising, or soliciting

**Court Records Specificity:**

* Governed by Administrative Rule 9 (Access to Court Records)  
* **Presumption of Access** with privacy protections  
* **Confidential Records:** Juvenile cases, sealed records, protection orders, expunged cases  
* **Public Records:** All other civil, criminal, family, probate cases

### **Bulk Data Access Requirements (Admin Rule 9(F))**

**Application Process:**

1. Submit formal application to Indiana Office of Court Services (IOCS)  
2. Specify data sought, purpose, security measures  
3. IOCS reviews for compliance with criteria  
4. Execute User Agreement if approved

**Approval Criteria:**

* **Bona fide research interest** OR benefit to Indiana judicial system  
* No commercial resale or third-party distribution  
* Adequate data security measures  
* Reasonable fees paid

**Fees:**

* One-time requests: $88/hour (allowed once per year)  
* Monthly subscriptions: $0.01/closed case, $0.10/open or new case  
* File drop or 15-minute messaging delivery

**Prohibited Uses:**

* Selling data to third parties  
* Using for commercial products without approval  
* Violating confidentiality restrictions

### **Unauthorized Practice of Law (UPL) Considerations**

**FairForm's Educational Positioning:**

* ✅ **Permitted:** Educational information about legal process ("how courts work")  
* ✅ **Permitted:** General procedural guidance ("these are the typical steps")  
* ✅ **Permitted:** Forms and document templates with instructions  
* ✅ **Permitted:** Timeline and deadline tracking  
* ⚠️ **Caution:** Personalized legal advice specific to user's situation  
* ⚠️ **Caution:** Interpreting law or predicting case outcomes  
* ❌ **Prohibited:** Acting as legal representative  
* ❌ **Prohibited:** Drafting legal documents for specific cases (as opposed to providing templates)

**Safe Harbor Guidance (from Indiana Legal Info Guide):**

* Provide **information** not **advice**  
* Explain "what" and "how" not "should you"  
* Direct to lawyer for case-specific guidance  
* Clear disclaimers throughout

**Recommended Disclaimers for FairForm:**

"FairForm provides educational information about legal procedures, not legal advice.   
The information here is general guidance and may not apply to your specific situation.   
Consult with a licensed attorney for advice about your case.

FairForm is not affiliated with Indiana courts and does not guarantee case outcomes."

### **Data Privacy & Security**

**Under Indiana Law:**

* **Public Case Data:** Names, case numbers, dockets, judgments are public  
* **Confidential Information:** SSNs (last 4 digits only), financial account numbers, minor children's details  
* **Protected Information:** Victim addresses in protection order cases

**FairForm Best Practices:**

* Never store SSNs or financial data  
* Use minimal personally identifiable information  
* Clear data retention policies  
* Secure user account data (separate from educational content)

---

## **Integration Recommendations**

### **Short-Term Strategy (Immediate \- 6 Months)**

**Focus: Educational Journey Mapping Without Live Data**

**Approach:**

1. **Manual Journey Templates**

   * Create procedural journey templates for each case type (eviction, small claims, family, etc.)  
   * Source from publicly available guides:  
     * Indiana Small Claims Manual  
     * Indiana Legal Help resources  
     * Marion County court websites  
     * Indiana Trial Court Administration Manual  
2. **Static Step-by-Step Guidance**

   * Build FairForm's journey maps as educational flowcharts  
   * No connection to live case data  
   * User manually selects case type and progresses through steps  
   * Provide checklists, deadlines, form links at each step  
3. **Indiana Legal Help Integration**

   * Embed or link to forms from indianalegalhelp.org  
   * Maintain up-to-date links to official court resources  
   * Reference local court rules by county  
4. **Glossary & Plain Language**

   * Build comprehensive legal term glossary  
   * Explain procedures in plain English  
   * Use your AI Copilot for conversational explanations

**No API or Data Access Required**

**Advantages:**

* ✅ No legal barriers or applications needed  
* ✅ Aligns with "educational tool" positioning  
* ✅ Avoids UPL concerns  
* ✅ Fast implementation  
* ✅ Works statewide, not just Marion County

**Example User Flow:**

User: "I received an eviction notice"  
   ↓  
FairForm: Asks context questions (when received, reason, county)  
   ↓  
FairForm: Displays Eviction Journey Map customized to Marion County  
   ↓  
Shows: "You are at Step 1: Notice Period (You have X days left)"  
   ↓  
Provides: Checklist, next actions, forms needed, deadline calculator

---

### **Medium-Term Strategy (6-12 Months)**

**Focus: Bulk Data Access for Journey Enhancement**

**Approach:**

1. **Apply for Bulk Data Access**

   * Submit application to IOCS for non-confidential case data  
   * **Purpose:** Research to improve self-represented litigant outcomes  
   * **Data Requested:**  
     * Case timelines (filing date → hearing → judgment)  
     * Event types (motion filed, hearing held, etc.)  
     * Case outcomes by type  
   * **Monthly subscription** for ongoing updates  
2. **Analyze Patterns to Improve Journeys**

   * Calculate average timelines by case type and county  
   * Identify common bottlenecks or delays  
   * Map typical procedural paths (e.g., % of small claims that settle vs. go to trial)  
   * Update journey templates with data-driven insights  
3. **Predictive Timeline Estimates**

   * "Based on 500 similar cases, typical timeline is 4-6 weeks"  
   * "87% of small claims settle before trial"  
   * Provide more accurate deadline predictions

**Still No Real-Time Case Tracking** – Data used for aggregate analysis only

**Approval Strategy:**

* Emphasize **research benefit to Indiana judicial system**  
* Show how improved SRL guidance reduces court burden  
* Partner with legal aid organizations as co-applicants  
* Demonstrate strong data security practices

**Estimated Cost:**

* Application: Free  
* Monthly data: $0.01-0.10/case × \~51,000 annual Marion County cases \= \~$500-$5,000/month  
* One-time historical data: $88/hour × 10-20 hours \= $880-$1,760

---

### **Long-Term Strategy (12-24 Months)**

**Focus: Official Partnership or API Access**

**Approach:**

1. **Pilot Partnership with Marion County**

   * Propose pilot program with Marion Superior or Small Claims Courts  
   * Offer FairForm as official educational resource  
   * Measure impact: SRL confidence, case completion rates, court efficiency  
   * Indiana courts have history of innovation (Eviction Task Force, Justice OS vision)  
2. **Explore Tyler Technologies Partnership**

   * Tyler has "integrated justice" vision  
   * Odyssey has APIs for approved partners (e.g., prosecutor interfaces, BMV integration)  
   * Propose FairForm as official "Litigant Portal" module  
   * Follow model of E-file Indiana partnership  
3. **Statewide Expansion**

   * If Marion County pilot succeeds, expand to other Odyssey counties  
   * All 92 Indiana counties now on Odyssey  
   * Single integration \= statewide coverage  
4. **Justice OS Alignment**

   * Position FairForm in line with Indiana courts' "Justice OS" vision  
   * Open APIs, partner ecosystem, standardized data schemas  
   * Be early partner in emerging justice tech ecosystem

**Potential API Features (if achieved):**

* Real-time case status updates  
* Automated deadline notifications  
* Electronic filing integration  
* Two-way communication (user → court)

**Approval Strategy:**

* **Demonstrate Impact:** Pilot data showing reduced court burden, improved outcomes  
* **Legal Aid Endorsement:** Partnership with Indiana Legal Services, Pro Bono Indiana  
* **Judicial Champion:** Need judge advocate within Marion County  
* **Technical Compliance:** Meet all court IT security standards

---

### **Alternative: Hybrid Approach**

**If Official Integration Proves Challenging:**

1. **Manual Case Sync**

   * Users manually enter their case number  
   * FairForm scrapes MyCase.in.gov ON BEHALF OF USER (with their explicit consent)  
   * Shows case status, upcoming hearings within FairForm interface  
   * **Legal Rationale:** User accessing their own case data through FairForm as tool  
2. **Email/SMS Deadline Reminders**

   * Based on procedural timeline, not live data  
   * User enters "filing date" → FairForm calculates expected hearing dates  
   * Reminds user to check MyCase for updates  
3. **Clerk Integration for E-Filing**

   * Partner with county clerks for e-filing submissions  
   * FairForm helps users prepare documents  
   * Submit through official E-file Indiana system (Tyler's Odyssey File & Serve)

---

## **Specific Marion County Resources**

### **Court Websites & Contact**

**Marion County Superior Court (Civil Division)**

* Address: 200 E. Washington St., Suite T-1221, Indianapolis, IN 46204  
* Phone: 317-327-4747  
* Website: Check county-specific local rules at in.gov/courts/local/marion-county/

**Marion County Small Claims Courts (9 Townships)**

* **Center:** 300 E. Fall Creek Pkwy N. Dr., Suite 130, Indianapolis, IN 46205 | (317) 920-4530  
* **Decatur:** 5665 Lafayette Rd., Suite B, Indianapolis, IN 46254 | (317) 293-1842  
* **Franklin:** 4531 Independence Square, Indianapolis, IN 46203  
* **Lawrence:** 5302 N. Keystone Ave., Suite E, Indianapolis, IN 46220 | (317) 327-8184  
* **Perry:** 4455 McCoy St., Indianapolis, IN 46226 | (317) 545-2369  
* **Pike:** 5401 W. Washington St., Indianapolis, IN 46241 | (317) 241-9573  
* **Warren:** 501 N. Post Rd., Suite C, Indianapolis, IN 46219 | (317) 327-8919  
* **Washington:** 4925 S. Shelby St., \#100, Indianapolis, IN 46227 | (317) 786-9242  
* **Wayne:** 3730 S. Foltz St., Indianapolis, IN 46241 | (317) 241-2854

**Marion County Clerk's Office**

* Main: 200 E. Washington Street, W122, Indianapolis, IN 46204 | (317) 327-4740  
* Community Justice Campus: 675 Justice Way, Indianapolis, IN 46203 | (317) 327-4740  
* Records Facility: 1330 Madison Avenue, Indianapolis, IN 46225 | (317) 327-4715

### **Legal Aid & Pro Bono Resources**

* **Indiana Legal Services:** (800) 869-0212 | indianalegalservices.org  
* **Pro Bono Indiana (Indianapolis Office):** Heartland Pro Bono Council | heartlandprobono.com  
* **Indiana Legal Help:** indianalegalhelp.org (forms, guides, FAQs)  
* **Neighborhood Christian Legal Clinic:** (317) 777-7100

---

## **Technical Recommendations**

### **Data Collection Methods**

**1\. Public Web Scraping (Short-Term, Limited)**

* **Target:** Indiana Legal Help, court websites for forms/guides  
* **Method:** Scheduled scraping of publicly available procedural information  
* **Compliance:** Respect robots.txt, rate limiting  
* **Purpose:** Keep journey templates updated with latest forms/rules

**2\. Bulk Data Application (Medium-Term)**

* **Target:** Indiana Office of Court Services  
* **Method:** Formal application for monthly case data exports  
* **Format:** CSV or XML file drops  
* **Purpose:** Aggregate analysis to improve journey accuracy

**3\. User-Initiated MyCase Lookup (Alternative)**

* **Target:** MyCase.in.gov on behalf of user  
* **Method:** User provides case number → FairForm fetches their case  
* **Compliance:** User consent required, must comply with Terms of Use  
* **Purpose:** Show user their own case status within FairForm

**4\. Tyler Partnership (Long-Term)**

* **Target:** Official Odyssey API (if made available)  
* **Method:** Authenticated API calls  
* **Purpose:** Real-time case tracking, e-filing integration

### **Technology Stack Recommendations**

**For Educational Journey Mapping (Current):**

* **Frontend:** Your existing Next.js/React (FairForm stack)  
* **Journey Engine:** State machine (XState or similar) for step progression  
* **Content Management:** Markdown files or Sanity CMS for journey templates  
* **AI Integration:** Your Epic 13 AI Copilot for conversational guidance

**For Bulk Data Analysis (Future):**

* **Storage:** PostgreSQL for case data analysis  
* **ETL:** Python scripts to process CSV/XML exports from IOCS  
* **Analytics:** Jupyter notebooks for pattern analysis  
* **Aggregation:** Dashboard showing typical timelines by case type/county

**For API Integration (Long-Term):**

* **Authentication:** OAuth 2.0 or API key (depending on Tyler's requirements)  
* **Rate Limiting:** Respect court system limits  
* **Caching:** Redis for frequently accessed data  
* **Webhooks:** Listen for case status changes (if available)

---

## **Key Success Factors**

1. **Educational Positioning**

   * Always frame as "educational tool" not "case management"  
   * Clear disclaimers: "Not legal advice"  
   * Encourage attorney consultation  
2. **Court Relationship Building**

   * Engage with Marion County judges, clerks early  
   * Present at judicial conferences  
   * Partner with court innovation initiatives  
3. **Legal Aid Partnerships**

   * Co-develop content with Indiana Legal Services  
   * Mutual referrals (FairForm ↔ Legal Aid)  
   * Demonstrate shared mission  
4. **Phased Approach**

   * Start with static educational content (no data access needed)  
   * Prove value before requesting bulk data access  
   * Build trust before proposing official integration  
5. **Compliance First**

   * Legal review of all user-facing content  
   * Regular audits for UPL compliance  
   * Transparent data practices

---

## **Next Immediate Actions**

1. **Review Marion County Content** ✅ (From this research)

   * Small claims procedure flowchart  
   * Eviction procedure flowchart  
   * Township venue calculator  
2. **Build First Journey Template** (Next Sprint)

   * Choose: Marion County Small Claims OR Eviction  
   * Create step-by-step template in FairForm  
   * Integrate with AI Copilot for conversational experience  
3. **Test with Real SRLs**

   * Partner with legal aid clinic for user testing  
   * Get feedback on journey clarity  
   * Iterate based on real user needs  
4. **Document Legal Compliance**

   * Draft Terms of Service  
   * Create disclaimer language  
   * Legal review by Indiana attorney  
5. **Explore Partnership Outreach** (3-6 months)

   * Identify judicial champion in Marion County  
   * Present FairForm to Clerk's office  
   * Discuss potential pilot program

---

## **Final Assessment**

**FairForm's Current Approach is PERFECT for the Legal Landscape:**

Your positioning as "Legal GPS" (guidance, not advice) is exactly right. You can build impressive, helpful journey maps **without needing live court data access** initially. This approach:

✅ Avoids UPL concerns  
 ✅ Requires no API or bulk data approval  
 ✅ Faster to market  
 ✅ Scalable beyond Marion County  
 ✅ Aligns with courts' educational mission

**The path forward is clear:**

1. Build journey templates from publicly available resources (this research)  
2. Use your AI Copilot to make navigation conversational and intuitive  
3. Demonstrate impact with users  
4. Once proven valuable, pursue bulk data access or partnerships

**You're building exactly what self-represented litigants need** – clear guidance through a confusing process. The lack of a public API is actually not a blocker; it's an opportunity to focus on the educational value that truly helps people.

