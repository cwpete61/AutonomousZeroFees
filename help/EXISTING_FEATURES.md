# ✅ Existing Features

This document details the core capabilities currently active in the Orbis Outreach platform.

## 1. The Scout Agent (Discovery Engine)
The **Scout Agent** is a Playwright-driven autonomous worker that:
- **Searches**: Scours Google and business directories for leads based on your Niche/Geography.
- **Audits**: Inspects target transaction signals and payment friction.
- **Scores**: Assigns a "Profit Gap Score," identifying businesses overpaying in credit card fees.
- **Enriches**: Extracts owner names, business emails, and social media profiles.

## 2. Multi-LLM Brain (AI Services)
The system is "Engine Agnostic," allowing operators to choose their preferred AI intelligence:
- **Anthropic Logic**: Claude 3.5 Sonnet for nuanced, conversational copywriting.
- **OpenAI Logic**: GPT-4o for high-speed template generation and structured data auditing.
- **Dynamic Selection**: Switch engines per campaign or diagnostic run via the Dashboard.

## 3. Social & Discovery Integrations
The API Hub now supports:
- **LinkedIn (B2B)**: Automated connection requests and InMail.
- **Facebook & Instagram**: Lead engagement via business direct messaging.
- **Google Places**: High-precision local business discovery.
- **Twilio**: SMS and Voice follow-up automation.

## 4. AutoWriteEmail™
- **Hyper-Personalization**: Instead of broad templates, the AI uses specific signals (e.g., "Your Interchange setup is inefficient") to write individual emails.
- **Sequence Generation**: Automatically builds 3-5 step sequences with follow-up delays.
- **Tone Control**: Support for multiple outreach styles (Friendly, Professional, Aggressive).

## 5. Multi-URL Diagnostic Environment
- **Targeted Injection**: Bypass the scraper to test specific URLs immediately.
- **Batch Support**: Paste a list of competitor or client URLs to see how the Scout Agent handles them in parallel.
- **Safety**: Uses a dedicated `SYSTEM_DIAGNOSTIC_CAMPAIGN` to keep test data separate from live pipelines.

## 5. Dashboard Command Center
- **Pipeline View**: Drag-and-drop kanban board for moving leads through the sales cycle.
- **Job Queue**: Live view of BullMQ workers executing audits and research.
- **System Tab**: Access to global configurations, diagnostic tools, and AI engine selection.
