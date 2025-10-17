# **Marion County Civil Case Data: A Strategic Analysis for FairForm's Litigant Journey Maps**

## **Executive Summary**

This report presents a comprehensive analysis of the Marion County, Indiana, civil court system to determine the feasibility and optimal strategy for FairForm to access, structure, and represent judicial data for the creation of step-by-step "journey maps" for self-represented litigants (SRLs). The investigation concludes that the development of such a tool is highly feasible and addresses a significant access-to-justice need. However, the project's success hinges on a deliberate and compliant data acquisition strategy, as direct, automated public access to court data is intentionally restricted by the Indiana Judicial Branch.

The Marion County civil justice landscape is a dual-track system. The Marion Superior Court handles higher-value civil claims and complex family law matters, while nine distinct Township Small Claims Courts manage the bulk of cases relevant to SRLs, including debt collections and evictions with claims under $8,000.1 While case data from all these courts is centralized in the statewide Odyssey Case Management System and accessible via the public MyCase portal, the administration of justice is decentralized, creating a critical need for journey maps that combine unified data with location-specific procedural guidance.

Direct, real-time API access to the state's judicial database is not publicly available. Furthermore, automated web scraping of the MyCase portal is both technically challenging, due to anti-bot measures like CAPTCHA, and legally prohibited by the site's explicit Terms of Use.3 This makes scraping a high-risk and unsustainable strategy. The most viable immediate path for data acquisition is through a licensed commercial API from an established third-party provider, Doxpop, which offers programmatic access to Indiana court records.5

Based on these findings, this report recommends a two-phase strategic approach. **Phase 1 (Short-Term)** involves prototyping the FairForm application by licensing data from the Doxpop API while simultaneously initiating a formal bulk data request with the Indiana Office of Judicial Administration (OJA) to establish an official channel of communication. **Phase 2 (Long-Term)** focuses on building a strategic partnership with the OJA, leveraging FairForm's functional prototype to demonstrate its value as an access-to-justice tool. Aligning with the OJA's own data modernization and analytics initiatives presents a clear path toward a potential future data-sharing agreement, ensuring the long-term sustainability, accuracy, and impact of the FairForm platform.

---

## **Part I: The Marion County Judicial Landscape for Self-Represented Litigants**

To construct accurate and useful journey maps for SRLs, it is essential to first understand the structure of the court system they must navigate. Marion County employs a two-tiered system for civil cases, with distinct jurisdictional boundaries and procedural rules that dictate where a case must be filed and how it will proceed. This foundational legal and procedural framework governs every step of a litigant's journey.

### **1.1 Court Structure and Jurisdictional Divide: A Two-Tiered System**

The administration of civil justice in Marion County is divided between the county-level Superior Court and the township-level Small Claims Courts. This division is primarily based on the monetary value of the dispute and the subject matter of the case.

#### **Marion Superior Court**

The Marion Superior Court is a court of general jurisdiction, meaning it has the authority to hear all criminal, civil, and family case types filed within the county.6 For SRLs, its most relevant components are the Civil and Family divisions, which are located at the Community Justice Campus in Indianapolis.8

* **Civil Division:** This division handles a wide array of general civil matters, including civil torts (personal injury claims), civil plenary cases (such as contract disputes exceeding the small claims limit), probate and estate administration, and environmental cases.6 Filing fees in this division are significant, with costs of $157 for civil collections and $232 for civil torts, a crucial financial consideration for any litigant.10 All cases filed in the Superior Court's Civil Division are assigned to a courtroom on a random basis to ensure equal distribution.10  
* **Family Division:** This division has jurisdiction over domestic relations matters, including divorce (dissolution of marriage), child custody and support, and paternity establishment.7 It also handles juvenile cases. Given the high volume of individuals representing themselves in family law matters, this division is a key area of focus. The filing fee for a domestic relations case is $177.10

#### **Marion County Township Small Claims Courts**

The nine Township Small Claims Courts are the primary forum for most civil disputes involving SRLs in Marion County. Each of the nine townships (Center, Decatur, Franklin, Lawrence, Perry, Pike, Warren, Washington, and Wayne) operates its own court with its own judge and physical location.1 This decentralized structure is a defining feature of the SRL experience.

* **Jurisdictional Limit:** The crucial defining characteristic of these courts is their monetary limit. They are authorized to hear civil cases where the amount in controversy is less than $8,000.1 Any claim exceeding this amount must be filed in the Marion Superior Court.  
* **Common Case Types:** The vast majority of cases heard in the township courts involve either debt collection (e.g., credit card or medical debt) or landlord-tenant disputes, primarily evictions and claims for damages.2 The proceedings are designed to be more informal than those in Superior Court to facilitate resolution for parties who are often not represented by attorneys.2  
* **Venue Rules:** A critical first step for any SRL is determining the correct township in which to file their case. The rules are specific: a lawsuit must be filed in the township where the defendant lives or works, where the transaction or incident occurred, or, in landlord-tenant cases, where the property is located.1 This geographic requirement means an SRL cannot simply file in the most convenient location; they must identify the legally correct venue among the nine options.

