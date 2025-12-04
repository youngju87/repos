# Tracking Plan Template - Excel Setup Instructions

## Files Created
- `Tracking_Plan_Template.csv` - Event Inventory (Sheet 1)
- `Tracking_Plan_Parameters.csv` - Parameter Definitions (Sheet 2)
- `Tracking_Plan_Ecommerce_Events.csv` - Ecommerce Events Reference (Sheet 3)
- `Tracking_Plan_Validation_Checklist.csv` - Validation Checklist (Sheet 4)

## How to Create the Excel File

### Step 1: Create New Excel Workbook
1. Open Microsoft Excel
2. Create a new blank workbook
3. Save as: `Tracking_Plan_Template.xlsx`

### Step 2: Import Each CSV as a Separate Sheet

#### Import Sheet 1 - Event Inventory
1. Go to Data > Get Data > From File > From Text/CSV
2. Select `Tracking_Plan_Template.csv`
3. Click "Load"
4. Rename sheet to "Event Inventory"

#### Import Sheet 2 - Parameter Definitions
1. Create new sheet
2. Data > Get Data > From File > From Text/CSV
3. Select `Tracking_Plan_Parameters.csv`
4. Click "Load"
5. Rename sheet to "Parameter Definitions"

#### Import Sheet 3 - Ecommerce Events
1. Create new sheet
2. Data > Get Data > From File > From Text/CSV
3. Select `Tracking_Plan_Ecommerce_Events.csv`
4. Click "Load"
5. Rename sheet to "Ecommerce Events"

#### Import Sheet 4 - Validation Checklist
1. Create new sheet
2. Data > Get Data > From File > From Text/CSV
3. Select `Tracking_Plan_Validation_Checklist.csv`
4. Click "Load"
5. Rename sheet to "Validation Checklist"

### Step 3: Format Each Sheet

#### Sheet 1: Event Inventory

**Freeze Header Row:**
1. Click on row 2
2. View > Freeze Panes > Freeze Top Row

**Add Data Validation (Dropdowns):**

**Column G - Implementation Status:**
1. Select column G (excluding header)
2. Data > Data Validation
3. Allow: List
4. Source: `Not Started,In Progress,QA,Live`

**Column H - Priority:**
1. Select column H (excluding header)
2. Data > Data Validation
3. Allow: List
4. Source: `High,Medium,Low`

**Add Conditional Formatting:**

**Implementation Status:**
1. Select column G data cells
2. Home > Conditional Formatting > Highlight Cell Rules > Text that Contains
3. "Not Started" = Orange fill
4. "In Progress" = Yellow fill
5. "QA" = Light blue fill
6. "Live" = Green fill

**Priority:**
1. Select column H data cells
2. Home > Conditional Formatting > Highlight Cell Rules > Text that Contains
3. "High" = Red fill
4. "Medium" = Yellow fill
5. "Low" = Green fill

**Format Header Row:**
1. Select row 1
2. Bold text
3. Background color: #0f172a (or dark blue)
4. Font color: White
5. Height: 30

**Adjust Column Widths:**
- A (Event Category): 15
- B (Event Name): 20
- C (Description): 35
- D (Trigger Type): 15
- E (Page/Screen): 20
- F (Parameters): 40
- G (Implementation Status): 18
- H (Priority): 12
- I (Notes): 30

**Add Filter:**
1. Select header row
2. Data > Filter

---

#### Sheet 2: Parameter Definitions

**Freeze Header Row:**
1. Click on row 2
2. View > Freeze Panes > Freeze Top Row

**Add Data Validation:**

**Column B - Scope:**
1. Select column B (excluding header)
2. Data > Data Validation
3. Allow: List
4. Source: `Event,User,Item`

**Column C - Data Type:**
1. Select column C (excluding header)
2. Data > Data Validation
3. Allow: List
4. Source: `String,Number,Boolean,Array`

**Column F - Required:**
1. Select column F (excluding header)
2. Data > Data Validation
3. Allow: List
4. Source: `Yes,No,Yes (ecommerce),Yes (purchase),Auto-collected`

**Column G - GA4 Registration Required:**
1. Select column G (excluding header)
2. Data > Data Validation
3. Allow: List
4. Source: `Yes,No`

**Format Header Row:**
1. Select row 1
2. Bold text
3. Background color: #0f172a
4. Font color: White
5. Height: 30

**Adjust Column Widths:**
- A (Parameter Name): 25
- B (Scope): 12
- C (Data Type): 12
- D (Example Value): 35
- E (Description): 40
- F (Required): 20
- G (GA4 Registration Required): 20

**Add Filter:**
1. Select header row
2. Data > Filter

---

#### Sheet 3: Ecommerce Events

**Freeze Header Row:**
1. Click on row 2
2. View > Freeze Panes > Freeze Top Row

**Format Header Row:**
1. Select row 1
2. Bold text
3. Background color: #2563eb (blue)
4. Font color: White
5. Height: 30

