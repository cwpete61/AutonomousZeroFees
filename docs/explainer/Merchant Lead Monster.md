# Merchant Lead Monster  
## Orbis Outreach Migration — Engineering Specification for Antigravity

Merchant Lead Monster is an intelligence-driven merchant acquisition platform that identifies businesses processing credit cards, estimates their transaction volume and fee burden, predicts response likelihood, and launches personalized outreach campaigns that drive merchants to a savings calculator and appointment booking workflow.

The system replaces the **weak-website discovery thesis** of the original Orbis Outreach platform with a **merchant processing intelligence thesis** while preserving the core architecture.

---

# 1. System Purpose

The platform automatically identifies businesses that:

- accept credit cards
- process significant transaction volume
- are likely to respond to outreach

Then it generates **personalized outreach based on scraped business signals** and drives merchants to a **savings calculator + appointment booking flow**.

---

# 2. System Architecture Overview

                    INTERNET DATA SOURCES

┌──────────────────────────────────────────────────────────────┐
│ │
│ Google Business Profiles Websites Social Media │
│ │ │ │ │
│ └───────────────┬────────┴───────────────┘ │
│ │ │
│ Merchant Discovery Agent │
│ │ │
│ Signal Extraction Engine │
│ │ │
│ Merchant Intelligence Model Layer │
│ │ │
│ Personalization Profile Builder │
│ │ │
│ Opportunity Scoring Engine │
│ │ │
│ Outreach Generation │
│ │ │
│ Savings Calculator Page │
│ │ │
│ Appointment Booking │
│ │ │
│ Sales Conversion │
│ │
└──────────────────────────────────────────────────────────────┘


---

# 3. Core Platform Stack

The system maintains the existing Orbis Outreach architecture.

### Frontend


Next.js


Applications:


apps/dashboard
apps/marketing


Dashboard:

- merchant intelligence console
- opportunity ranking
- campaign management
- sales pipeline

Marketing site:

- merchant savings messaging
- calculator entry point
- booking funnel

---

### Backend API


NestJS


Responsibilities:

- authentication
- merchant intelligence data
- scoring
- outreach orchestration
- calculator
- appointment booking
- campaign management

---

### Data Layer


PostgreSQL
Prisma ORM


Stores:

- businesses
- merchant profiles
- extracted signals
- scoring results
- outreach campaigns
- calculator sessions
- appointment records

---

### Queue System


Redis
Bull Queues


Handles asynchronous jobs:

- discovery
- signal extraction
- scoring
- personalization
- outreach
- follow-ups

---

### Worker Runtime


NestJS workers


Runs background processors for intelligence models and outreach tasks.

---

### Infrastructure


Docker Compose


Services:


nginx
postgres
redis
api
workers
dashboard
marketing
backup-runner


---

# 4. System Pipeline


┌───────────────────────────┐
│ 1 Merchant Discovery │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 2 Signal Extraction │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 3 Processing Probability │
│ Model │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 4 Transaction Volume │
│ Model │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 5 Response Likelihood │
│ Model │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 6 Personalization Profile │
│ Builder │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 7 Opportunity Score │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 8 Outreach Engine │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 9 Savings Calculator │
└─────────────┬─────────────┘
│
▼
┌───────────────────────────┐
│ 10 Appointment Booking │
└───────────────────────────┘


---

# 5. Merchant Intelligence Models

The platform uses three predictive models.

---

# 5.1 Merchant Processing Probability Model

This model predicts whether a business accepts credit cards.

### Signals


payment scripts
POS integrations
checkout systems
booking systems
review volume
industry classification
pricing indicators


### Output


processing_probability


Score range:


0 – 1


Example:

| Score | Meaning |
|------|--------|
|0.90|Almost certain|
|0.70|Very likely|
|0.50|Possible|
|0.30|Unlikely|

Threshold example:


processing_probability > 0.65


---

# 5.2 Transaction Volume Prediction Model

This model estimates annual credit card volume.

### Inputs


industry benchmarks
review velocity
pricing signals
staff size
locations count
service catalog size
booking capacity


### Output


estimated_annual_card_volume
estimated_monthly_card_volume


### Fee Estimate


processing_cost = volume × rate