The separation of the court system presents a significant challenge and opportunity. While the state's Odyssey system provides a unified digital backbone for case data across all courts, the actual experience of an SRL is highly localized.13 A litigant in a debt collection case does not interact with the abstract "Marion County court system"; they interact with the specific judge, clerk, and procedures of the Warren Township Small Claims Court.2 This means that a truly effective journey map cannot rely solely on the centralized data stream. It must enrich this data with location-specific details for each of the nine township courts, including addresses, contact information, hours of operation, and links to local resources, such as the on-site eviction help clinics available in several townships.2 FairForm's data architecture must be designed to manage this one-to-many relationship between the single data source (Odyssey) and the nine distinct points of service delivery.

### **1.2 The Procedural Gauntlet: Governing Rules and Filing Processes**

The progression of a civil case is dictated by a hierarchy of rules. The Indiana Rules of Trial Procedure provide the comprehensive framework for cases in Superior Court, covering everything from the commencement of an action and service of process to pleadings, motions, discovery, and judgment.16 For the township courts, the Indiana Small Claims Rules offer a more streamlined and less formal set of procedures designed for speedy justice.2

Supplementing these statewide rules are the Marion County Local Rules (LR49 series), which provide specific operational procedures for the courts within the county.18 While the available documentation details the local criminal rules extensively, it confirms the existence of corresponding local rules for the Civil, Family, and Small Claims divisions, which would govern matters like case assignment and scheduling.18

For an SRL (referred to as a "pro se" litigant), initiating a case involves filing the necessary documents either in person at the Marion County Clerk's Office or electronically through the state's official e-filing portal, which is managed by Tyler Technologies.10 While attorneys are mandated to e-file, SRLs have the option of paper filing.10 A critical procedural point for SRLs is the handling of "service of process." The Clerk's Office includes the cost of initial service in the filing fee and will handle sending the summons to the defendant. However, for all subsequent filings in the case, the responsibility to serve the other parties and provide proof of service to the court falls entirely on the pro se filer.10 This shift in responsibility is a common point of failure for inexperienced litigants and a key milestone to highlight in a journey map.

### **Table 1: Marion County Civil Court Jurisdictional Overview**

| Case Type | Monetary Amount | Correct Court/Division | Governing Rules (Primary) |
| :---- | :---- | :---- | :---- |
| Debt Collection | Up to $8,000 | Township Small Claims Court | Indiana Small Claims Rules |
| Eviction (Possession & Damages) | Damages up to $8,000 | Township Small Claims Court | Indiana Small Claims Rules |
| Personal Injury (Tort) | Up to $8,000 | Township Small Claims Court | Indiana Small Claims Rules |
| Contract Dispute | Over $8,000 | Marion Superior Court, Civil Division | Indiana Rules of Trial Procedure |
| Personal Injury (Tort) | Over $8,000 | Marion Superior Court, Civil Division | Indiana Rules of Trial Procedure |
| Mortgage Foreclosure | Any Amount | Marion Superior Court, Civil Division | Indiana Rules of Trial Procedure |
| Divorce / Child Custody | N/A | Marion Superior Court, Family Division | Indiana Rules of Trial Procedure |
| Name Change | N/A | Marion Superior Court, Civil Division | Indiana Rules of Trial Procedure |

---

## **Part II: Digital Gateways to Marion County Court Data**

Understanding the legal landscape is the first step; understanding the digital infrastructure is the second. FairForm's ability to create dynamic, data-driven journey maps depends entirely on its ability to access case information programmatically. This section analyzes the state's centralized case management system and evaluates all potential channels for data acquisition, from official portals to commercial alternatives.

### **2.1 The Odyssey Ecosystem: Indiana's Centralized Case Management System**

The Indiana Judicial Branch has invested heavily in creating a unified, statewide technology platform. This effort, completed in late 2021, resulted in the implementation of the Odyssey Case Management System (CMS) from Tyler Technologies in all 92 counties.13

* **Core System:** Odyssey serves as the central nervous system for Indiana's courts. It is a web-based, fully integrated system for managing both the procedural and financial aspects of the more than 2 million cases filed annually in the state.14 Its statewide deployment was designed to overcome the inconsistencies and outdated technology of previous county-level systems, enabling better data sharing between courts, clerks, and state agencies.14  
* **Public Portal (MyCase):** The primary public window into the Odyssey system is the website mycase.in.gov (which also resolves from public.courts.in.gov/mycase).19 This portal allows any member of the public to search for non-confidential case information by case number, party name, or attorney.4 Many court documents are available for viewing and download free of charge through this portal.4 MyCase is the definitive, though not necessarily the only, source for public court data in Marion County.  
* **E-Filing Portal:** Integrated with Odyssey is the state's mandatory e-filing platform, also provided by Tyler Technologies.19 Filings submitted through this portal are fed directly into the Odyssey CMS, ensuring that the data available on MyCase is updated as cases progress.

### **2.2 Data Access Channels: A Technical and Legal Assessment**