**Adjust Column Widths:**
- A (Event Name): 20
- B (Description): 30
- C (Trigger): 25
- D (Required Parameters): 35
- E (Recommended Parameters): 30
- F (Optional Parameters): 35
- G (Notes): 40

**Make Read-Only (Reference Sheet):**
1. Right-click sheet tab
2. Protect Sheet
3. Uncheck "Select locked cells" to make it reference only
4. No password needed

**Add Conditional Formatting:**
1. Select entire data range
2. Home > Conditional Formatting > New Rule
3. Use formula: `=SEARCH("Critical", $G2)`
4. Format: Bold, Red text

---

#### Sheet 4: Validation Checklist

**Freeze Header Row:**
1. Click on row 2
2. View > Freeze Panes > Freeze Top Row

**Add Checkboxes:**
1. Developer tab (enable if not visible: File > Options > Customize Ribbon > Developer)
2. For columns B through F:
   - Click in first data cell
   - Developer > Insert > Checkbox
   - Copy checkbox down the column
   - Right-click checkbox > Format Control > Cell link: [same cell]

**Format Header Row:**
1. Select row 1
2. Bold text
3. Background color: #0f172a
4. Font color: White
5. Height: 30
6. Text wrap: On

**Adjust Column Widths:**
- A (Event Name): 20
- B-F (Checkboxes): 12 each
- G (Tested By): 15
- H (Date Validated): 15
- I (Notes): 30

**Add Conditional Formatting for Completed Rows:**
1. Select entire data range
2. Home > Conditional Formatting > New Rule
3. Use formula: `=AND($B2=TRUE,$C2=TRUE,$D2=TRUE,$E2=TRUE,$F2=TRUE)`
4. Format: Light green fill

---

### Step 4: Apply Global Formatting

**For All Sheets:**

1. **Font:** Arial or Calibri, 10pt
2. **Alternating Row Colors:**
   - Select data range
   - Home > Format as Table > Choose light gray style
   - Convert back to range if needed (Table Design > Convert to Range)

3. **Grid Lines:**
   - Ensure all cells have borders
   - Select all > Home > Borders > All Borders (light gray)

4. **Page Setup (for printing):**
   - Page Layout > Orientation > Landscape
   - Page Layout > Size > Letter
   - Page Layout > Print Titles > Rows to repeat at top: Row 1
   - Margins: Narrow

---

### Step 5: Add Instructions Sheet

1. Create a new sheet as first sheet
2. Rename to "Instructions"
3. Add the following content:

```
TRACKING PLAN TEMPLATE
JY/co Digital Analytics Consulting

PURPOSE:
This tracking plan documents all analytics events, parameters, and implementation
specifications for Google Analytics 4.

HOW TO USE:
1. Start with the Event Inventory sheet - document all events to be tracked
2. Reference Parameter Definitions for standard parameter specifications
3. Use Ecommerce Events as reference for standard GA4 ecommerce implementation
4. Use Validation Checklist to QA implementation before launch

SHEET DESCRIPTIONS:
- Event Inventory: Master list of all tracking events
- Parameter Definitions: Data dictionary for all event/user parameters
- Ecommerce Events: Standard GA4 ecommerce event specifications
- Validation Checklist: QA testing checklist

BEST PRACTICES:
- Use snake_case for all event and parameter names
- Document events BEFORE implementation begins
- Keep this tracking plan updated as implementation evolves
- Share with developers, marketers, and analysts

For questions or assistance:
JY/co LLC
[YOUR EMAIL]
[YOUR WEBSITE]
```

Format instructions sheet:
- Large title at top
- Professional spacing
- Brand colors for headers

---

### Step 6: Protect and Save

1. **Protect Structure:**
   - Review > Protect Workbook
   - Prevents accidental sheet deletion

2. **Save:**
   - File > Save As
   - Format: Excel Workbook (.xlsx)
   - Name: `Tracking_Plan_Template.xlsx`

3. **Create PDF Version (Optional):**
   - File > Export > Create PDF
   - Options: Entire Workbook
   - Name: `Tracking_Plan_Template.pdf`

---

## Color Scheme Reference

**Brand Colors:**
- Primary: #0f172a (slate 900) - Header backgrounds
- Accent: #2563eb (blue 600) - Section highlights
- Secondary: #f59e0b (amber 500) - Warnings/Medium priority

**Status Colors:**
- Red: #ef4444 - Critical/High priority/Not Started
- Yellow: #f59e0b - Medium priority/In Progress
- Green: #10b981 - Low priority/Live/Completed
- Light Blue: #60a5fa - QA status
- Orange: #fb923c - Not Started status

---

## Tips for Client Use

1. **Make a Copy:** Never edit the master template - always work from a copy
2. **Version Control:** Include version number and date in filename
3. **Collaboration:** Use Excel Online or shared drives for team collaboration
4. **Export:** Export to CSV for developers who prefer plain text formats
5. **Backup:** Keep backups before major changes

---

**END OF INSTRUCTIONS**
