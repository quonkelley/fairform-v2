<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# FairForm Marion County Civil Law \& Data Access Research Report

## Executive Summary

**Overall Feasibility**: **Moderate to High** - FairForm can technically and procedurally access Marion County civil case data through multiple pathways, though each has distinct limitations and compliance requirements.

**Key Findings**:

- **Public Access**: Indiana Code 5-14-3 provides strong public records access, with court data presumptively public[^1][^2]
- **Technical Access**: MyCase Indiana offers public search capabilities covering most courts, but lacks official APIs[^3][^4]
- **Commercial Options**: Services like Doxpop provide comprehensive data access for 37M+ cases across 92 Indiana counties[^5][^6]
- **Compliance Path**: Clear guidelines exist for avoiding Unauthorized Practice of Law (UPL) while providing self-represented litigant support[^7][^8]


## Court System \& Rules Overview

### Marion County Civil Divisions

**Marion Superior Court - Civil Division**[^9][^10]

- **Jurisdiction**: General civil cases, probate, environmental cases, domestic relations
- **Location**: 675 Justice Way, Indianapolis (opened April 2022)
- **Capacity**: 71 courtrooms with latest courtroom technology
- **Case Types**: Civil tort, contract disputes, real property, probate matters

**Small Claims Courts (9 Township Courts)**[^11][^12]

- **Jurisdiction**: Claims under \$8,000-\$10,000[^13][^14]
- **Coverage**: Each township (Center, Warren, Lawrence, Perry, Pike, Washington, Wayne, Franklin, Decatur)
- **Common Cases**: Debt collection (including medical/credit card), landlord-tenant disputes, evictions
- **Procedures**: Informal hearings, self-representation encouraged, no jury trials unless requested[^15][^16]

**Family Division**[^10][^17]

- **Jurisdiction**: Domestic relations, juvenile cases
- **Case Types**: Divorce, child support, custody, paternity, adoption
- **Special Considerations**: Many records confidential under Rules on Access to Court Records[^18][^19]

**Housing/Eviction Courts**[^20][^21][^22]

- **Jurisdiction**: Landlord-tenant disputes, possession actions
- **Timeline**: Minimum 10 days from filing to hearing under Marion County local rules[^21]
- **Volume**: Indianapolis has 5th highest eviction filing rate nationally (16 per 100 rental households)[^21]


### Local Rules and Procedures

**Marion County Specific Requirements**:[^23]

- Criminal and civil divisions have separate sub-divisions
- Local rules govern hearing scheduling and procedures
- Electronic filing mandatory for most case types[^24][^25]

**Key Procedural Differences**: Township vs. County courts have varying procedures, with some townships like Lawrence offering contested hearings for disputed evictions[^21]

## Data Access \& APIs

### Available Systems

**1. MyCase Indiana (Public Access)**[^4][^26][^3]

- **URL**: https://public.courts.in.gov/mycase/
- **Coverage**: Courts using Odyssey system (104+ courts in 35+ counties)[^27]
- **Search Options**: Case number, party name, attorney, date range
- **Limitations**: 1,000 result maximum, occasional CAPTCHA, no official API
- **Data Available**: Case summaries, docket entries, some documents (free)

**2. Indiana Odyssey System**[^28][^29]

- **Provider**: Tyler Technologies
- **Coverage**: Statewide deployment ongoing (7+ million case records online)[^27]
- **Access**: Internal court system only - no public API
- **Features**: Person-based system, cross-county case tracking, integration with law enforcement

**3. Marion County Clerk Records**[^30][^31]

- **Access Methods**: Online request system, physical records facility
- **Location**: 1330 Madison Avenue (Records) + 675 Justice Way (Court)
- **Fees**: \$1 per page copies, \$3 certification fee[^31]
- **Online Portal**: https://www.indy.gov/workflow/public-record-request

**4. Doxpop (Commercial Service)**[^32][^5]