While the MyCase portal provides public access, the method of that access is carefully controlled. An evaluation of potential automated data acquisition channels reveals a clear policy preference by the state to direct high-volume access toward controlled, and often fee-based, avenues.

* **Public APIs:** A thorough review of the Indiana Judicial Branch's public-facing technical resources reveals **no publicly documented, real-time API for case data lookup or bulk data retrieval**. The only APIs referenced in the state's court technology ecosystem are related to the e-filing system, which is designed for submitting documents, not extracting case data.22 This absence is the single most significant technical constraint for FairForm.  
* **Web Scraping mycase.in.gov:** Given the lack of an API, web scraping the MyCase portal is a theoretical alternative, but it faces prohibitive barriers.  
  * **Technical Barriers:** The MyCase website explicitly employs a CAPTCHA verification step ("I am not a robot") to thwart automated data mining.4 This mechanism is designed to trigger more frequently with higher search volumes, presenting a persistent and evolving technical obstacle that would require significant resources to circumvent, with no guarantee of success.  
  * **Legal and Ethical Barriers:** The MyCase Terms of Use constitute a direct legal prohibition against this activity. The terms explicitly forbid users from deploying "spiders, robots, avatars, intelligent agents, or any other extraction or navigation search except for a normal browser" and from "aggregating, copying or duplicating any of the materials or information available from the site".3 Attempting to scrape the site would be a direct violation of these terms, exposing FairForm to potential legal challenges and reputational damage. It is not a viable or sustainable strategy for a legitimate enterprise.  
* **Commercial APIs (Doxpop):** A viable, low-risk alternative for programmatic data access exists through Doxpop, a commercial third-party data provider.5 Doxpop has an established service providing access to Indiana court records and explicitly offers a Web Services API for high-volume customers who wish to automate their access.5 This indicates that Doxpop has a formal or informal data-sharing agreement with the state, allowing it to legally aggregate and redistribute court data. Engaging Doxpop would involve a licensing fee but would provide a legally compliant and technically stable data stream, allowing FairForm to focus on its core mission of building user-facing tools rather than on circumventing state data access controls.  
* **Official Bulk Data Requests:** The Indiana Supreme Court has established a formal, non-technical process for requesting access to bulk court records, governed by Administrative Rule 9(F).3 This channel involves a formal application to the state and is intended for large-scale data needs. While this is an official and legitimate path, it is likely to be a slower, more bureaucratic process compared to a commercial API. It is better suited for periodic data dumps for research or analysis rather than the near-real-time updates needed for a dynamic journey mapping tool.

The state's approach to data dissemination is not a technical oversight but a deliberate policy choice. By implementing technical and legal barriers on its free public portal while allowing for commercial redistribution and a formal bulk request process, the Indiana Judicial Branch has created a system of controlled choke points for high-volume data access. This structure effectively channels entities with needs beyond casual public searching away from the free portal and toward sanctioned, monitored, and often fee-based alternatives. Any strategy for FairForm must respect this intentional design rather than attempt to subvert it.

### **Table 2: Systems & Data Access Points**

| Platform Name | URL | Data Type | Access Method | Cost | Key Limitations/Risks |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **MyCase (Odyssey Public Access)** | https://public.courts.in.gov/mycase | Public (non-confidential) case dockets, some documents | Manual Web Search | Free | **Scraping Prohibited.** Terms of Use forbid automated access.3 CAPTCHA implementation prevents scraping.4 Not a sustainable source for an application. |
| **Doxpop API** | https://api.doxpop.com/ | Public court records from Indiana counties | Commercial Web Services API | Paid Subscription/Licensing Fee | Financial cost. Dependency on a third-party vendor for data access and accuracy. |
| **Indiana OJA Bulk Data Request** | N/A (Formal Process) | Bulk court records | Formal written request to the Office of Judicial Administration | Administrative fees may apply | Slow, bureaucratic process. Not suitable for real-time data needs. Governed by Administrative Rule 9(F).24 |
| **Odyssey eFile Indiana API** | https://indiana.tylertech.cloud/ | E-filing submission services | E-filing API (for submitting documents) | Transactional fees | **Not for data retrieval.** This API is for filing documents into the court system, not for querying case data.22 |

---

## **Part III: Deconstructing the Litigant's Journey**

The ultimate goal of this project is to transform raw, often impenetrable court data into a clear, actionable guide for an SRL. This requires two distinct but interconnected efforts: first, mapping the universal procedural steps for common case types, and second, developing a system to translate specific, real-time docket entries from a user's case into milestones on that map.

### **3.1 Mapping the Case Lifecycle: From Filing to Enforcement**

By synthesizing procedural rules and information provided by the Marion County Clerk and legal aid organizations, it is possible to construct detailed, step-by-step journey maps for the most common case types affecting SRLs.

#### **Journey Map 1: Small Claims / Debt Collection (Defendant's Perspective)**

This journey outlines the typical experience of an individual being sued for a debt of less than $8,000 in a Marion County Township Small Claims Court.

