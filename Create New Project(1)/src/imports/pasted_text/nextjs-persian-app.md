این نسخه برای **Next.js** بازنویسی شده است. متن پرامپت انگلیسی است، اما زبان تمام بخش‌های وب‌سایت **فارسی و راست‌به‌چپ** خواهد بود.

```text
Act as a senior frontend engineer and build a functional web application using Next.js for managing electricity network load data, feeder outage constraints, and weekly outage schedules.

The entire website must be in Persian (Farsi) with a right-to-left layout. This prompt is in English, but all user-facing labels, buttons, navigation, validation messages, tooltips, empty states, and notifications must be in Persian.

Build an actual working frontend, not just a landing page or a static dashboard. Implement data import, manual entry, editing, constraint management, calculation requests, and schedule exploration.

1. TECHNOLOGY AND APPLICATION STRUCTURE

Use:
- Next.js with App Router and TypeScript.
- Tailwind CSS.
- Accessible UI components with proper RTL support, such as shadcn/ui.
- TanStack Table for data tables.
- TanStack Query for API communication and asynchronous state.
- React Hook Form and Zod for forms and validation.
- An appropriate Excel library for importing and exporting .xlsx files.
- A reliable Jalali calendar and date picker.
- IndexedDB for persistence in demonstration mode.

Use Server Components where appropriate and Client Components for interactive tables, forms, file uploads, browser storage, and charts.

Access browser-only APIs and Excel parsing libraries safely on the client. Avoid hydration errors.

Keep API communication, business data models, import parsing, and UI components separated.

Implement a replaceable service layer with:
- A mock adapter for the standalone demonstration.
- An HTTP adapter prepared for integration with the actual backend.

Do not implement the outage optimization algorithm in the frontend or invent an optimization backend.

2. LANGUAGE AND VISUAL DESIGN

Requirements:
- Set the document language to Persian and direction to RTL.
- Use a Persian font such as Vazirmatn.
- Create a clean, professional interface suitable for electricity utility operations.
- Optimize for desktop use while remaining usable on smaller screens.
- Display dates in the Jalali calendar using YYYY/MM/DD.
- Display the correct Persian weekday for each date.
- Handle Latin identifiers, PGDS codes, and time ranges with suitable LTR isolation.
- Preserve identifiers exactly, including leading zeros.
- Accept Persian and English digits in appropriate form fields and normalize them safely for validation.
- Do not modify stored identifiers merely for visual formatting.
- Use horizontally scrollable tables with sticky headers and identifying columns.
- Communicate statuses with text or icons as well as color.
- Provide loading, empty, error, validation, success, and unsaved-change states.
- Require confirmation before destructive deletion.

Main navigation labels:
- داشبورد
- داده‌های بار شبکه
- محدودیت‌های زمانی خاموشی
- محدودیت‌های هم‌زمانی فیدرها
- محاسبه برنامه هفتگی
- مشاهده برنامه خاموشی

3. CORE DOMAIN SEPARATION

The application has three independent input categories:

1. Network load data.
2. Feeder temporal outage constraints.
3. Feeder simultaneous and non-simultaneous outage constraints.

The final weekly outage schedule is calculated by the backend.

The temporal constraint spreadsheet is not the final outage schedule. Do not display an imported constraint code as a confirmed outage event.

The frontend is responsible for:
- Importing and displaying data.
- Manual entry and editing.
- Preliminary validation.
- Sending calculation requests.
- Showing backend validation messages.
- Displaying and filtering calculated schedules.

4. NETWORK LOAD DATA PAGE

Allow users to:
- Upload an Excel file.
- Select a worksheet.
- Preview the extracted records.
- Map source columns to expected fields when necessary.
- Review validation errors before committing the import.
- Save imported data.
- Add records manually.
- Edit and delete existing records.
- Search and filter stored records.

The expected Excel columns records.

The expected Excel columns must preserve these exact Persian names:

نام بهره بردار
نوعگاه
کد PGDS ایستگاه
نوع تجهیز
تجهیز
کد PGDS تجهیز
نوع انرژی
تاریخ
H1
H2
H3
H4
H5
H6
H7
H8
H9
H10
H11
H12
H13
H14
H15
H16
H17
H18
H19
H20
H21
H22
H23
H24
مجموع

Requirements:
- Store PGDS codes as strings.
- Preserve leading zeros.
- Validate H1 through H24 as numeric values.
- Do not treat an empty cell as zero.
- Show the calculated sum of H1 through H24 for verification.
- If the imported total differs from the calculated total, show a warning and preserve the original value until the user explicitly resolves the discrepancy.
- Do not assume the measurement unit is MW or any other unit. Use source metadata when available.
- Preserve H1 through H24 as provided. Do not assign a specific hourly interpretation until the backend contract defines it.
- Support filtering by date, operator, station, equipment, and energy type.
- Provide a manual-entry form with basic metadata and 24 hourly inputs.
- Report import errors with worksheet, row, column, and explanation.
- Identify potentially duplicate records and let the user choose an explicit import policy before saving.

 and let the user choose an explicit import policy before saving.

5. TEMPORAL OUTAGE multi-level column headers.

The first four columns are:

ردیف
پست فوق توزیع (طبق GIS)
نام فیدر
کد فیدر

Each date then contains these seven time slots:

10_12
12_14
14_16
16_18
18_20
20_22
22_24

An example week is:
1405/06/21 through 1405/06/27

Read dates from the uploaded file. Do not hardcode the example dates into application logic.

Spreadsheet structure:
- The upper header row contains dates.
- A date may be in a merged cell spanning seven time-slot columns.
- The next header row contains feeder metadata columns and repeated time-slot labels.
- Each temporal cell contains an integer constraint code from 0 through 6.

Excel parsing requirements:
- Handle merged date headers and multi-row headers.
- Associate each time-slot column with the correct date.
- Normalize imported constraints into records containing:
  feederId
  feederCode
  feederName
  substationName
  date
  startTime
  endTime
  constraintCode
- Support 24:00 as the end of a day. If converted to a timestamp, it corresponds to 00:00 on the next day.
- Do not silently convert blank cells to code 0. Mark them as missing data.
- Reject codes outside the integer range 0 through 6.

There are SEVEN constraint states. Use these exact Persian labels and meanings:

Code 0:
Label::

Code 0:
Label: آزاد
Meaning: The feeder may be on or off during:
Label: حتماً وصل
Meaning: An outage is prohibited during this time slot.

Code 2:
Label: ساعت ثابت مشروط
Meaning: If the feeder has an outage on that day, the outage may occur only in the designated time slot. An outage is not mandatory.

Code 3:
Label: حتماً قطع
Meaning: The feeder must be off during this time slot.

Code 4:
Label: رزرو/کم‌تکرار
Meaning: An outage is allowed, but this feeder should preferably be selected only when needed. This is a preference, not a prohibition.

Code 5. This is a preference, not a prohibition.

Code 5:
Label: بلوک پی for the same feeder on the same day form a block. All slots in that block must be off together or remain on together. Separate blocks and blocks on different days are independent.

Code 6:
Label: چند ساعت مجاز مشروط
Meaning: If the feeder has an outage on that day, only one of the time slots marked with code 6 may be selected. An outage is not mandatory.

UI requirements:
- A feeder-by-date-and-time matrix.
- A single-day view and a-by-date-and-time matrix.
- A single-day view and a full-week view.
- Search Cell editing through a constraint-code selector.
- Multi-cell selection and bulk code assignment.
- A persistent legend- Multi-cell selection and bulk code assignment.
- A persistent legend showing the seven codes, Persian cells.
- Manual creation of constraints for a feeder, date, and time slot.
- Manual addition of a missing feeder using its name and code.
- Saving and reloading edited data.

Flag ambiguous or conflicting patterns, such as multiple code-2 slots for the same feeder on the same day. Do not invent precedence between conflicting rules. Final interpretation and feasibility validation belong to the backend.

Show the following USSD-origin explanations in a Persian help panel:

0:
فیدرهای انعطاف‌پذیر با حضور منظم و بدون الگوی ساعت محدودکننده

1:
فیدر بدون خاموشی؛ یا ساعات خارج از پنجره مجاز فیدرهای خاص

2:
حداقل ۲ مشاهده و همه خاموشی‌ها فقط در یک بازه ثابت

3:
از USSD خودکار تولید نشده؛ داده تاریخی به‌تنهایی اجبار را ثابت نمی‌کند

4:
فیدرهایی که فقط ۱ تا ۳ روز در هفته دیده شده‌اند و ساعت ثابت قطعی ندارند

5:
خاموشی‌های چندبازه‌ای پشت‌سرهم مثل ۱۰ تا ۱۶

6:
حداقل ۴ روز خام۱۰ تا ۱۶

6:
حداقل ۴ روز خاموشی و ت Automatic extraction from USSD is outside the scope of this frontend.

6. FEEDER IDENTITY AND EQUIPMENT MAPPING

Use stable internal feeder IDs and feeder codes for relationships. Do not rely only on feeder names.

Do not assume that “کد PGDS تجهیز” equals “کد فیدر”.

Provide an equipment-to-feeder mapping interface when required:
- Show equipment name and PGDS code.
- Allow selection of the corresponding feeder.
- Highlight unmapped and ambiguous records.
- Save confirmed mappings.

Name matching may provide suggestions, but ambiguous matches must not be committed automatically.

7. SIMULTANEOUS AND NON-SIMULTANEOUS CONSTRAINTS PAGE

Allow users to import an Excel file or enter relationships manually.

The Excel columns are exactly:

Feeder Name
At the Same Time
Not the Same Time

Import behavior:
- “Feeder Name” identifies the base feeder.
- “At the Same Time” contains feeders that must share the base feeder’s outage status.
- “Not the Same Time” contains feeders that must not be off at the same time as the base feeder.
- Relationship cells may contain one or multiple feeder names.
- Provide a selectable separator for multiple names, such as comma, Persian comma, semicolon, or newline.
- Preview extracted relationships before saving.
- Resolve imported names to registered feeders.
- Highlight unknown or ambiguous names.
- Store relationships using feeder IDs.

Manual-entry form:
- Searchable base-feeder selector using name or code.
- Multi-select field labeled “قطع هم‌زمان”.
- Multi-select field labeled “عدم قطع هم‌زمان”.
- Selected feeders displayed as removable tags.
- Create, edit, and delete actions.

Relationship semantics:
- Simultaneous: related feeders must have the same outage status in each time interval. This relationship does not by itself require any outage.
- Non-simultaneous: related feeders must not have overlapping outage intervals.
- Relationships are pairwise and symmetric.
- A reversed duplicate must not create a second record.
- Two feeders that each have a non-simultaneous relationship with the same base feeder do not automatically have a non-simultaneous relationship with each other.

Validation:
- Reject self-relations.
- Reject assigning both relationship types to the same feeder pair.
- Identify contradictions between a simultaneous group and a non-simultaneous relationship.
- Delegate final feasibility validation to the backend.
- Display backend conflict messages in clear Persian.

8. WEEKLY CALCULATION PAGE

Provide:
- A Jalali start-date picker.
- A preview of the seven consecutive dates beginning with the selected date.
- Selection of a network load dataset.
- Selection of a temporal-constraint dataset.
- Selection of a feeder-relationship dataset.
- A summary of feeder counts, date coverage, and missing data.
- Equipment-to-feeder mapping status.
- A button labeled “بررسی داده‌ها”.
- A button labeled “محاسبه برنامه هفتگی”.

Send calculation requests to the backend through the service layer.

Include the exact dataset IDs or versions used in each request so that a result remains traceable to its inputs.

Support these calculation states with Persian labels:
- Ready to submit.
- Queued.
- Running.
- Completed.
- Failed.
- Infeasible because of conflicting constraints.

Only display percentage progress when the backend actually provides it.

For infeasible calculations, display the backend explanation with the affected feeder, date, interval, and constraint where available.

After completion:
- Open the result associated with that specific calculation run.
- Keep previous runs accessible.
- Show the input dataset versions associated with each run.

Do not invent technical optimization parameters, capacity targets, or objective values that have not been specified. Keep the form extensible for future backend-defined parameters.

9. OUTAGE SCHEDULE VIEWER

Each output event must contain at least:
- Feeder ID.
- Feeder name.
- Feeder code.
- Substation.
- Date.
- Weekday.
- Start time.
- End time.
- Calculation run ID.

Implement three primary viewing modes.

A. View by feeder

The user selects a feeder, for example “ابوذر”.

Show:
روز هفته | تاریخ | ساعت شروع | ساعت پایان

B. View by day

The user selects a date.

Show:
نام فیدر | کد فیدر | پست فوق توزیع | ساعت شروع | ساعت پایان

C. View by time

The user selects a time interval, for example 10:00–12:00.

Show:
نام فیدر | کد فیدر | روز هفته | تاریخ | ساعت شروع | ساعت پایان

Time filtering 16:00 must appear when equality.
For example, an outage from 10:00 to 16:00 must appear when filtering for 12:00 to 14:00.
Use half-open interval semantics so adjacent intervals do not falsely overlap.

Shared functionality:
- Combined filters for feeder, date, time interval, and substation.
- Feeder name and code search.
- Sorting.
- Clear-all-filters action.
- Result count.
- Excel export of the current filtered result.
- A print-friendly view.
- A weekly matrix view alongside the table view.
- A color legend and clickable cells that open event details.

Consecutive outage intervals for the same feeder on the same day may be merged for display without modifying the raw backend output.

Clearly distinguish:
- No calculation has been completed.
- No results are available.
- The completed schedule contains no outages.
- No events match the current filters.

If inputs change after a calculation, label the previous result:
“مربوط به نسخه قبلی داده‌ها”

10. PERSISTENCE AND API ARCHITECTURE

Define TypeScript models for:
- Feeder
- LoadRecord
- TemporalConstraint
- FeederRelation
- EquipmentFeederMapping
- Dataset
- ImportReport
- ScheduleRun
- OutageEvent

Prepare a proposed, replaceable API contract for:
- Feeder management.
- Load data import and CRUD.
- Temporal constraint import and CRUD.
- Feeder relationship import and CRUD.
- Equipment-to-feeder mappings.
- Dataset validation.
- Calculation submission.
- Calculation status retrieval.
- Result retrieval and filtering.

Include the original uploaded file, filename, upload time, dataset type, and dataset version in the storage design.

Production persistence of uploaded files and records belongs to the actual backend.

Until the backend is available:
- Implement a replaceable mock service.
- Persist imported files, sample data, and manual changes in IndexedDB.
- Ensure refreshing the browser does not erase saved demonstration data.
- Clearly label demonstration mode as “داده آزمایشی”.
- Explain in Persian that demonstration data is stored in the current browser.
- Treat mock calculation results only as UI examples.
- Never present a mock result as a valid optimized operating schedule.
- Never present a mock result as a valid optimized operating schedule.
- Connect functional buttons and operation succeeds.

11. DASHBOARD

Provide a concise operational dashboard showing:
- Number of registered feeders.
- Number of saved load datasets.
- Date coverage of temporal constraints.
- Number of simultaneous and non-simultaneous relationships.
- Missing or unmapped records.
- Latest calculation status.
- Quick links to import data, manage constraints, and view the latest schedule.

All figures must come from the active service adapter. Avoid decorative metrics with fabricated values.

12. SAMPLE DATA AND ACCEPTANCE CRITERIA

Provide a coherent demonstration dataset containing:
- Multiple feeders, including “آجین” and “ابوذر”.
- A sample week from 1405/06/ sample week from 1405/06/21 through 1405/06/27.
- Simultaneous and non-simultaneous relationships.
- A clearly labeled illustrative weekly result.

Keep examples of different rules internally consistent. Any deliberate invalid example must be isolated and explicitly identified as a validation example.

Acceptance criteria:
- All three Excel input types support upload, preview, validation, and save.
- All three data categories support manual entry, editing, and deletion.
- Multi-level and merged date headers are parsed correctly.
- Saved demonstration data survives a browser refresh.
- Feeder relationships are validated.
- Calculation submission and status are managed through the service layer.
- Selecting “ابوذر” displays its dates and outage hours.
- Selecting a date displays feeders and their outage hours.
- Selecting a time interval displays matching feeders and dates.
- Combined filters work.
- Excel export reflects the active filters.
- Loading, empty, error, and success states work.
- Critical logic is verified, including merged-header date extraction, preservation of leading zeros, and time-overlap filtering.
- The application builds and runs successfully with Next.js.

DELIVERABLES

Produce:
- Complete, runnable Next.js frontend source code.
- Organized App Router routes and project structure.
- Reusable UI components.
- TypeScript domain models.
- Excel parsing and export utilities.
- A persistent mock service.
- A replaceable HTTP service adapter.
- A short README explaining setup, execution, demonstration limitations, and backend integration.

Keep implementation identifiers and code in English where appropriate, but ensure the entire user-facing website is Persian and RTL.
```