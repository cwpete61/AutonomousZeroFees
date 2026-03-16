# AutoWriteEmail Feature Documentation

The **AutoWriteEmail** feature is a core component of the Autonomous Web Agency's outreach engine. It enables automated lead discovery, qualification, and high-converting email sequence generation.

## 1. Feature Overview
The AutoWriteEmail feature streamlines the sales pipeline by automating the most time-consuming parts of outreach:
- **Scouting**: Automatically finding local businesses in specified niches and locations.
- **Evaluation**: Using AI to analyze their current digital presence (website, SEO, performance).
- **Email Generation**: Using Claude AI to craft personalized 3-5 step email sequences based on discovered "pain points."

## 2. Implementation Details

### Activation & Entry Points
- **Campaign Wizard**: Triggered via the **"+ New Campaign"** button in the dashboard.
- **Email Sequence Designer**: Triggered via **"✉️ New Email Sequence"** in the Email Campaigns tab.

### Data Scraping & Scouting (Scout Agent)
The system uses a specialized **Scout Agent** (`packages/agents/scout-agent/scout-agent.js`) for the discovery process:
1. **Target Identification**: Scrapes public business data based on `Industry` and `Geography`.
2. **Analysis**: Evaluates the business website for issues like mobile responsiveness, load speed, and SEO gaps.
3. **Qualification**: Assigns a `qualityScore`. Leads with scores below 65 are prioritized for outreach as high-potential targets.

### AI Lead & Email Generation
The email generation logic is handled by the **AiService** (`apps/api/src/modules/ai/ai.service.ts`) and the **Email Writing Agent**:
1. **Input Parameters**:
   - `industry`: Target sector (e.g., HVAC, Dental).
   - `pain_point_signal`: Specific issue found during scouting.
   - `primary_outcome`: Desired transformation (e.g., "more leads from Google").
2. **Claude AI Integration**:
   - Uses the `claude-sonnet-4-20250514` model.
   - Generates a sequence of 3 to 5 multi-step follow-up emails.
   - **Variables Support**: Supports dynamic tokens like `{{first_name}}`, `{{business_name}}`, and `{{city}}`.

## 3. Technical Specifications

### Integration Points
- **Frontend**: React-based dashboard (`apps/dashboard/web-agency-dashboard.jsx`) with real-time AI generation previews.
- **Backend**: NestJS API modules (`/ai`, `/campaigns`, `/leads`, `/email-sequences`).
- **Storage**: Prisma DB stores campaigns, leads, and generated sequences.
- **Work Queue**: BullMQ manages the asynchronous research and outreach jobs.

### Configuration
- **API Keys**: Requires `ANTHROPIC_API_KEY` for Claude and optional SEO/Hunter keys for enrichment.
- **Target Rates**: Defaults to a standard outreach velocity of ~85 emails/hr.

## 4. Security & Privacy
- **Encryption**: All API keys are stored in a secure local vault and only transmitted directly to service providers.
- **Master Sync**: A kill-switch (`orbis_master_sync`) allows administrators to take the entire automated system offline instantly.
- **Rate Limiting**: Automated scraping respects `robots.txt` and implements delays to prevent blacklisting.