1. **Initiation: Receiving the Notice of Claim.** The journey begins when the defendant receives a "Notice of Claim".2 This document, which serves as the summons, is delivered by certified mail or in person.26 It specifies who is suing, the amount claimed, and the date, time, and location of the first court hearing.  
2. **Crucial Decision Point: Responding.** The defendant must decide whether to appear at the scheduled hearing. Failure to appear will almost certainly result in a "default judgment" being entered against them for the full amount claimed.2 This is a critical fork in the road that the journey map must emphasize.  
3. **Preparation: Gathering Evidence.** Before the hearing, the defendant should gather and print any relevant evidence, such as payment receipts, contracts, emails, or photographs. Many judges will not review evidence presented on a cell phone, making physical copies essential.2  
4. **Milestone: The First Hearing.** The initial hearing is often not a full trial. Its purpose is for the defendant to appear and formally admit or deny the plaintiff's claim.25 The environment is intended to be informal, but there may be dozens of cases scheduled for the same time, requiring a significant wait.2  
5. **Path Divergence: Setting a Trial.** If the defendant denies the claim, the judge will set a future date for a trial where both parties will present their full case.25 If the defendant admits the claim, the judge will enter a judgment and may discuss a payment plan.  
6. **Milestone: The Trial.** On the trial date, both parties present their evidence and may call witnesses to testify.25 The judge hears both sides and makes a final decision.  
7. **Conclusion: Judgment.** The judge issues a judgment, which is the court's final order in the case.  
8. **Post-Judgment: Enforcement.** If the judgment is against the defendant and they do not pay voluntarily, the plaintiff can initiate collection actions. This can include "proceedings supplemental" to discover the defendant's assets or seeking a court order for wage garnishment.2 Social Security income, however, is exempt from garnishment.2

#### **Journey Map 2: Eviction for Non-Payment of Rent (Landlord's Perspective)**

This journey outlines the legally mandated process a landlord must follow to evict a tenant for failure to pay rent in Marion County.