- **Coverage**: 37M+ cases from 366 courts in 92 Indiana counties
- **Features**: Real-time updates (every 10 minutes), case notifications, e-filing services
- **Access**: Subscription-based, established commercial provider since 2002
- **Integration**: Designed for legal professionals, bulk access available

**5. Indiana eFiling System**[^25][^24]

- **Provider**: Tyler Technologies (Odyssey File \& Serve)
- **Purpose**: Electronic document filing, not data access
- **Status**: Statewide implementation ongoing
- **User Base**: Attorneys and self-represented litigants


### Third-Party Integration Examples

**Successful Models**:[^33]

- **CourtListener/RECAP**: Provides bulk PACER data access for federal courts[^34][^35]
- **Connecticut Courts**: Provides bulk standardized data via online portal (\$720/year)[^33]
- **Wisconsin Supreme Court**: Offers sample code and data output for developers[^33]


### Data Scraping Technical Assessment

**Legal Framework**:[^36][^37][^1]

- **CFAA Compliance**: Public websites likely not covered under "without authorization" per HiQ v. LinkedIn[^37][^36]
- **Public Records**: Indiana Code 5-14-3 establishes presumption of public access[^2][^1]
- **Rate Limiting**: Must respect technical barriers and reasonable use policies[^38][^39]

**Technical Barriers**:[^3][^4]

- **CAPTCHA**: Occasional challenges, but bypass may be legally permissible for public data[^36]
- **JavaScript**: Heavy client-side processing requires headless browser automation
- **Rate Limits**: Undefined thresholds, require careful implementation
- **Session Management**: Search results tied to browser sessions


## Case Lifecycle Mapping

### Eviction Process Journey

**Timeline: 3-6 weeks total**[^22][^40][^21]