Typical range:


2.5% – 3.2%


---

# 5.3 Response Likelihood Model

This model predicts the probability a business owner will respond.

### Signals


website quality
SEO signals
social media activity
advertising activity
growth signals
competition density


### Output


response_likelihood


Score range:


0 – 1


---

# 6. Combined Opportunity Score

Final ranking formula:


opportunity_score =
(processing_probability × 0.4)
+
(transaction_volume_score × 0.4)
+
(response_likelihood × 0.2)


Merchants are ranked by opportunity score.

---

# 7. Personalization Data Sources

Outreach is personalized using publicly available data.

---

## Google Business Profile

Extracted attributes:


categories
review count
review velocity
photos
services
business hours
popular times
customer keywords


---

## Website Signals

Scraped elements:


payment processors
pricing pages
service lists
appointment booking
team size
locations
product catalog


---

## Social Media Signals

Platforms detected:


Facebook
Instagram
LinkedIn
TikTok
YouTube


Extracted signals:


posting frequency
engagement
promotions
expansion announcements
hiring posts


---

# 8. Personalization Profile

Each merchant receives a structured profile.


{
business_name
industry
city
review_highlights
pricing_examples
services_detected
payment_processors
booking_system
marketing_activity
growth_signals
estimated_volume
estimated_processing_fees
}


---

# 9. Personalized Outreach Generation

Messages reference actual merchant signals.

Example:


While reviewing your clinic’s website we noticed you offer
online appointment scheduling and patients frequently mention
quick service in your Google reviews.

Clinics with similar activity typically process around
$1.5M annually in card payments.


Then the message introduces the savings offer.

---

# 10. Savings Calculator

Merchants are directed to a personalized calculator.

Inputs:


estimated monthly volume
average ticket
current processing rate


Outputs:


monthly processing fees
annual processing fees
estimated savings


Fields are pre-populated from scraped signals.

---

# 11. Worker Queue Pipeline


merchant-discovery
signal-extraction
processing-probability-model
volume-prediction-model
response-likelihood-model
personalization-builder
opportunity-ranking
savings-scenario-generator
merchant-outreach
calculator-event-tracking
appointment-followup


---

# 12. Dashboard Layout

Dashboard evolves into a merchant intelligence console.

---

## Opportunity Command Center

Displays:


top opportunities
estimated annual fee exposure
reply likelihood
recent campaign performance


---

## Merchant Detail Page

Displays:


business signals
payment evidence
review insights
volume estimates
processing fee estimate
outreach history


---

## Scoring Panel

Shows:


processing_probability
transaction_volume_estimate
response_likelihood
opportunity_score
reason_codes


---

# 13. Sales Pipeline


Discovered
Contacted
Engaged
Calculator Used
Booked Appointment
Proposal Sent
Closed


---

# 14. Antigravity Folder Structure


apps/
api/
modules/
businesses
merchant-profiles
signals
scoring
personalization
savings-scenarios
calculator
campaigns
appointments
onboarding

workers/
processors/
merchant-discovery
signal-extraction
scoring
personalization
outreach
calculator
followups

dashboard/
marketing/

packages/
agents/
discovery-agent
intelligence-agent
personalization-agent
outreach-agent

services/
scoring-service
fee-estimation-service
calculator-service
outreach-service

db/
orchestrator/
events/
utils/
config/


---

# 15. Deployment Diagram

            ┌───────────────┐
            │    NGINX      │
            └───────┬───────┘
                    │
    ┌───────────────┴───────────────┐
    │                               │

Next.js Dashboard Marketing Site
│ │
└───────────────┬───────────────┘
│
NestJS API
│
┌──────────────┴──────────────┐
│ │
Redis Queue PostgreSQL
│ │
│ Prisma ORM
│
NestJS Workers
│
Merchant Intelligence Pipeline


---

# 16. System Outcome

Merchant Lead Monster becomes an intelligence platform that:


identifies merchants accepting cards
estimates transaction volume
predicts response likelihood
extracts business intelligence
generates personalized outreach
presents a savings calculator
prioritizes high-value opportunities
automates merchant acquisition


The system evolves from **automated web sales** into a **merchant opportunity intelligence network**.