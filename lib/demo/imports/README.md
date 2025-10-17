# Demo Import Fixtures

This directory contains JSON fixture files that simulate various types of legal notices and case documents that can be imported into FairForm for demo and testing purposes.

## Fixture Files

### Eviction Cases

#### `eviction.notice.json`
- **Case Type**: Eviction (10-day notice to pay or quit)
- **Case Number**: 49K01-2510-EV-001234
- **Court**: Center Township Small Claims Court
- **Amount**: $1,200.00 rent owed
- **Parties**: ABC Property Management LLC vs Maria Rodriguez
- **Timeline**: 10-day notice period, hearing in ~4 weeks

#### `eviction-downtown.notice.json`
- **Case Type**: Eviction (30-day notice to quit)
- **Case Number**: 49K02-2510-EV-001234
- **Court**: Downtown Township Small Claims Court
- **Amount**: $1,800.00 rent owed
- **Parties**: Downtown Apartments LLC vs Jennifer Martinez
- **Timeline**: 30-day notice period, hearing in ~4 weeks
- **Note**: Different court (K02) to show system variety

### Debt Collection Cases

#### `debt-collection.notice.json`
- **Case Type**: Debt Collection (credit card debt)
- **Case Number**: 49K01-2510-DC-001234
- **Court**: Center Township Small Claims Court
- **Amount**: $2,847.50
- **Parties**: Midwest Credit Services LLC vs James Wilson
- **Debt Type**: Credit card debt from First National Bank
- **Timeline**: 30-day demand letter, hearing in ~5 weeks

#### `debt-collection-medical.notice.json`
- **Case Type**: Debt Collection (medical debt)
- **Case Number**: 49K01-2510-DC-001235
- **Court**: Center Township Small Claims Court
- **Amount**: $1,245.80
- **Parties**: Indiana Medical Collections Inc vs Maria Garcia
- **Debt Type**: Medical debt from Methodist Hospital
- **Timeline**: 30-day demand letter, hearing in ~5 weeks
- **Note**: Medical debt has different legal considerations

### Small Claims Cases

#### `small-claims.notice.json`
- **Case Type**: Small Claims (property damage/breach of contract)
- **Case Number**: 49K01-2510-SC-001234
- **Court**: Center Township Small Claims Court
- **Amount**: $1,850.00
- **Parties**: Sarah Johnson vs Premier Auto Repair LLC
- **Dispute**: Defective auto repair work
- **Timeline**: 15-day response period, hearing in ~6 weeks

#### `small-claims-landlord.notice.json`
- **Case Type**: Small Claims (security deposit dispute)
- **Case Number**: 49K01-2510-SC-001235
- **Court**: Center Township Small Claims Court
- **Amount**: $2,400.00
- **Parties**: Michael Chen vs Downtown Properties LLC
- **Dispute**: Security deposit not returned within 45 days
- **Timeline**: 15-day response period, hearing in ~6 weeks
- **Note**: Landlord-tenant specific dispute

#### `small-claims-complex.notice.json`
- **Case Type**: Small Claims (complex construction dispute)
- **Case Number**: 49K01-2510-SC-001236
- **Court**: Center Township Small Claims Court
- **Amount**: $4,750.00
- **Parties**: Robert Thompson vs Elite Construction Services Inc
- **Dispute**: Multiple construction defects (electrical, plumbing, incomplete work)
- **Timeline**: 15-day response period, hearing in ~6 weeks
- **Note**: Complex case with multiple damage types

## Case Numbering System

All case numbers follow the Indiana Uniform Case Numbering System (Admin Rule 8):
- **Format**: [County]-[Court]-[YYMM]-[Type]-[Sequence]
- **Marion County Code**: 49
- **Court Codes**:
  - K01: Center Township Small Claims Court
  - K02: Downtown Township Small Claims Court
- **Case Type Codes**:
  - EV: Eviction
  - DC: Debt Collection
  - SC: Small Claims
- **Example**: 49K01-2510-EV-001234 = Marion County, Center Township, October 2025, Eviction, Case #1234

## Usage

These fixtures are designed to work with the `parseDemoNotice()` function in the case import system. Each file contains:

- **Complete case metadata** (court info, parties, amounts, dates)
- **Timeline information** (notice dates, response deadlines, hearing dates)
- **Glossary terms** (legal terms relevant to the case type)
- **Jurisdiction-specific details** (filing fees, court addresses, hours)

## Testing Scenarios

The fixtures support various testing scenarios:

1. **Happy Path**: Valid case data that parses successfully
2. **Different Case Types**: Various legal matter types for comprehensive testing
3. **Different Courts**: Multiple court jurisdictions within Marion County
4. **Different Timelines**: Various notice periods and hearing schedules
5. **Complex Cases**: Multi-issue disputes for advanced testing
6. **Edge Cases**: Different debt types, dispute categories, and amounts

## Integration

These fixtures integrate with:
- **Demo scenarios** in `lib/demo/scenarios/`
- **Import parser** in `lib/demo/importNotice.ts`
- **Test suites** in `tests/lib/demo/`
- **AI Copilot** for case creation and guidance