1. **Notice Period (Day 0)**: 10-day notice for non-payment, 30-day for lease violations[^40][^22]
2. **Filing (Day 10+)**: Landlord files complaint in appropriate small claims court[^20][^21]
3. **Service (Day 12-15)**: Sheriff serves tenant with court papers[^22][^21]
4. **Hearing (Day 20-30)**: Initial possession hearing (minimum 10 days after filing)[^21]
5. **Possession Date (Day 25-40)**: Court grants 5-21 days to vacate (judge's discretion)[^22][^21]
6. **Sheriff Eviction (Day 30-45)**: Physical removal if tenant doesn't vacate voluntarily[^40][^21]

**Key Documents**: Notice to Quit, Complaint, Summons, Judgment for Possession, Writ of Possession

### Small Claims Process Journey

**Timeline: 6-12 weeks total**[^41][^16][^15]

1. **Filing (Day 0)**: Notice of Claim filed with required attachments[^16]
2. **Service (Day 5-10)**: Defendant served via sheriff or certified mail[^16]
3. **Response Period (Day 10-20)**: Defendant may file counterclaim or jury demand[^15][^16]
4. **Trial (Day 30-60)**: Informal hearing with evidence presentation[^15][^16]
5. **Judgment (Day 30-60)**: Decision issued (often same day as trial)[^15]
6. **Collection (Day 45+)**: Wage garnishment if judgment unpaid[^12][^15]

**Key Documents**: Notice of Claim, Affidavit of Debt, Contract copies, Service affidavit, Judgment, Garnishment orders

### Family Law Timeline

**Divorce/Custody Cases**: 60+ days minimum (Indiana waiting period), often 6-12 months for contested matters
**Child Support**: Can be expedited, often 30-60 days for establishment
**Paternity**: 90-120 days typical, DNA testing may extend timeline

## Compliance, Ethics \& UPL Considerations

### Indiana Public Records Law (IC 5-14-3)[^1][^2]

**Public Access Presumption**: Court records are presumptively public unless specifically excluded[^42][^18]

**Permitted Disclosures**:[^2]

- Case information, docket entries, filed documents
- Party names (except protected persons), case numbers, hearing dates
- Judgments, orders, and court decisions

**Excluded Records**:[^43][^19]

- Complete Social Security Numbers
- Financial account numbers and PINs
- Mental health and medical records
- Confidential informants, sealed records
- Most juvenile case details


### Unauthorized Practice of Law (UPL) Restrictions[^8][^7]

**Prohibited Activities**:[^8]

- Providing legal advice tailored to specific situations
- Recommending specific legal remedies or courses of action
- Preparing legal documents using advocate's own words
- Representing individuals in court proceedings

**Permitted Activities**:[^8]

- Providing general legal information and education
- Supplying copies of statutes, rules, and standard forms
- Explaining general court procedures and timelines
- Offering multiple options without specific recommendations

**FairForm Compliance Strategy**:

- **Educational Focus**: Present journey maps as general information, not specific advice
- **Multiple Options**: Show various procedural paths without recommending specific choices
- **Disclaimer Requirements**: Clear statements about informational purpose and attorney consultation needs
- **No Document Preparation**: Guide users to official forms but don't prepare personalized documents


### Required Legal Disclaimers

Based on Indiana UPL guidance and public records law:[^7][^8]

1. "This information is for educational purposes only and does not constitute legal advice"
2. "Court procedures vary by jurisdiction and individual circumstances"
3. "Users should consult with a qualified attorney for advice specific to their situation"
4. "Information may not reflect the most current law or local procedures"
5. "Court records are public information but accuracy cannot be guaranteed"

## Integration Recommendations

### Short-Term Implementation (0-6 months)

**Approach**: Public MyCase Integration + Manual Data Entry

**Technical Implementation**:

- **Web Scraping**: Selenium-based automation with CAPTCHA handling[^44]
- **Rate Limiting**: 1-2 requests per minute to respect system resources[^39][^45]
- **Data Coverage**: Basic case information, docket entries, hearing dates
- **Search Capabilities**: Case number, party name lookup for Marion County

**Limitations**:

- Manual CAPTCHA solving required periodically
- 1,000 result limit per search may require multiple queries
- Risk of IP blocking if not carefully managed
- Limited to publicly available summary data

**Estimated Development**: 4-6 weeks for basic implementation

### Medium-Term Approach (6-18 months)

**Approach**: Commercial Data Partnership (Doxpop or Similar)

**Benefits**:[^6][^5]

- **Comprehensive Coverage**: 37M+ cases across 92 Indiana counties
- **Real-time Updates**: Data refreshed every 10 minutes
- **Professional Support**: Established API, documentation, customer service
- **Bulk Access**: Historical data and ongoing feeds available
- **Legal Protection**: Commercial terms of service, established provider

**Implementation**:

- Subscription agreement with data provider
- API integration for automated case data retrieval
- Real-time notification system for case updates
- Bulk historical data import for comprehensive coverage

**Estimated Cost**: \$500-2,000+ per month depending on usage and features

### Long-Term Approach (12+ months)

**Approach**: Official Court Partnership

**Implementation Strategy**:

- **Formal Application**: Submit bulk data request under Administrative Rule 9(F)[^46]
- **Partnership Agreement**: Direct relationship with Marion County Clerk's office
- **API Development**: Work with Tyler Technologies on Odyssey integration
- **Pilot Program**: Demonstrate value proposition for self-represented litigants

**Requirements**:[^46][^33]

- Written application to Indiana Office of Court Services
- Demonstration of public benefit and data security measures
- Compliance with court technology and privacy requirements
- Potential fee structure based on data volume and usage

**Benefits**:

- Official sanction and support
- Complete data access including restricted information (with proper safeguards)
- Integration with court modernization initiatives
- Potential for bi-directional data flow (case status updates, filing assistance)


### Recommended Implementation Sequence

**Phase 1 (Immediate)**: Begin with MyCase public access integration

- Low cost, immediate availability
- Proof of concept for journey mapping
- User feedback and refinement

**Phase 2 (3-6 months)**: Add commercial data partnership

- Enhanced data depth and reliability
- Expansion beyond Marion County
- Professional-grade service level

**Phase 3 (12+ months)**: Pursue official court partnership

- Long-term sustainability
- Maximum data access and integration
- Position as official court modernization partner


## Technical Architecture Recommendations

### Data Collection Pipeline

**Input Sources**:

1. **MyCase Public Search**: Basic case data and docket entries
2. **Commercial Provider API**: Comprehensive case history and updates
3. **Manual Court Forms**: Official documents and procedures
4. **Legal Resource Integration**: Indiana Legal Help, Legal Services resources[^47][^48]

**Processing Layer**:

- **Case Type Classification**: Automated categorization (eviction, small claims, family)
- **Journey Stage Detection**: Pattern matching to identify case progress
- **Data Normalization**: Standardize formats across different data sources
- **Privacy Compliance**: Automatic redaction of excluded information

**Output Generation**:

- **Journey Visualization**: Step-by-step progress maps with timelines
- **Next Steps Guidance**: Context-appropriate information and resources
- **Document Checklists**: Required forms and evidence by case type and stage
- **Resource Directory**: Legal aid, self-help resources, court contact information


### Integration Points for FairForm

Based on the attached project documentation, FairForm's AI Copilot system can integrate court data access through:[^49][^50][^51]

**Conversation Context Building**:

- Real-time case lookup during AI conversations
- Automatic journey stage detection based on user descriptions
- Dynamic resource recommendations based on case status

**Case Creation Flow**:

- Pre-populate case details from court record searches
- Validate user-provided information against court data
- Generate realistic timeline expectations based on similar cases

**Progress Tracking**:

- Automated case status monitoring via commercial data feeds
- Proactive notifications of hearing dates, deadlines, document requirements
- Integration with existing case journey visualization system

This comprehensive approach positions FairForm to provide valuable, compliant, and technically sophisticated support for self-represented litigants in Marion County and throughout Indiana.
<span style="display:none">[^100][^101][^102][^103][^104][^105][^106][^107][^108][^109][^110][^111][^112][^113][^114][^52][^53][^54][^55][^56][^57][^58][^59][^60][^61][^62][^63][^64][^65][^66][^67][^68][^69][^70][^71][^72][^73][^74][^75][^76][^77][^78][^79][^80][^81][^82][^83][^84][^85][^86][^87][^88][^89][^90][^91][^92][^93][^94][^95][^96][^97][^98][^99]</span>

<div align="center">⁂</div>

[^1]: https://law.justia.com/codes/indiana/title-5/article-14/chapter-3/

[^2]: https://www.in.gov/courts/iocs/files/pubs-accesshandbook.pdf

[^3]: https://public.courts.in.gov/mycase/

[^4]: https://www.in.gov/courts/help/mycase/

[^5]: https://www.doxpop.com/prod/ad/IndianaLawBlog.jsp

[^6]: https://www.doxpop.com/prod/info/PublicInfo.jsp

[^7]: https://www.inbar.org/page/unauthorizedpracticelaw

[^8]: https://www.inbarfoundation.org/wp-content/uploads/2024/10/5UNAUT1.pdf

[^9]: https://www.indy.gov/activity/marion-county-courts-civil-filing-division

[^10]: https://imp-backend.prod.cityba.se/agency/marion-superior-court

[^11]: https://centergov.org/small-claims-court/about-the-court/

[^12]: https://heartlandprobono.com/marion-county-small-claims-courts/

[^13]: https://www.in.gov/courts/files/small-claims-manual-.pdf

[^14]: https://centergov.org/wp-content/uploads/sites/6/2022/01/Booklet-Small-Claim-Litigants-Manual-2022.pdf

[^15]: https://www.in.gov/courts/files/small-claims-manual.pdf

[^16]: https://rules.incourts.gov/pdf/PDF - Small Claims/small-claims.pdf

[^17]: https://marioncountycourt.org

[^18]: https://rules.incourts.gov/Content/records/default.htm

[^19]: https://rules.incourts.gov/Content/records/rule5/current.htm

[^20]: https://www.marioncountyclerk.org/uploads/2023/08/CIV_WhatYouWillNeedtoFileanEviction_20230628_WEB.pdf

[^21]: https://www.indystar.com/story/news/local/indianapolis/2023/12/15/indiana-evictions-what-to-expect-where-to-find-help-facing-eviction/71901312007/

[^22]: https://fritchlaw.com/2025/02/26/tenant-rights-indiana-eviction/

[^23]: https://www.in.gov/courts/files/marion-local-rules.pdf

[^24]: https://www.in.gov/courts/files/efiling-user-guide.pdf

[^25]: https://www.in.gov/courts/efiling/

[^26]: https://www.in.gov/courts/help/mycase/search-tips/

[^27]: https://www.theindianalawyer.com/articles/27221-court-oks-access-to-odyssey-data

[^28]: https://www.in.gov/courts/admin/tech/odyssey/

[^29]: https://www.tylertech.com/Portals/0/OpenContent/Files/3209/Odyssey-Overview-Brochure.pdf

[^30]: https://www.indy.gov/agency/marion-county-clerks-office

[^31]: https://marioncountycourt.org/court-records/

[^32]: https://www.doxpop.com/prod/court/

[^33]: https://www.pew.org/en/research-and-analysis/fact-sheets/2023/09/how-to-share-civil-justice-data-with-third-parties-to-improve-public-knowledge-over

[^34]: https://www.courtlistener.com/recap/

[^35]: https://www.courtlistener.com/help/coverage/recap/

[^36]: https://blog.apify.com/is-web-scraping-legal/

[^37]: https://www.eff.org/deeplinks/2022/04/scraping-public-websites-still-isnt-crime-court-appeals-declares

[^38]: https://www.quinnemanuel.com/the-firm/publications/the-legal-landscape-of-web-scraping/

[^39]: https://www.swlaw.com/publication/legal-landscape-of-web-scraping-and-practice-tips/

[^40]: https://www.doorloop.com/laws/indiana-eviction-process

[^41]: https://banksbrower.com/2014/01/30/a-look-at-indianas-small-claims-process/

[^42]: https://cityofhobart.org/DocumentCenter/View/2497/Rules-On-Access-To-Court-Records-PDF?bidId=

[^43]: https://www.in.gov/courts/iocs/publications/excluded-records/

[^44]: https://stackoverflow.com/questions/58696920/scraping-a-webpage-that-requires-inputs-and-recaptcha-in-python

[^45]: https://www.reddit.com/r/programming/comments/evntaa/us_court_fully_legalized_website_scraping_and/

[^46]: https://www.in.gov/courts/iocs/statistics/bulk-data/

[^47]: https://indianalegalhelp.org

[^48]: https://www.indianalegalservices.org

[^49]: HANDOFF-NEXT-SESSION.md

[^50]: README.md

[^51]: FAIRFORM-MASTER-ROADMAP.md

[^52]: README2.md

[^53]: https://www.indy.gov/activity/request-copies-of-court-records

[^54]: https://www.indy.gov/activity/filing-a-civil-case

[^55]: https://documenter.getpostman.com/view/5415285/Szf3bVwR

[^56]: https://www.in.gov/courts/local/marion-county/

[^57]: https://www.povertyactionlab.org/admindatacatalog/indiana-judicial-branch-court-data

[^58]: https://marioncountycourt.org/public-records/

[^59]: https://www.indycourts.org

[^60]: https://www.marioncountyclerk.org/search-records/

[^61]: https://www.in.gov/courts/public-records/

[^62]: https://www.in.gov/courts/files/court-directory.pdf

[^63]: http://efilinghelp.com/indiana/indiana-usage-agreement/

[^64]: https://www.indy.gov/activity/information-about-marion-county-small-claims-courts

[^65]: https://www.in.gov/courts/publications/small-claims-manual/

[^66]: https://www.in.gov/courts/iocs/files/pubs-trial-court-acr-rule-5.pdf

[^67]: https://www.indy.gov/activity/find-small-claims-court-forms

[^68]: https://www.indy.gov/activity/access-online-case-information

[^69]: https://www.centergov.org/small-claims-court/

[^70]: https://www.in.gov/courts/help/mycase/access/

[^71]: https://rules.incourts.gov/Content/small-claims/default.htm

[^72]: https://www.indy.gov/activity/access-to-public-records-act

[^73]: https://smallclaims.lawtwp.org/filing-a-claim/

[^74]: https://law.indiana.libguides.com/c.php?g=19803\&p=112354

[^75]: https://www.theindianalawyer.com/articles/in-supreme-court-amends-rules-of-access-to-court-records

[^76]: https://www.apmhelp.com/blog/eviction-process-indiana

[^77]: https://www.indy.gov/activity/types-of-court-cases

[^78]: https://www.in.gov/courts/iocs/committees/eviction/

[^79]: https://times.courts.in.gov/2017/10/11/commitment-to-data-sharing/

[^80]: https://www.in.gov/courts/iocs/files/casetype-quick-reference.pdf

[^81]: https://www.doxpop.com/prod/registered.jsp

[^82]: https://rules.incourts.gov/Content/records/toc.htm

[^83]: https://law.justia.com/codes/indiana/title-5/article-14/chapter-3/section-5-14-3-3/

[^84]: https://www.courtlistener.com/c/ind/

[^85]: https://www.in.gov/iara/files/legal.pdf

[^86]: https://www.courtlistener.com

[^87]: https://www.kriegdevault.com/insights/investigatory-records-exception-indianas-access-public-records-act-

[^88]: https://www.courtlistener.com/docket/4799419/idb/indiana-protection-and-advocacy-services-commission-v-commissioner/

[^89]: https://www.avonindiana.gov/DocumentCenter/View/765/Open-Door-Law-Handbook-PDF

[^90]: https://www.courtlistener.com/help/api/rest/recap/

[^91]: https://www.rcfp.org/open-government-guide/indiana/

[^92]: https://antiscrapingalliance.org/wp-content/uploads/2023/07/White-Paper-Fast-Facts_071123.pdf

[^93]: https://www.indy.gov/agency/marion-county-circuit-small-claims-court

[^94]: https://lakecountyin.gov/departments/county-div-2-sc

[^95]: https://specializedpropertymanagementindianapolis.com/indiana-eviction-process/

[^96]: https://www.co.delaware.in.us/egov/apps/document/center.egov?view=item%3Bid%3D7793

[^97]: https://rentsafe.lease/indiana-eviction-laws/

[^98]: https://www.in.gov/dor/files/schema-def-ct19.pdf

[^99]: https://www.in.gov/dor/files/schema-def-otpm.pdf

[^100]: https://www.in.gov/courts/selfservice/

[^101]: https://bankruptcynotices.uscourts.gov/assets/docs/xml_implementation.pdf

[^102]: https://www.marioncountyclerk.org/online-options/e-file/

[^103]: https://www.in.gov/courts/selfservice/unrepresented/

[^104]: https://www.oasis-open.org/committees/legalxml-courtfiling/documents/court_document/courtdocument_11(rev1).html

[^105]: https://www.indypl.org/research-learn/legal-resources

[^106]: https://www.irs.gov/e-file-providers/valid-xml-schemas-and-business-rules-for-1065-modernized-e-file-mef

[^107]: https://ciyoulaw.com/e-filing-in-indiana-courts/

[^108]: https://www.insd.uscourts.gov/free-legal-resources

[^109]: https://fsapartners.ed.gov/knowledge-center/library/cod-xml-schema/2024-10-25/cod-common-record-xml-schema-version-50c

[^110]: https://www.indy.gov/activity/record-documents-electronically

[^111]: https://www.inbarfoundation.org/civil-legal-assistance/

[^112]: https://pacer.uscourts.gov/sites/default/files/files/PCL-API-Document_0.pdf

[^113]: https://marioncountyil.gov/wp-content/uploads/E-filing-Standards-Marion-County.pdf

[^114]: https://www.doxpop.com