1. **Prerequisite: Serving Legal Notice.** The process cannot begin without the landlord first providing the tenant with proper written notice. For non-payment of rent, this is typically a "10-Day Notice to Pay or Quit," which gives the tenant ten days to pay the full amount of rent owed or vacate the property.27 This notice must be delivered to the tenant or posted on the property.29  
2. **Initiation: Filing the Complaint.** If the tenant fails to comply with the notice, the landlord can file a "Complaint to Evict" with the Small Claims Court in the township where the property is located. The landlord must provide copies of the notice and the lease agreement and pay the required filing and service fees.29  
3. **Service of Process: Summons Issued.** Upon filing, the court clerk prepares a summons, which is then served on the tenant by the Marion County Sheriff's Office or a private process server.29  
4. **Waiting Period: Tenant's Opportunity to Respond.** The tenant has five business days from the date of service to file a written response ("answer") with the court.29  
5. **Procedural Fork (Based on Tenant's Action):**  
   * **If the Tenant Does NOT Respond:** After the five days expire, the landlord must file a "Motion for Default" and a "Motion for Possession" with the court.29 This asks the judge to rule in the landlord's favor due to the tenant's failure to answer.  
   * **If the Tenant DOES Respond:** The landlord files only the "Motion for Possession".29  
6. **Milestone: Judicial Review and Order.** The judge reviews the landlord's motion. The judge may either grant possession of the property to the landlord immediately or set the case for a court hearing to resolve disputed issues.29  
7. **Enforcement: Writ of Possession.** If the judge rules in the landlord's favor, the court clerk issues a "Writ of Possession." This is the official court order authorizing the eviction.28  
8. **Final Action: Execution of the Writ.** The landlord delivers the Writ to the Sheriff's Office and pays a service fee. A sheriff's deputy will then post the Writ at the property and coordinate with the landlord to physically remove the tenant and return legal possession of the property.28

### **3.2 Structuring the Journey: Translating Docket Data into Milestones**

The raw material for populating these journey maps in real-time is the case data itself. Indiana's highly structured data system provides the necessary hooks to automate this process.

* **The Uniform Case Numbering System (Admin Rule 8):** This system is the cornerstone of the data structure. Every case number is a machine-readable string that encodes vital information: \[County Code\]-\[Court Code\]---.31 For FairForm's purposes, this is a powerful parsing key. A case number like 49K01-2405-SC-00123 immediately tells the system:  
  * 49: The case is in Marion County.  
  * K01: The case is in the Center Township Small Claims Court.2  
  * 2405: The case was filed in May 2024\.  
  * SC: The case is a Small Claim, triggering the Small Claims journey map.33  
  * 00123: It is the 123rd case of its type filed in that court that year.

This single string of data allows the application to automatically select the correct journey map template, populate it with court-specific information (e.g., the address for the Center Township court), and begin monitoring the case docket. The case number is not merely an identifier; it is a set of instructions for the application.

* **Chronological Case Summary (CCS):** The CCS, or docket, is the official, sequential list of all events and filings in a case.14 Each entry includes a date and a description of the event (e.g., "Complaint Filed," "Summons Issued," "Motion for Default Judgment Filed"). This event stream is the raw data that must be translated into user-friendly milestones. FairForm's core logic will be a "translation engine" that maps the standardized but often technical language of the CCS to the plain-language steps of the journey map.

### **Table 3: Docket Event to Journey Map Milestone Translation**

| Raw Docket Entry (CCS Text) | Inferred Procedural Step | Plain Language Milestone for SRL (Defendant) | Next Likely Step(s) |
| :---- | :---- | :---- | :---- |
| Complaint Filed | Lawsuit initiated by Plaintiff. | "A lawsuit has been filed against you." | Summons will be issued and served. |
| Summons Issued | Court officially notifies Defendant. | "The court has issued an official notice for you." | You will receive the notice (Summons) by mail or in person. |
| Appearance Filed | Defendant has formally responded. | "You have officially responded to the lawsuit." | Court will schedule the next event, likely a hearing. |
| Motion for Default Judgment Filed | Plaintiff claims Defendant did not respond. | "The other side has asked the judge to rule against you because you did not respond in time." | Judge will review the motion; a judgment may be entered against you. |
| Judgment Entered | The case has been decided by the judge. | "The judge has made a final decision in your case." | If you lost, collection or enforcement actions may begin. |
| Writ of Possession Issued | (Eviction Case) Court order to vacate. | "The court has issued a final eviction order." | The Sheriff will post the order and schedule a time to remove you. |
| Proceedings Supplemental Filed | Plaintiff is seeking to collect on a judgment. | "The other side is starting the process to collect the money you owe." | You may be ordered to appear in court to answer questions about your finances. |

---

## **Part IV: The Regulatory and Ethical Framework**

Operating a legal technology platform that displays and interprets court data requires strict adherence to a complex framework of laws, court rules, and ethical principles. Compliance is not a feature but a foundational requirement for building a trustworthy and sustainable tool. FairForm must design its systems and content to navigate public access laws, protect confidential information, and avoid the unauthorized practice of law.

### **4.1 Navigating Public Access: APRA and the Rules on Access to Court Records**

The public's right to access government information in Indiana is primarily governed by the Access to Public Records Act (APRA), found in Indiana Code 5-14-3.35 However, for the judiciary, the Indiana Supreme Court has promulgated a more specific and controlling set of rules: the Rules on Access to Court Records (ACR).37 The core principle of both frameworks is the presumption of openness: court records are public unless specifically excluded by law or rule.37

FairForm's data processing pipeline must be engineered to act as a filter, programmatically identifying and redacting or excluding information that is deemed confidential under the ACR.

* **Records and Data Excluded from Public Access:** ACR Rule 5 provides a detailed list of information that must be excluded from public view. FairForm's system must be capable of identifying and removing these data points from any information it displays to users. Key exclusions include:  
  * **Entirely Confidential Cases:** Certain case types, such as adoptions, are confidential in their entirety.40  
  * **Sensitive Personal Information:** Complete Social Security numbers, complete bank account or credit card numbers, and personal identification numbers (PINs) must be excluded.40  
  * **Medical and Mental Health Records:** Records created by medical or mental health service providers for treatment purposes are confidential.40  
  * **Victim and Witness Information:** In specific case types like criminal, juvenile, and civil protection order proceedings, the addresses, phone numbers, and dates of birth of victims and witnesses are excluded from public access.40  
  * **Juvenile Records:** Records related to juvenile delinquency and other juvenile matters are subject to strict confidentiality rules.34  
* **The "Green Paper" System for E-filing:** Indiana's e-filing system has a specific procedure for handling documents that contain confidential information. A party must file two versions of the document: a public, redacted version and a separate, confidential, unredacted version that is marked "Not for Public Access." The filer must also submit a "Notice of Exclusion" that specifies which provision of ACR Rule 5 justifies the confidentiality.41 Understanding this dual-filing system is crucial for correctly interpreting the available documents in a case file.

### **4.2 Compliance Imperatives for Third-Party Applications**

Beyond simply filtering confidential data, FairForm must incorporate several key compliance measures into its platform to manage legal and ethical risks.

* **Required Disclaimers:** The state's own MyCase portal serves as a model for the necessary legal disclaimers. To mitigate liability and manage user expectations, FairForm must display prominent, clear, and unambiguous disclaimers on its platform stating that:  
  1. The information provided is **not the official court record**. Official records can only be obtained directly from the clerk of the court.3  
  2. The accuracy of the information is **not warranted** and may contain errors or omissions.3  
  3. The platform and its content **do not constitute legal advice** and should not be used as a substitute for consulting with a qualified attorney.3  
* **Unauthorized Practice of Law (UPL):** This represents the most significant ongoing ethical risk for any legal technology tool aimed at SRLs. FairForm must be meticulously designed to provide procedural information, not legal advice. The distinction is critical:  
  * **Information (Permissible):** "The court rules state that after a Motion for Default is filed, a judge may enter a judgment." This is a statement of fact about the legal process.  
  * **Advice (Impermissible):** "Your landlord filed a Motion for Default. You should immediately file a motion to set it aside." This is a recommendation for a specific course of action based on the user's individual legal situation.

All content within the journey maps, from milestone descriptions to help text, must be carefully crafted and reviewed to maintain this distinction. The goal is to empower users with a clear understanding of the process, not to guide their legal strategy.

* **Privacy Considerations:** While court records are public, the act of aggregating this data and making it easily searchable through a new interface raises important privacy considerations. FairForm should adopt a "privacy-by-design" approach, implementing policies and features that respect the privacy of individuals whose information is in the system. This could include prohibiting the indexing of its database by public search engines, implementing strong data security measures, and having a clear policy for handling requests to remove or correct information.

---

## **Part V: Strategic Recommendations for FairForm**

The preceding analysis of Marion County's legal, technical, and regulatory environment provides a clear foundation for an actionable strategy. This final section outlines a phased approach for FairForm to enter this market, designed to mitigate risk in the short term while building a sustainable, high-impact platform for the long term.

### **5.1 Phase 1: Low-Risk Data Acquisition and Prototyping (Months 1-6)**

The immediate priority is to acquire a reliable and legally compliant stream of data to begin product development and testing. The strategy should focus on established, sanctioned channels rather than high-risk, unauthorized methods.

* **Primary Recommendation: Avoid Scraping.** The evidence is unequivocal: automated scraping of the mycase.in.gov portal is not a viable strategy. It is explicitly forbidden by the site's Terms of Use and actively hindered by technical countermeasures.3 Pursuing this path would expose FairForm to legal liability, reputational harm, and constant technical battles, diverting resources from the core mission.  
* **Recommended Primary Path: License a Commercial API.** The most efficient and lowest-risk path to obtaining the necessary data is to engage with Doxpop and license their Web Services API.5 This approach offers several distinct advantages:  
  * **Legal Compliance:** It shifts the burden of legal access and compliance to an established vendor.  
  * **Speed to Market:** It provides immediate, programmatic access to structured data, allowing the FairForm development team to focus on building the journey map functionality and user experience.  
  * **Technical Stability:** It avoids the fragility of a web scraper, which can break with any minor change to the target website's layout or security.  
* **Recommended Secondary Path: Initiate an Official Data Request.** In parallel with API licensing, FairForm should begin the formal process of submitting a Bulk Data Request to the Indiana Office of Judicial Administration.24 While this process is likely to be slow, it serves a critical strategic purpose: it introduces FairForm to the state's judicial administrators as a serious, professional organization committed to working within the established system. This initial contact lays the groundwork for the long-term partnership strategy.  
* **Development Focus:** During this phase, the development team should use the licensed data stream to build and validate the journey map prototypes for the two highest-impact SRL case types: Small Claims/Debt Collection and Eviction. The core technical challenges to solve will be the parsing logic for the Uniform Case Numbering System and the translation engine that maps CCS docket entries to the plain-language milestones defined in Table 3\.

### **5.2 Phase 2: The Path to Partnership and Direct Integration (Months 7-18+)**

With a functional prototype and initial user feedback, FairForm should transition its strategy from that of a data consumer to that of a potential state partner. The long-term vision should be to secure a direct, official data feed from the state itself.

* **Strategic Alignment with OJA Initiatives:** The Indiana Office of Judicial Administration is not a static entity; it is actively engaged in modernizing its data infrastructure. The OJA has launched a strategic program to build an enterprise data warehouse, blending data from the Odyssey CMS, e-filing systems, and other sources to perform advanced analysis.43 Their stated goals are to manage caseloads more effectively, identify bottlenecks, and better understand access-to-justice issues like the prevalence of SRLs and the existence of "legal deserts".43

This state-level initiative represents a profound strategic opportunity. The OJA is already working on the same macro-level problems that FairForm aims to solve at the micro-level for individual litigants.

* **The Partnership Pitch:** FairForm should approach the OJA and the Coalition for Court Access with its working prototype. The pitch should be framed not as a request for data, but as a collaborative solution. FairForm can be positioned as a "last-mile" delivery partner for the state's access-to-justice mission. While the OJA is building powerful internal data dashboards for judges and policymakers, FairForm can provide the public-facing application that translates that same data into an empowering tool for the citizens who need it most.  
* **Long-Term Goal: Direct Integration.** The ultimate objective of this partnership strategy is to establish a formal data-sharing agreement or, ideally, a direct API integration with the OJA's data warehouse. This would create a virtuous cycle:  
  * FairForm would gain access to the most accurate, reliable, and cost-effective data source possible.  
  * The State of Indiana would gain a valuable partner in its mission to improve access to justice, at little to no cost to the state.  
  * SRLs in Marion County would benefit from a powerful, free, and state-sanctioned tool to help them navigate the court system.

By pursuing this two-phase strategy, FairForm can mitigate initial risks while building a foundation for a truly integrated and impactful platform. The path begins with a commercial license but should lead toward a public-private partnership that leverages the state's own data modernization efforts to serve the people of Marion County.

#### **Works cited**

1. Information about Marion County Small Claims Courts \- indy.gov, accessed October 14, 2025, [https://www.indy.gov/activity/information-about-marion-county-small-claims-courts](https://www.indy.gov/activity/information-about-marion-county-small-claims-courts)  
2. Marion County Small Claims Courts \- Heartland Pro Bono Council, accessed October 14, 2025, [https://heartlandprobono.com/marion-county-small-claims-courts/](https://heartlandprobono.com/marion-county-small-claims-courts/)  
3. Indiana Judicial Branch: Odyssey Public Access (MyCase) Terms of Use \- IN.gov, accessed October 14, 2025, [https://www.in.gov/courts/policies/tou-mycase/](https://www.in.gov/courts/policies/tou-mycase/)  
4. Indiana Judicial Branch: Searching MyCase \- IN.gov, accessed October 14, 2025, [https://www.in.gov/courts/help/mycase/](https://www.in.gov/courts/help/mycase/)  
5. Doxpop API, accessed October 14, 2025, [https://api.doxpop.com/](https://api.doxpop.com/)  
6. General 3 — Marion Superior Courts, accessed October 14, 2025, [https://www.indycourts.org/about](https://www.indycourts.org/about)  
7. Marion Superior Court \- Indy.gov, accessed October 14, 2025, [https://imp-backend.prod.cityba.se/agency/marion-superior-court](https://imp-backend.prod.cityba.se/agency/marion-superior-court)  
8. Marion County Courts Civil Filing Division \- indy.gov, accessed October 14, 2025, [https://www.indy.gov/activity/marion-county-courts-civil-filing-division](https://www.indy.gov/activity/marion-county-courts-civil-filing-division)  
9. Marion Superior Courts, accessed October 14, 2025, [https://www.indycourts.org/](https://www.indycourts.org/)  
10. Filing a Civil Case \- indy.gov, accessed October 14, 2025, [https://www.indy.gov/activity/filing-a-civil-case](https://www.indy.gov/activity/filing-a-civil-case)  
11. Marion Circuit Court \- indy.gov, accessed October 14, 2025, [https://www.indy.gov/agency/marion-county-circuit-small-claims-court](https://www.indy.gov/agency/marion-county-circuit-small-claims-court)  
12. Marion Small Claims Court Locations \- indy.gov, accessed October 14, 2025, [https://www.indy.gov/activity/marion-small-claims-court-locations](https://www.indy.gov/activity/marion-small-claims-court-locations)  
13. Odyssey \- The Indiana Lawyer, accessed October 14, 2025, [https://www.theindianalawyer.com/topics/odyssey](https://www.theindianalawyer.com/topics/odyssey)  
14. Odyssey Case Management System \- Indiana Judicial Branch \- IN.gov, accessed October 14, 2025, [https://www.in.gov/courts/admin/tech/odyssey/](https://www.in.gov/courts/admin/tech/odyssey/)  
15. Contact Small Claims Court \- Warren Township Trustee of Marion County, accessed October 14, 2025, [https://www.warrentownshiptrustee.org/index.php/contact-small-claims-court/](https://www.warrentownshiptrustee.org/index.php/contact-small-claims-court/)  
16. Indiana Rules of Trial Procedure, accessed October 14, 2025, [https://rules.incourts.gov/Content/trial/default.htm](https://rules.incourts.gov/Content/trial/default.htm)  
17. Indiana Small Claims Rules \- Indiana Court Rules, accessed October 14, 2025, [https://rules.incourts.gov/Content/small-claims/default.htm](https://rules.incourts.gov/Content/small-claims/default.htm)  
18. Marion Superior Court Criminal Rules \- IN.gov, accessed October 14, 2025, [https://www.in.gov/courts/files/marion-local-rules.pdf](https://www.in.gov/courts/files/marion-local-rules.pdf)  
19. Odyssey Case Search Indiana, accessed October 14, 2025, [https://odyssey-case-search-indiana.govbackgroundchecks.com/](https://odyssey-case-search-indiana.govbackgroundchecks.com/)  
20. Access Online Case Information \- indy.gov, accessed October 14, 2025, [https://www.indy.gov/activity/access-online-case-information](https://www.indy.gov/activity/access-online-case-information)  
21. Statewide E-Filing Streamlines Courts \- tylertech, accessed October 14, 2025, [https://www.tylertech.com/resources/case-studies/statewide-e-filing-streamlines-courts](https://www.tylertech.com/resources/case-studies/statewide-e-filing-streamlines-courts)  
22. Indiana Courts APIs \- Postman, accessed October 14, 2025, [https://documenter.getpostman.com/view/5415285/Szf3bVwR](https://documenter.getpostman.com/view/5415285/Szf3bVwR)  
23. Doxpop Court Cases, accessed October 14, 2025, [https://www.doxpop.com/prod/court/](https://www.doxpop.com/prod/court/)  
24. Indiana Judicial Branch: Office of Court Services: Court Management & Statistics \- IN.gov, accessed October 14, 2025, [https://www.in.gov/courts/iocs/statistics/](https://www.in.gov/courts/iocs/statistics/)  
25. Small Claims Court \- City of Evansville, IN and Vanderburgh County, IN, accessed October 14, 2025, [https://www.evansvillegov.org/county/topic/index.php?topicid=153\&structureid=26](https://www.evansvillegov.org/county/topic/index.php?topicid=153&structureid=26)  
26. Indiana Small Claims Rules, accessed October 14, 2025, [https://rules.incourts.gov/pdf/PDF%20-%20Small%20Claims/small-claims.pdf](https://rules.incourts.gov/pdf/PDF%20-%20Small%20Claims/small-claims.pdf)  
27. Eviction Process In Indiana \- 2025 | APM Help Blog, accessed October 14, 2025, [https://www.apmhelp.com/blog/eviction-process-indiana](https://www.apmhelp.com/blog/eviction-process-indiana)  
28. Facing Eviction in Indiana? Here's What You Need to Know \- Fritch Law Office, accessed October 14, 2025, [https://fritchlaw.com/2025/02/26/tenant-rights-indiana-eviction/](https://fritchlaw.com/2025/02/26/tenant-rights-indiana-eviction/)  
29. Evictions | Marion County Clerk of Court and Comptroller, accessed October 14, 2025, [https://www.marioncountyclerk.org/departments/civil-courts/evictions/](https://www.marioncountyclerk.org/departments/civil-courts/evictions/)  
30. What You Will Need to File an Eviction \- Marion County Clerk of Court, accessed October 14, 2025, [https://www.marioncountyclerk.org/uploads/2023/08/CIV\_WhatYouWillNeedtoFileanEviction\_20230628\_WEB.pdf](https://www.marioncountyclerk.org/uploads/2023/08/CIV_WhatYouWillNeedtoFileanEviction_20230628_WEB.pdf)  
31. Case Numbering \- St. Joseph County, IN, accessed October 14, 2025, [https://www.sjcindiana.gov/DocumentCenter/View/194/Case-Numbering-PDF](https://www.sjcindiana.gov/DocumentCenter/View/194/Case-Numbering-PDF)  
32. 8\. Uniform Case Numbering System \- Indiana Court Rules, accessed October 14, 2025, [https://rules.incourts.gov/Content/admin/rule8/current.htm](https://rules.incourts.gov/Content/admin/rule8/current.htm)  
33. Doxpop Glossary, accessed October 14, 2025, [https://www.doxpop.com/prod/help/glossary.jsp](https://www.doxpop.com/prod/help/glossary.jsp)  
34. Types of Court Cases \- Indy.gov, accessed October 14, 2025, [https://www.indy.gov/activity/types-of-court-cases](https://www.indy.gov/activity/types-of-court-cases)  
35. Access to Public Records Act \- Indy.gov, accessed October 14, 2025, [https://www.indy.gov/activity/access-to-public-records-act](https://www.indy.gov/activity/access-to-public-records-act)  
36. Indiana Access to Public Records Act | McNeelyLaw LLP | Family Law Attorney Indianapolis, accessed October 14, 2025, [https://www.mcneelylaw.com/indiana-access-to-public-records-act/](https://www.mcneelylaw.com/indiana-access-to-public-records-act/)  
37. Indiana Judicial Branch: Office of Court Services: Public Access to Court Records Handbook, accessed October 14, 2025, [https://www.in.gov/courts/iocs/publications/public-access/](https://www.in.gov/courts/iocs/publications/public-access/)  
38. Proposed Amendment to Indiana Rules on Access to Court Records \- IN.gov, accessed October 14, 2025, [https://www.in.gov/courts/files/rules-proposed-2023-july-acc-court-rec-4d.pdf](https://www.in.gov/courts/files/rules-proposed-2023-july-acc-court-rec-4d.pdf)  
39. Rule 1.2. Public Access and Confidentiality of Records \- Indiana Court Rules, accessed October 14, 2025, [https://rules.incourts.gov/Content/criminal/rule1-2/current.htm](https://rules.incourts.gov/Content/criminal/rule1-2/current.htm)  
40. Public Access to Court Records Handbook \- Indiana, accessed October 14, 2025, [https://www.in.gov/courts/iocs/files/pubs-accesshandbook.pdf](https://www.in.gov/courts/iocs/files/pubs-accesshandbook.pdf)  
41. Rule 5\. Records Excluded From Public Access | Statutes \- Westlaw, accessed October 14, 2025, [https://content.next.westlaw.com/Document/N59F90331DD7F11ED852BC9A091C0DD8F/View/FullText.html?transitionType=Default\&contextData=(sc.Default)](https://content.next.westlaw.com/Document/N59F90331DD7F11ED852BC9A091C0DD8F/View/FullText.html?transitionType=Default&contextData=\(sc.Default\))  
42. Filing Confidential Information \- Northeast Indiana Paralegal Association, accessed October 14, 2025, [https://nipa.wildapricot.org/Filing-Confidential-Information](https://nipa.wildapricot.org/Filing-Confidential-Information)  
43. Modernizing Courts: Working smarter with a data warehouse \- Indiana Court Times \- IN.gov, accessed October 14, 2025, [https://times.courts.in.gov/2025/02/18/modernizing-courts-working-smarter-with-a-data-warehouse/](https://times.courts.in.gov/2025/02/18/modernizing-courts-working-smarter-with-a-data-warehouse/)