'use client';

import React, { useState, useEffect } from 'react';
import { campaignsApi, leadsApi, emailSequencesApi, agentsApi, settingsApi, diagnosticsApi, aiApi, authApi, usersApi } from './src/lib/api';
import { RBAC } from './src/lib/rbac';

const PIPELINE_STAGES = [
  { id: 'lead_inbox', label: 'Lead Inbox', color: '#94a3b8' },
  { id: 'discovered', label: 'Discovered', color: '#6366f1' },
  { id: 'qualified', label: 'Qualified', color: '#8b5cf6' },
  { id: 'outreach_sent', label: 'Outreach Sent', color: '#a855f7' },
  { id: 'replied', label: 'Replied', color: '#f59e0b' },
  { id: 'demo_sent', label: 'Demo Sent', color: '#f97316' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: '#06b6d4' },
  { id: 'paid', label: 'Paid', color: '#22c55e' },
  { id: 'building', label: 'Building', color: '#14b8a6' },
  { id: 'delivered', label: 'Delivered', color: '#10b981' },
];

const SAMPLE_LEADS = [
  { id: 10, name: 'Main St Dental', industry: 'Dentistry', city: 'Miami, FL', score: 15, stage: 'lead_inbox', website: 'mainstdental.com' },
  { id: 11, name: 'Golden Gate Auto', industry: 'Auto Repair', city: 'San Francisco, CA', score: 22, stage: 'lead_inbox', website: 'ggauto.com' },
  { id: 1, name: 'Pro Plumbing Co', industry: 'Plumbing', city: 'Austin, TX', score: 32, stage: 'discovered', website: 'proplumbing.com' },
  { id: 2, name: 'Elite HVAC Services', industry: 'HVAC', city: 'Dallas, TX', score: 45, stage: 'discovered', website: 'elitehvac.net' },
  { id: 3, name: 'Sunrise Landscaping', industry: 'Landscaping', city: 'Phoenix, AZ', score: 28, stage: 'discovered', website: 'sunriselandscape.com' },
  { id: 4, name: 'Best Roofing LLC', industry: 'Roofing', city: 'Denver, CO', score: 38, stage: 'outreach_sent', website: 'bestroofingco.com' },
  { id: 5, name: 'Apex Electric', industry: 'Electrical', city: 'Miami, FL', score: 41, stage: 'outreach_sent', website: 'apexelectric.net' },
  { id: 6, name: 'Green Landscaping', industry: 'Landscaping', city: 'Portland, OR', score: 52, stage: 'replied', website: 'greenlandscaping.com' },
  { id: 7, name: 'Diamond Cleaning', industry: 'Cleaning', city: 'Seattle, WA', score: 67, stage: 'demo_sent', website: 'diamondclean.com' },
  { id: 8, name: 'Sparkle Cleaning', industry: 'Cleaning', city: 'Chicago, IL', score: 89, stage: 'paid', website: 'sparklecleaning.com' },
  { id: 9, name: 'Summit Roofing', industry: 'Roofing', city: 'Nashville, TN', score: 78, stage: 'building', website: 'summitroofing.com' },
];

const INITIAL_AGENTS = [
  { name: 'Scout Agent', status: 'active', lastRun: '2 min ago', processed: 47 },
  { name: 'Outreach Agent', status: 'active', lastRun: '5 min ago', processed: 23 },
  { name: 'Design Preview', status: 'idle', lastRun: '1 hr ago', processed: 8 },
  { name: 'Sales Close', status: 'active', lastRun: '12 min ago', processed: 5 },
  { name: 'Web Build', status: 'building', lastRun: '30 min ago', processed: 3 },
  { name: 'Client Success', status: 'idle', lastRun: '2 hr ago', processed: 12 },
  { name: 'Content Agent', status: 'idle', lastRun: '45 min ago', processed: 15 },
  { name: 'Error Agent', status: 'monitoring', lastRun: 'always', processed: 0 },
  { name: 'Code Agent', status: 'idle', lastRun: '1 hr ago', processed: 6 },
  { name: 'Email Writing Agent', status: 'active', lastRun: 'Now', processed: 0 },
  { name: 'Onboarding Agent', status: 'active', lastRun: 'Now', processed: 0 },
  { name: 'Finance Agent', status: 'idle', lastRun: 'Now', processed: 0 },
  { name: 'SEO Audit Agent', status: 'active', lastRun: 'Now', processed: 0 },
  { name: 'Nurture Agent', status: 'active', lastRun: 'Now', processed: 0 },
];

const INITIAL_CRM_CLIENTS = [
  {
    id: 'c1', name: 'Sparkle Cleaning', contact: 'Maria Garcia', email: 'maria@sparklecleaning.com', phone: '(312) 555-8821', industry: 'Cleaning', city: 'Chicago, IL', website: 'sparklecleaning.com', score: 89, stage: 'delivered', outreachAt: '2026-02-02', repliedAt: '2026-02-04', paidAt: '2026-02-08', deliveredAt: '2026-02-15', invoiceId: 'INV-1001', amount: 2994, paymentMethod: 'Stripe', paymentStatus: 'paid', pagespeedScore: 45, gtmetrixScore: 52, pingdomScore: 88, engagementScore: 92, emailOpenRate: 88, demoViewTime: 15, replyVelocity: 2, conversionVelocity: 8, churnRisk: 5, readinessFactor: 100, monthlyLeadProjection: 52, roiFactor: 5.8, automationSavings: 34, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-01', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-01', action: 'Auto-qualified: Score 89/100', type: 'system' }, { date: '2026-02-02', action: 'Cold email sent via Resend', type: 'email' }, { date: '2026-02-03', action: 'SMS outreach sent (Twilio)', type: 'sms' }, { date: '2026-02-04', action: 'Maria replied: "Interested, show me more"', type: 'reply' }, { date: '2026-02-05', action: 'Blurred mockup sent via email', type: 'email' }, { date: '2026-02-05', action: 'Maria viewed demo (2m 34s)', type: 'engagement' }, { date: '2026-02-06', action: 'Voice follow-up call (AI script)', type: 'call' }, { date: '2026-02-06', action: 'Proposal generated: $2,994', type: 'system' }, { date: '2026-02-06', action: 'Stripe invoice sent', type: 'payment' }, { date: '2026-02-08', action: 'Payment received: $2,994', type: 'payment' }, { date: '2026-02-09', action: 'Web Build Agent started', type: 'system' }, { date: '2026-02-15', action: 'Website delivered & live', type: 'delivery' }
    ]
  },
  {
    id: 'c2', name: 'Summit Roofing', contact: 'Jake Williams', email: 'jake@summitroofing.com', phone: '(615) 555-3390', industry: 'Roofing', city: 'Nashville, TN', website: 'summitroofing.com', score: 78, stage: 'building', outreachAt: '2026-02-11', repliedAt: '2026-02-14', paidAt: '2026-02-18', deliveredAt: null, invoiceId: 'INV-1002', amount: 3494, paymentMethod: 'Stripe', paymentStatus: 'paid', pagespeedScore: 82, gtmetrixScore: 76, pingdomScore: 99, engagementScore: 85, emailOpenRate: 75, demoViewTime: 8, replyVelocity: 5, conversionVelocity: 14, churnRisk: 12, readinessFactor: 85, monthlyLeadProjection: 38, roiFactor: 4.2, automationSavings: 18, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-10', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-11', action: 'Email + LinkedIn DM sent', type: 'email' }, { date: '2026-02-14', action: 'Jake replied via LinkedIn', type: 'reply' }, { date: '2026-02-15', action: 'Demo mockup delivered', type: 'system' }, { date: '2026-02-16', action: 'Proposal sent: $3,494', type: 'system' }, { date: '2026-02-18', action: 'Payment received: $3,494', type: 'payment' }, { date: '2026-02-20', action: 'Web Build Agent started', type: 'system' }
    ]
  },
  {
    id: 'c3', name: 'Diamond Cleaning', contact: 'Lisa Park', email: 'lisa@diamondclean.com', phone: '(206) 555-7712', industry: 'Cleaning', city: 'Seattle, WA', website: 'diamondclean.com', score: 67, stage: 'proposal_sent', outreachAt: '2026-02-19', repliedAt: '2026-02-22', paidAt: null, deliveredAt: null, invoiceId: 'INV-1003', amount: 2494, paymentMethod: null, paymentStatus: 'pending', engagementScore: 65, emailOpenRate: 60, demoViewTime: 5, replyVelocity: 3, conversionVelocity: 18, churnRisk: 25, readinessFactor: 45, monthlyLeadProjection: 28, roiFactor: 3.5, automationSavings: 12, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-18', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-19', action: 'Cold email sent', type: 'email' }, { date: '2026-02-22', action: 'Lisa replied: "What does this cost?"', type: 'reply' }, { date: '2026-02-23', action: 'Mockup + pricing sent', type: 'email' }, { date: '2026-02-25', action: 'Proposal sent: $2,494', type: 'system' }, { date: '2026-02-25', action: 'Stripe invoice sent — awaiting payment', type: 'payment' }
    ]
  },
  {
    id: 'c4', name: 'Green Landscaping', contact: 'Tom Chen', email: 'tom@greenlandscaping.com', phone: '(503) 555-4488', industry: 'Landscaping', city: 'Portland, OR', website: 'greenlandscaping.com', score: 52, stage: 'replied', outreachAt: '2026-02-26', repliedAt: '2026-03-01', paidAt: null, deliveredAt: null, invoiceId: null, amount: null, paymentMethod: null, paymentStatus: null, engagementScore: 45, emailOpenRate: 40, demoViewTime: 2, replyVelocity: 4, conversionVelocity: 25, churnRisk: 40, readinessFactor: 20, monthlyLeadProjection: 15, roiFactor: 1.8, automationSavings: 5, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-25', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-26', action: 'Email + Facebook DM sent', type: 'email' }, { date: '2026-03-01', action: 'Tom replied: "Send me info"', type: 'reply' }
    ]
  },
  {
    id: 'c5', name: 'Best Roofing LLC', contact: 'Dan Miller', email: 'dan@bestroofingco.com', phone: '(720) 555-1199', industry: 'Roofing', city: 'Denver, CO', website: 'bestroofingco.com', score: 38, stage: 'outreach_sent', outreachAt: '2026-03-02', repliedAt: null, paidAt: null, deliveredAt: null, invoiceId: null, amount: null, paymentMethod: null, paymentStatus: null, engagementScore: 20, emailOpenRate: 15, demoViewTime: 0, replyVelocity: 0, conversionVelocity: 30, churnRisk: 70, readinessFactor: 5, monthlyLeadProjection: 10, roiFactor: 1.2, automationSavings: 2, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-03-01', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-03-02', action: 'Cold email sent', type: 'email' }, { date: '2026-03-04', action: 'Follow-up #1 sent', type: 'email' }
    ]
  },
  {
    id: 'c6', name: 'Apex Electric', contact: 'Rosa Diaz', email: 'rosa@apexelectric.net', phone: '(305) 555-6644', industry: 'Electrical', city: 'Miami, FL', website: 'apexelectric.net', score: 41, stage: 'outreach_sent', outreachAt: '2026-03-03', repliedAt: null, paidAt: null, deliveredAt: null, invoiceId: null, amount: null, paymentMethod: null, paymentStatus: null, engagementScore: 18, emailOpenRate: 12, demoViewTime: 0, replyVelocity: 0, conversionVelocity: 32, churnRisk: 75, readinessFactor: 2, monthlyLeadProjection: 8, roiFactor: 1.1, automationSavings: 1, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-03-02', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-03-03', action: 'Email + Instagram DM sent', type: 'email' }
    ]
  },
];

const INITIAL_CAMPAIGNS = [
  { id: 'cp1', name: 'Miami Dental Outreach', niche: 'Medical', services: ['Dentistry'], geography: { state: 'Florida', county: 'Miami-Dade', city: 'Miami' }, leads: 42, sent: 30, replies: 5, status: 'active', color: '#6366f1' },
  { id: 'cp2', name: 'Dallas HVAC Blast', niche: 'Home Services', services: ['HVAC'], geography: { state: 'Texas', county: 'Dallas', city: 'Dallas' }, leads: 28, sent: 28, replies: 12, status: 'completed', color: '#22c55e' },
];

const SYSTEM_CATEGORIES = {
  "Air conditioning contractor": ["AC installation", "AC replacement", "central air installation", "ductless mini split installation", "AC system design", "thermostat installation", "AC maintenance"],
  "Air conditioning repair service": ["AC repair", "compressor repair", "fan motor repair", "refrigerant recharge", "thermostat repair", "emergency AC repair", "AC troubleshooting"],
  "Air duct cleaning service": ["air duct cleaning", "vent cleaning", "HVAC duct sanitization", "mold removal in ducts", "dryer vent inspection", "dust removal"],
  "Appliance repair service": ["refrigerator repair", "washer repair", "dryer repair", "dishwasher repair", "oven repair", "stove repair", "microwave repair"],
  "Arborist service": ["tree pruning", "tree health assessment", "tree disease treatment", "tree fertilization", "tree cabling", "tree preservation"],
  "Asbestos testing service": ["asbestos inspection", "asbestos sampling", "asbestos material testing", "asbestos air testing", "asbestos risk assessment"],
  "Asphalt contractor": ["asphalt driveway installation", "asphalt paving", "asphalt resurfacing", "asphalt repair", "sealcoating", "parking lot paving"],
  "Bathroom remodeler": ["bathroom renovation", "shower installation", "bathtub installation", "tile installation", "vanity installation", "bathroom plumbing upgrades"],
  "Cabinet maker": ["custom cabinets", "kitchen cabinet design", "cabinet installation", "cabinet refacing", "cabinet repair", "built in cabinetry"],
  "Carpenter": ["framing", "trim carpentry", "custom woodwork", "door installation", "window framing", "wood repair"],
  "Carpet cleaning service": ["steam carpet cleaning", "dry carpet cleaning", "stain removal", "pet odor removal", "carpet deodorizing"],
  "Carpet installer": ["carpet installer", "carpet installation", "carpet stretching", "carpet replacement", "carpet padding installation"],
  "Chimney services": ["chimney inspection", "chimney repair", "chimney liner installation", "chimney rebuilding", "chimney cap installation"],
  "Chimney sweep": ["chimney cleaning", "soot removal", "creosote removal", "flue cleaning"],
  "Cleaners": ["house cleaning", "deep cleaning", "move in cleaning", "move out cleaning", "recurring cleaning"],
  "Concrete contractor": ["concrete driveway installation", "concrete patio installation", "foundation pouring", "concrete repair", "stamped concrete", "sidewalk installation"],
  "Contractor": ["home renovation", "home addition", "structural remodeling", "room remodeling", "home repair"],
  "Countertop contractor": ["countertop installation", "granite countertop installation", "quartz countertop installation", "countertop replacement", "countertop repair"],
  "Deck builder": ["deck installation", "deck repair", "deck replacement", "deck staining", "composite_deck_construction"],
  "Debris removal service": ["construction debris removal", "yard debris removal", "storm debris cleanup", "bulk waste removal"],
  "Demolition contractor": ["house demolition", "garage demolition", "interior demolition", "structure removal", "site clearing"],
  "Double glazing installer": ["double pane window installation", "insulated glass replacement", "energy efficient window upgrades"],
  "Drainage service": ["yard drainage installation", "french drain installation", "foundation drainage repair", "stormwater drainage solutions"],
  "Dry wall contractor": ["drywall installation", "drywall repair", "drywall finishing", "ceiling drywall installation", "drywall patching"],
  "Dryer vent cleaning service": ["dryer vent cleaning", "dryer vent inspection", "lint removal", "dryer vent airflow repair"],
  "Electrician": ["electrical repair", "electrical panel upgrade", "lighting installation", "outlet installation", "breaker repair", "EV charger installation"],
  "Electrical installation service": ["wiring installation", "panel installation", "lighting system installation", "home electrical upgrades"],
  "Emergency locksmith service": ["home lockout service", "lock repair", "lock replacement", "rekeying service"],
  "Excavating contractor": ["site excavation", "foundation excavation", "trenching", "land clearing", "grading"],
  "Fence contractor": ["wood fence installation", "vinyl fence installation", "chain link fence installation", "fence repair", "privacy fence installation"],
  "Fire damage restoration service": ["fire damage cleanup", "smoke odor removal", "soot removal", "structural fire restoration"],
  "Floor refinishing service": ["hardwood floor refinishing", "floor sanding", "floor staining", "floor sealing"],
  "Floor sanding and polishing service": ["floor sanding", "floor polishing", "wood floor buffing", "floor resurfacing"],
  "Flooring contractor": ["hardwood flooring installation", "laminate flooring installation", "vinyl plank installation", "tile flooring installation", "floor repair"],
  "Garage builder": ["garage construction", "detached garage building", "attached garage building", "garage framing"],
  "Gas installation service": ["gas line installation", "gas appliance hookup", "gas pipe repair"],
  "Gasfitter": ["gas pipe installation", "gas leak repair", "gas line replacement"],
  "General contractor": ["home renovation", "kitchen remodeling", "bathroom remodeling", "home additions", "project management"],
  "Glass repair service": ["window glass replacement", "door glass repair", "shower glass repair", "glass panel replacement"],
  "Glazier": ["glass installation", "window glass replacement", "custom glass cutting", "glass repair"],
  "Graffiti removal service": ["graffiti removal", "surface cleaning", "pressure washing graffiti removal"],
  "Gutter cleaning service": ["gutter cleaning", "downspout cleaning", "gutter flushing", "debris removal"],
  "Gutter service": ["gutter installation", "gutter repair", "gutter guard installation", "downspout installation"],
  "Handyman": ["Handyman/Handywoman/Handyperson", "minor home repairs", "fixture installation", "door repair", "drywall patching", "furniture assembly"],
  "Heating contractor": ["furnace installation", "boiler installation", "heating repair", "heat pump installation", "heater maintenance"],
  "Home automation company": ["smart home installation", "smart lighting installation", "home automation setup", "security system integration"],
  "Home builder": ["custom home construction", "new home construction", "home framing", "home design build"],
  "Home cinema installation": ["home theater installation", "surround sound installation", "projector installation", "AV wiring"],
  "Home inspector": ["home inspection", "pre purchase inspection", "structural inspection", "property inspection report"],
  "Home staging service": ["home staging", "interior staging", "property staging", "furniture staging"],
  "Hot tub repair service": ["hot tub repair", "spa pump repair", "hot tub leak repair", "hot tub maintenance"],
  "House cleaning service": ["residential cleaning", "deep house cleaning", "move out cleaning", "recurring house cleaning"],
  "HVAC contractor": ["HVAC installation", "HVAC repair", "HVAC maintenance", "heat pump installation", "ductwork installation"],
  "Insulation contractor": ["attic insulation", "spray foam insulation", "wall insulation", "crawlspace insulation"],
  "Interior decorator": ["interior decoration", "furniture layout design", "color consultation", "decor styling"],
  "Interior designer": ["interior design planning", "space planning", "material selection", "design consultation"],
  "Junk removal service": ["junk hauling", "furniture removal", "appliance disposal", "construction debris removal"],
  "Kitchen remodeler": ["kitchen renovation", "cabinet installation", "countertop installation", "kitchen layout redesign", "appliance installation"],
  "Landscaper": ["landscape design", "garden installation", "mulch installation", "planting services", "yard grading"],
  "Lawn care service": ["lawn mowing", "lawn fertilization", "weed control", "aeration", "lawn seeding"],
  "Locksmith": ["lock installation", "lock repair", "lock rekeying", "key duplication", "emergency lockout service"],
  "Painter": ["interior painting", "exterior painting", "cabinet painting", "wall preparation", "deck staining"],
  "Paving contractor": ["driveway paving", "asphalt paving", "paver installation", "walkway paving", "parking pad paving"],
  "Pest control service": ["termite treatment", "rodent control", "ant extermination", "bed bug treatment", "mosquito control"],
  "Plasterer": ["plaster repair", "wall plastering", "ceiling plastering", "decorative plaster"],
  "Plumber": ["pipe repair", "drain cleaning", "water heater installation", "toilet installation", "leak detection", "sewer line repair"],
  "Pool cleaning service": ["pool cleaning", "pool chemical balancing", "pool vacuuming", "filter cleaning"],
  "Pressure washing service": ["house washing", "driveway cleaning", "deck pressure washing", "roof soft washing"],
  "Roofing contractor": ["roof installation", "roof replacement", "roof repair", "shingle replacement", "roof inspection"],
  "Septic system service": ["septic pumping", "septic inspection", "septic repair", "septic installation"],
  "Siding contractor": ["vinyl siding installation", "fiber cement siding installation", "siding repair", "siding replacement"],
  "Snow removal service": ["driveway snow removal", "sidewalk snow removal", "snow plowing", "ice removal"],
  "Solar energy company": ["solar panel installation", "solar system design", "solar battery installation", "solar inverter installation"],
  "Swimming pool contractor": ["pool construction", "pool installation", "pool renovation", "pool equipment installation"],
  "Tile contractor": ["tile installation", "bathroom tile installation", "kitchen backsplash installation", "tile repair"],
  "Tree service": ["tree trimming", "tree removal", "stump grinding", "storm damage cleanup"],
  "Water damage restoration service": ["water extraction", "structural drying", "flood cleanup", "mold remediation"],
  "Waterproofing service": ["basement waterproofing", "foundation sealing", "crawlspace encapsulation", "leak sealing"],
  "Window cleaning service": ["residential window cleaning", "screen cleaning", "track cleaning"],
  "Window installation service": ["window installation", "window replacement", "energy efficient window installation"],
  "Wood floor installation service": ["hardwood floor installation", "engineered wood floor installation", "subfloor preparation"],
  "Wood floor refinishing service": ["hardwood floor sanding", "floor staining", "floor sealing"]
};

const SYSTEM_LOCATIONS = [
  { state: "New York", county: "Albany County", municipality: "Albany", type: "city" },
  { state: "New York", county: "Albany County", municipality: "Cohoes", type: "city" },
  { state: "New York", county: "Albany County", municipality: "Watervliet", type: "city" },
  { state: "New York", county: "Albany County", municipality: "Green Island", type: "town" },
  { state: "New York", county: "Albany County", municipality: "Bethlehem", type: "town" },
  { state: "New York", county: "Albany County", municipality: "Colonie", type: "town" },
  { state: "New York", county: "Albany County", municipality: "Guilderland", type: "town" },
  { state: "New York", county: "Albany County", municipality: "Altamont", type: "village" },
  { state: "New York", county: "Albany County", municipality: "Colonie", type: "village" },
  { state: "New York", county: "Albany County", municipality: "Menands", type: "village" },
  { state: "New York", county: "Erie County", municipality: "Buffalo", type: "city" },
  { state: "New York", county: "Erie County", municipality: "Lackawanna", type: "city" },
  { state: "New York", county: "Erie County", municipality: "Tonawanda", type: "city" },
  { state: "New York", county: "Erie County", municipality: "Amherst", type: "town" },
  { state: "New York", county: "Erie County", municipality: "Cheektowaga", type: "town" },
  { state: "New York", county: "Erie County", municipality: "Hamburg", type: "town" },
  { state: "New York", county: "Erie County", municipality: "Orchard Park", type: "town" },
  { state: "New York", county: "Erie County", municipality: "East Aurora", type: "village" },
  { state: "New York", county: "Erie County", municipality: "Hamburg", type: "village" },
  { state: "New York", county: "Erie County", municipality: "Williamsville", type: "village" },
  { state: "New York", county: "Monroe County", municipality: "Rochester", type: "city" },
  { state: "New York", county: "Monroe County", municipality: "Brighton", type: "town" },
  { state: "New York", county: "Monroe County", municipality: "Greece", type: "town" },
  { state: "New York", county: "Monroe County", municipality: "Henrietta", type: "town" },
  { state: "New York", county: "Monroe County", municipality: "Penfield", type: "town" },
  { state: "New York", county: "Monroe County", municipality: "Pittsford", type: "town" },
  { state: "New York", county: "Monroe County", municipality: "Fairport", type: "village" },
  { state: "New York", county: "Monroe County", municipality: "Hilton", type: "village" },
  { state: "New York", county: "Monroe County", municipality: "Pittsford", type: "village" },
  { state: 'Florida', county: 'Miami-Dade', municipality: 'Miami', type: 'city' },
  { state: 'Florida', county: 'Miami-Dade', municipality: 'Hialeah', type: 'city' },
  { state: 'Florida', county: 'Miami-Dade', municipality: 'Miami Beach', type: 'city' },
  { state: 'Florida', county: 'Broward', municipality: 'Fort Lauderdale', type: 'city' },
  { state: 'Florida', county: 'Broward', municipality: 'Hollywood', type: 'city' },
  { state: 'Florida', county: 'Broward', municipality: 'Pembroke Pines', type: 'city' },
  { state: 'Pennsylvania', county: 'Philadelphia', municipality: 'Philadelphia', type: 'city' },
  { state: 'Pennsylvania', county: 'Montgomery', municipality: 'Norristown', type: 'town' },
  { state: 'Pennsylvania', county: 'Montgomery', municipality: 'King of Prussia', type: 'town' },
  { state: 'Pennsylvania', county: 'Montgomery', municipality: 'Pottstown', type: 'town' }
];

function buildGeoHierarchy(flatList) {
  const hierarchy = [];
  flatList.forEach(loc => {
    let state = hierarchy.find(g => g.state === loc.state);
    if (!state) {
      state = { state: loc.state, counties: [] };
      hierarchy.push(state);
    }
    let county = state.counties.find(c => c.name === loc.county);
    if (!county) {
      county = { name: loc.county, cities: [] };
      state.counties.push(county);
    }
    if (!county.cities.includes(loc.municipality)) {
      county.cities.push(loc.municipality);
    }
  });
  return hierarchy;
}

const CAMPAIGN_DATA = {
  industries: Object.entries(SYSTEM_CATEGORIES).map(([label, services]) => ({
    id: label.toLowerCase().replace(/\s+/g, '_'),
    label,
    services
  })),
  geography: buildGeoHierarchy(SYSTEM_LOCATIONS)
};

const API_COST_MODELS = {
  openai: { 
    name: 'OpenAI (GPT-4)', 
    icon: '🤖',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', costPerLead: 0.005, description: 'Flash speed, high intelligence' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', costPerLead: 0.10, description: 'Legacy high-performance' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', costPerLead: 0.001, description: 'Cheap & fast' }
    ]
  },
  claude: { 
    name: 'Anthropic (Claude)', 
    icon: '🧠',
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', costPerLead: 0.03, description: 'Best for reasoning' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', costPerLead: 0.045, description: 'Only use this model to build proposed website' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', costPerLead: 0.15, description: 'Maximum capabilities' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', costPerLead: 0.005, description: 'Near-instant responses' }
    ]
  },
  dataseo: { name: 'Data for SEO', costPerLead: 0.0054, multiplier: 1.2, available: 2000, icon: '📊' },
  pagespeed: { name: 'PageSpeed', costPerLead: 0.01, multiplier: 1.0, available: 5000, icon: '⚡' },
  hunter: { name: 'Hunter.io', costPerLead: 0.08, multiplier: 1.2, available: 800, icon: '🎯' },
  instantly: { name: 'Instantly', costPerLead: 0.00, multiplier: 1.0, available: '∞', icon: '🚀', link: 'https://developer.instantly.ai/api/v2/apikey/def-9' },
  reoon: { name: 'Reoon Email Verifier', costPerLead: 0.002, multiplier: 1.0, available: 10000, icon: '🛡️', link: 'https://emailverifier.reoon.com/api-settings/' },
  twilio: { name: 'Twilio (SMS/Voice)', costPerLead: 0.02, multiplier: 1.0, available: 10000, icon: '📱' },
  stripe: { name: 'Stripe (Payments)', costPerLead: 0.00, multiplier: 0.0, available: '∞', icon: '💳' },
  whatsapp: { name: 'WhatsApp Business', costPerLead: 0.03, multiplier: 1.1, available: 5000, icon: '💬' },
  resend: { name: 'Resend (Email)', costPerLead: 0.01, multiplier: 1.0, available: 3000, icon: '📧' },
  gtmetrix: { name: 'GTMetrix', costPerLead: 0.01, multiplier: 1.0, available: 1000, icon: '📈', link: 'https://gtmetrix.com/api/docs/2.0/' },
  pingdom: { name: 'Pingdom', costPerLead: 0.01, multiplier: 1.0, available: 1000, icon: '⏱️', link: 'https://www.pingdom.com/api/' },
  runware: { 
    name: 'Runware (AI Images)', 
    icon: '🖼️',
    link: 'https://runware.ai/',
    models: [
      { id: 'runware:400@3', name: 'Runware 400@3', costPerLead: 0.00078, description: 'Ultra-fast basic generation' },
      { id: 'bytedance:seedream@5.0-lite', name: 'Seedream 5.0 Lite', costPerLead: 0.035, description: 'Artistic realism' },
      { id: 'runware:z-image@0', name: 'Z-Image', costPerLead: 0.012, description: 'High quality generation' }
    ]
  },
  linkedin: { name: 'LinkedIn (B2B)', costPerLead: 0.05, multiplier: 1.5, available: '∞', icon: '🔗' },
  facebook: { name: 'Facebook Outreach', costPerLead: 0.02, multiplier: 1.0, available: '∞', icon: '👥' },
  instagram: { name: 'Instagram DM', costPerLead: 0.02, multiplier: 1.0, available: '∞', icon: '📸' },
  google_places: { name: 'Google Places', costPerLead: 0.01, multiplier: 1.0, available: '∞', icon: '📍' },
};

// INITIAL_USERS removed in favor of backend API

function getScoreClass(score) {
  if (score >= 70) return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' };
  if (score >= 50) return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
  return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
}

function getStatusStyle(status) {
  const map = {
    active: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Active' },
    idle: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: 'Idle' },
    building: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'Building' },
    monitoring: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Monitoring' },
  };
  return map[status] || map.idle;
}

const LoginView = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        const res = await authApi.forgotCredentials(identifier);
        setMessage(res.message || 'Recovery details sent if account exists.');
      } else {
        const res = await authApi.login({ identifier, password });
        if (res.access_token) {
          localStorage.setItem('orbis_token', res.access_token);
          onLogin(res.user);
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e1b4b, #020617)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '16px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isForgotPassword ? 'Recover Access' : 'Admin Portal'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            {isForgotPassword ? 'Enter your details to receive recovery info.' : 'Secure entry for Autonomous Web Agency.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1' }}>Email or Username</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@agency.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          {!isForgotPassword && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Forgot Email or Username?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    zIndex: 2
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && <div style={{ color: '#f87171', fontSize: '13px', background: 'rgba(248, 113, 113, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>{error}</div>}
          {message && <div style={{ color: '#4ade80', fontSize: '13px', background: 'rgba(74, 222, 128, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>{message}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '14px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              marginTop: '10px'
            }}
            onMouseOver={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
          >
            {isSubmitting ? 'Processing...' : (isForgotPassword ? 'Send Recovery Info' : 'Sign In')}
          </button>

          {isForgotPassword && (
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:40001';
  const [activeView, setActiveView] = useState('pipeline');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('orbis_token');
      if (token) {
        try {
          const profile = await authApi.getProfile();
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('orbis_token');
          }
        } catch (error) {
          console.error('Session check failed:', error);
          localStorage.removeItem('orbis_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('orbis_token');
    setIsAuthenticated(false);
    setUser(null);
  };
  const [isDark, setIsDark] = useState(true);
  const [phaseSettings, setPhaseSettings] = useState({
    lead_inbox: true, discovered: true, qualified: true, outreach_sent: true, replied: true,
    demo_sent: true, proposal_sent: true, paid: true, building: true, delivered: true
  });
  const [leadSettings, setLeadSettings] = useState({});
  const [crmData, setCrmData] = useState(INITIAL_CRM_CLIENTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [dashboardAgents, setDashboardAgents] = useState(INITIAL_AGENTS);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [crmSearchTerm, setCrmSearchTerm] = useState('');
  const [crmFilterStage, setCrmFilterStage] = useState('all');
  const [modalStep, setModalStep] = useState(1);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    targetCount: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    industry: null,
    services: [],
    geography: { state: null, county: null, city: null },
    isScheduled: false,
    scheduledDate: '',
    autoWriteEmail: false
  });
  const [isWizard, setIsWizard] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [crmActiveTab, setCrmActiveTab] = useState('details');
  const [editLeadData, setEditLeadData] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [customCategories, setCustomCategories] = useState(null);
  const [customLocations, setCustomLocations] = useState(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importLocationsText, setImportLocationsText] = useState('');
  const [importError, setImportError] = useState(null);
  const [importLocationsError, setImportLocationsError] = useState(null);
  const [isSystemAccordionOpen, setIsSystemAccordionOpen] = useState(false);
  const [isLocationsAccordionOpen, setIsLocationsAccordionOpen] = useState(false);
  const [isWorkflowTestAccordionOpen, setIsWorkflowTestAccordionOpen] = useState(false);
  const [isGscAccordionOpen, setIsGscAccordionOpen] = useState(false);
  const [workflowTestUrl, setWorkflowTestUrl] = useState('');
  const [isWorkflowTesting, setIsWorkflowTesting] = useState(false);
  const [pipelineFitMode, setPipelineFitMode] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [apiToggles, setApiToggles] = useState({});
  const [testStatus, setTestStatus] = useState({});
  const [selectedModels, setSelectedModels] = useState({
    openai: 'gpt-4o',
    claude: 'claude-3-5-sonnet',
    runware: 'runware:400@3'
  });
  const [masterConnect, setMasterConnect] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) {
      usersApi.list().then(setUsers).catch(console.error);
    }
  }, [user]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', role: 'standard_user', status: 'UNBLOCKED' });
  
  // RBAC Setup
  const currentUser = user || { role: 'super_admin' };
  const permissions = RBAC.roles[currentUser.role]?.permissions || {};
  const ui_restrictions = RBAC.roles[currentUser.role]?.ui_restrictions || {};

  // ─── Email Sequences State ────────────────────────────────────────
  const blankEmailStep = (step) => ({ step, subject: '', body: '', delayDays: step === 1 ? 0 : 3 });
  const blankSequence = () => ({ name: '', steps: 3, emails: [blankEmailStep(1), blankEmailStep(2), blankEmailStep(3)], assignedCampaignId: null, autoWriteEmail: false });
  const [emailSequences, setEmailSequences] = useState([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingSequenceId, setEditingSequenceId] = useState(null);
  const [newSequence, setNewSequence] = useState(blankSequence());
  const [activeEmailStep, setActiveEmailStep] = useState(1);

  // ─── AI Generation State ─────────────────────────────────────────
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenError, setAiGenError] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInputs, setAiInputs] = useState({
    industry: '',
    pain_point_signal: '',
    primary_outcome: '',
    secondary_outcome: '',
    sender_name: '',
    sender_company: 'Orbis Outreach - BPS',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20240620'
  });

  useEffect(() => {
    // Force mount immediately to avoid getting stuck
    setHasMounted(true);

    async function fetchData() {
        if (typeof window !== 'undefined' && localStorage.getItem('orbis_master_sync') === 'false') return;
        try {
            const [cData, lData, sData] = await Promise.all([
                campaignsApi.list(),
                leadsApi.list(),
                emailSequencesApi.list()
            ]);
            if (Array.isArray(cData)) setCampaigns(cData);
            if (Array.isArray(lData)) setCrmData(lData);
            if (Array.isArray(sData)) setEmailSequences(sData);
        } catch (err) {
            if (!err.isOffline) console.error("API Fetch Error:", err);
        }
    }

    fetchData();

    // Agent status polling
    const pollInterval = setInterval(async () => {
        if (typeof window !== 'undefined' && localStorage.getItem('orbis_master_sync') === 'false') return;
        try {
            const agentsData = await agentsApi.list();
            if (agentsData && typeof agentsData === 'object') {
                // Update AGENTS mock data or state if we had one
                // For now, let's keep AGENTS as a local state so we can update it
                setDashboardAgents(prev => {
                    // Map API response to our AGENTS structure
                    return prev.map(agent => {
                        const apiAgent = agentsData[agent.name.toLowerCase().replace(/\s+/g, '-')] || // e.g. "Scout Agent" -> "scout-agent"
                                        agentsData[agent.name.split(' ')[0].toLowerCase() + '-queue']; // e.g. "Scout Agent" -> "scout-queue"
                        
                        if (apiAgent) {
                            return {
                                ...agent,
                                processed: apiAgent.completed + apiAgent.failed,
                                status: apiAgent.active > 0 ? 'active' : (apiAgent.waiting > 0 ? 'active' : 'idle')
                            };
                        }
                        return agent;
                    });
                });
            }
        } catch (err) {
            console.error("Agent Polling Error:", err);
        }
    }, 5000);

    try {
      if (typeof window !== 'undefined') {
        console.log("Dashboard Mounting...");

        const savedView = localStorage.getItem('orbis_active_view');
        if (savedView) setActiveView(savedView);

        const savedTheme = localStorage.getItem('orbis_theme');
        if (savedTheme) setIsDark(savedTheme === 'dark');

        const savedPhases = localStorage.getItem('orbis_phases');
        if (savedPhases) {
          try {
            const parsed = JSON.parse(savedPhases);
            if (parsed && typeof parsed === 'object') setPhaseSettings(parsed);
          } catch (e) { console.error("Error parsing phases:", e); }
        }

        const savedLeads = localStorage.getItem('orbis_leads_active');
        if (savedLeads) {
          try {
            const parsed = JSON.parse(savedLeads);
            if (parsed && typeof parsed === 'object') setLeadSettings(parsed);
          } catch (e) { console.error("Error parsing leads:", e); }
        }

        const savedApiToggles = localStorage.getItem('orbis_api_toggles');
        if (savedApiToggles) {
          try {
            const parsed = JSON.parse(savedApiToggles);
            if (parsed && typeof parsed === 'object') setApiToggles(parsed);
          } catch (e) { console.error("Error parsing api toggles:", e); }
        }

        const savedMasterSync = localStorage.getItem('orbis_master_sync');
        if (savedMasterSync !== null) setMasterConnect(savedMasterSync !== 'false');
      }
    } catch (err) {
      console.error("Initialization Error:", err);
    }

    // ─── Load API Keys ──────────────────────────────────────────────
    const defaultKeys = {
      instantly: 'ZjJiYTgwM2ItNmViNi00YTE0LWFjMTYtNzIzODUwMTZiOTk5OlV2dVpyZ3F0aGxFSQ==',
      reoon: '7QCizxuc46xeOHJHk750EuC0IvSmI4mZ'
    };

    const cachedKeys = localStorage.getItem('orbis_api_keys');
    let initialKeys = { ...defaultKeys };
    if (cachedKeys) {
      try { 
        const parsed = JSON.parse(cachedKeys);
        if (parsed && typeof parsed === 'object') initialKeys = { ...initialKeys, ...parsed };
      } catch (e) { /* ignore */ }
    }
    setApiKeys(initialKeys);

    // Fetch from backend and merge carefully
    if (localStorage.getItem('orbis_master_sync') !== 'false') {
      settingsApi.get()
        .then(serverSettings => {
          if (serverSettings && typeof serverSettings === 'object') {
            const serverKeys = Object.entries(serverSettings).reduce((acc, [k, v]) => {
              if (k.startsWith('api_key_') && v) acc[k.replace('api_key_', '')] = v;
              return acc;
            }, {});
            
            setApiKeys(prev => {
              const merged = { ...prev, ...serverKeys };
              localStorage.setItem('orbis_api_keys', JSON.stringify(merged));
              return merged;
            });

            // Also push defaults to server if this is first boot and server is empty
            const hasKeys = Object.keys(serverSettings).some(k => k.startsWith('api_key_'));
            if (!hasKeys) {
              settingsApi.update({
                  api_key_instantly: defaultKeys.instantly,
                  api_key_reoon: defaultKeys.reoon,
              }).catch(() => {});
            }
          }
        })
        .catch(err => {
          if (!err.isOffline) console.error("API Key Sync Error:", err);
        });
    }

    const savedModels = localStorage.getItem('orbis_api_models');
    if (savedModels) {
      try { 
        const parsed = JSON.parse(savedModels);
        if (parsed && typeof parsed === 'object') {
          setSelectedModels(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) { /* ignore */ }
    }

    return () => clearInterval(pollInterval);
  }, []);

  const handleSaveApiKey = (id, key) => {
    setApiKeys(prev => {
      const next = { ...prev, [id]: key };
      // 1. Update localStorage cache immediately
      localStorage.setItem('orbis_api_keys', JSON.stringify(next));
      // 2. Persist to backend (source of truth)
      if (localStorage.getItem('orbis_master_sync') !== 'false') {
        settingsApi.update({ [`api_key_${id}`]: key })
          .catch(err => {
            if (!err.isOffline) console.error('Failed to persist API key to backend:', err);
          });
      }
      return next;
    });
    alert(`${API_COST_MODELS[id].name} key saved successfully!`);
  };

  const handleTestApiConnection = async (id) => {
    setTestStatus(prev => ({ ...prev, [id]: 'testing' }));
    // Simulate API verification with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestStatus(prev => ({ ...prev, [id]: 'success' }));
    setTimeout(() => {
      setTestStatus(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 3000);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view !== 'campaigns') setEditingCampaignId(null);
    if (typeof window !== 'undefined') localStorage.setItem('orbis_active_view', view);
  };

  const togglePhase = (id) => {
    setPhaseSettings(prev => {
      const next = { ...prev, [id]: !prev?.[id] };
      if (typeof window !== 'undefined') localStorage.setItem('orbis_phases', JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') localStorage.setItem('orbis_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const toggleLead = (id) => {
    setLeadSettings(prev => {
      const next = { ...prev, [id]: prev?.[id] === false ? true : false };
      if (typeof window !== 'undefined') localStorage.setItem('orbis_leads_active', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleMasterConnect = () => {
    setMasterConnect(prev => {
      const next = !prev;
      localStorage.setItem('orbis_master_sync', next ? 'true' : 'false');
      return next;
    });
  };

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.email || !newUser.username) return;
    if (editingUser) {
      // Username is immutable, so we ignore any changes to it in the payload to match backend logic
      const { username, isOnline, ...updateData } = newUser;
      usersApi.update(editingUser.id, updateData).then(() => {
        usersApi.list().then(setUsers);
      });
    } else {
      usersApi.create(newUser).then(() => {
        usersApi.list().then(setUsers);
      });
    }
    setIsUserModalOpen(false);
    setNewUser({ name: '', email: '', username: '', role: 'standard_user', status: 'UNBLOCKED' });
    setEditingUser(null);
  };

  const handleToggleApi = (id) => {
    setApiToggles(prev => {
      const nextValue = !prev?.[id];
      const next = { ...prev, [id]: nextValue };
      localStorage.setItem('orbis_api_toggles', JSON.stringify(next));
      
      // Persist to backend
      if (localStorage.getItem('orbis_master_sync') !== 'false') {
        settingsApi.update({ [`api_active_${id}`]: nextValue ? 'true' : 'false' })
          .catch(err => {
            if (!err.isOffline) console.error('Failed to persist API toggle to backend:', err);
          });
      }
      
      return next;
    });
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsApi.delete(id);
        const lData = await leadsApi.list();
        setCrmData(lData);

        if (selectedLeadId === id) {
          setSelectedLeadId(null);
        }
        setExpandedLeadId(null);
      } catch (err) {
        console.error("Failed to delete lead:", err);
        alert("Failed to delete lead. See console.");
      }
    }
  };

  const handleRunWorkflowTest = async () => {
    if (!workflowTestUrl) return;
    setIsWorkflowTesting(true);
    try {
        if (localStorage.getItem('orbis_master_sync') === 'false') {
          alert('Cannot start test while Master Sync is Offline.');
          return;
        }
        const urls = workflowTestUrl.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
        if (urls.length === 0) return;

        await diagnosticsApi.runWorkflowTest(urls);
        alert(`${urls.length} Workflow Test(s) Started! Head over to the AGENTS tab to watch the Scout Agent in action.`);
        setWorkflowTestUrl('');
        setIsWorkflowTestAccordionOpen(false);
    } catch (err) {
        if (!err.isOffline) {
          console.error("Workflow Test Error:", err);
          alert('Error starting diagnostic.');
        }
    } finally {
        setIsWorkflowTesting(false);
    }
  };

  const addCampaign = async () => {
    if (!newCampaign?.name) return;

    const campaignStatus = newCampaign.isScheduled ? 'PAUSED' : 'ACTIVE';
    
    let emailSequenceId = null;

    try {
      if (!editingCampaignId && newCampaign.autoWriteEmail) {
        setAiGenerating(true);
        // Auto-generate outreach sequence
        const autoAiInputs = {
          industry: newCampaign.industry?.label || 'General',
          pain_point_signal: `poor performance in ${newCampaign.industry?.label || 'their sector'}`,
          primary_outcome: `increased revenue and lead volume`,
          sender_name: user?.fullName || user?.username || 'Alex',
          sender_company: 'Orbis Outreach - BPS',
          step_count: 3
        };

        const aiData = await aiApi.generateEmails(autoAiInputs);
        const seqData = await emailSequencesApi.create({
          name: `Auto-Generated: ${newCampaign.name}`,
          emails: [1, 2, 3].map(i => {
            const emailKey = `email_${i}`;
            const email = aiData[emailKey];
            return {
              stepNumber: i,
              delayDays: i === 1 ? 0 : (i === 2 ? 3 : 7),
              subject: email?.subject || 'Quick question',
              body: email?.body || 'Hi there, just reaching out...'
            };
          })
        });
        emailSequenceId = seqData.id;
      }

      if (editingCampaignId) {
        await campaignsApi.update(editingCampaignId, {
          name: newCampaign.name,
          status: campaignStatus,
        });
      } else {
        await campaignsApi.create({
          name: newCampaign.name,
          niche: newCampaign.industry?.label || 'General',
          geography: [
            newCampaign.geography?.city,
            newCampaign.geography?.state
          ].filter(Boolean).join(', ') || 'All',
          sourceConfig: {
            targetCount: newCampaign.targetCount,
            services: newCampaign.services,
            industry: newCampaign.industry,
            geography: newCampaign.geography,
            autoWriteEmail: newCampaign.autoWriteEmail
          },
          thresholds: { targetCount: newCampaign.targetCount },
          status: campaignStatus,
          emailSequenceId
        });
      }

      const cData = await campaignsApi.list();
      setCampaigns(cData);
      handleViewChange('jobqueue');
    } catch (err) {
      console.error("Failed to save campaign:", err);
      alert("Failed to save campaign. See console.");
    } finally {
      setAiGenerating(false);
    }

    setIsCampaignModalOpen(false);
    setEditingCampaignId(null);
    setModalStep(1);
    setNewCampaign({
      name: '',
      targetCount: 50,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      industry: null,
      services: [],
      geography: { state: null, county: null, city: null },
      isScheduled: false,
      scheduledDate: '',
      autoWriteEmail: false
    });
    setIsWizard(true);
  };

  const handleImportCategories = () => {
    setImportError(null);
    try {
      let parsed = JSON.parse(importJsonText);
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        throw new Error('Data must be an object');
      }

      // Filter out common metadata keys and handle nesting
      const metadataKeys = ['schema_version', 'description', 'version', 'exported_at', 'metadata', 'categories'];

      if (parsed.categories && typeof parsed.categories === 'object' && !Array.isArray(parsed.categories)) {
        parsed = parsed.categories;
      }

      const filtered = {};
      Object.keys(parsed).forEach(key => {
        if (!metadataKeys.includes(key.toLowerCase())) {
          filtered[key] = parsed[key];
        }
      });

      if (Object.keys(filtered).length === 0) {
        throw new Error('No valid categories found');
      }

      setCustomCategories(filtered);
      if (typeof window !== 'undefined') localStorage.setItem('orbis_custom_categories', JSON.stringify(filtered));
      setImportJsonText('');
      alert('Categories imported successfully!');
    } catch (e) {
      setImportError(e.message);
    }
  };

  const handleClearCategories = () => {
    if (window.confirm('Revert to default system categories?')) {
      setCustomCategories(null);
      if (typeof window !== 'undefined') localStorage.removeItem('orbis_custom_categories');
    }
  };

  const handleImportLocations = () => {
    setImportLocationsError(null);
    try {
      let parsed = JSON.parse(importLocationsText);
      if (!Array.isArray(parsed)) {
        throw new Error('Data must be an array of objects');
      }

      if (parsed.length === 0) {
        throw new Error('No locations found in the list');
      }

      // Basic validation of first item
      const item = parsed[0];
      if (!item.state || !item.municipality) {
        throw new Error('Invalid format. Expecting: [{"state": "...", "municipality": "...", ...}]');
      }

      setCustomLocations(parsed);
      if (typeof window !== 'undefined') localStorage.setItem('orbis_custom_locations', JSON.stringify(parsed));
      setImportLocationsText('');
      alert('Locations imported successfully!');
    } catch (e) {
      setImportLocationsError(e.message);
    }
  };

  const handleClearLocations = () => {
    if (window.confirm('Revert to default system locations?')) {
      setCustomLocations(null);
      if (typeof window !== 'undefined') localStorage.removeItem('orbis_custom_locations');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let parsed = JSON.parse(content);

        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
          throw new Error('Data must be an object');
        }

        // Filter out common metadata keys and handle nesting
        const metadataKeys = ['schema_version', 'description', 'version', 'exported_at', 'metadata', 'categories'];

        if (parsed.categories && typeof parsed.categories === 'object' && !Array.isArray(parsed.categories)) {
          parsed = parsed.categories;
        }

        const filtered = {};
        Object.keys(parsed).forEach(key => {
          if (!metadataKeys.includes(key.toLowerCase())) {
            filtered[key] = parsed[key];
          }
        });

        if (Object.keys(filtered).length === 0) {
          throw new Error('No valid categories found in file');
        }

        setCustomCategories(filtered);
        if (typeof window !== 'undefined') localStorage.setItem('orbis_custom_categories', JSON.stringify(filtered));
        alert('File uploaded and categories imported successfully!');
      } catch (err) {
        alert('Error parsing JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleLocationFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let parsed = JSON.parse(content);

        if (!Array.isArray(parsed)) {
          throw new Error('Data must be an array of objects');
        }

        if (parsed.length === 0) {
          throw new Error('No locations found in file');
        }

        setCustomLocations(parsed);
        if (typeof window !== 'undefined') localStorage.setItem('orbis_custom_locations', JSON.stringify(parsed));
        alert('File uploaded and locations imported successfully!');
      } catch (err) {
        alert('Error parsing JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSelectLead = (lead) => {
    const id = lead?.id || null;
    setSelectedLeadId(id);
    setIsEditing(false);
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem('orbis_selected_lead', id);
      else localStorage.removeItem('orbis_selected_lead');
    }
  };

  const updateLead = async (id, updates) => {
    try {
        await leadsApi.update(id, updates);
        const lData = await leadsApi.list();
        setCrmData(lData);
    } catch (err) {
        console.error("Failed to update lead:", err);
    }
  };

  const handleUpdateLeadStage = async (id, stage) => {
    try {
        await leadsApi.updateStage(id, stage);
        const lData = await leadsApi.list();
        setCrmData(lData);
    } catch (err) {
        console.error("Failed to update lead stage:", err);
    }
  };

   const handleSaveLeadChanges = async (id) => {
    if (!editLeadData || editLeadData.id !== id) return;

    try {
        await leadsApi.update(id, editLeadData);
        const lData = await leadsApi.list();
        setCrmData(lData);
        alert("Lead updated successfully!");
    } catch (err) {
        console.error("Failed to save lead changes:", err);
        alert("Failed to save changes.");
    }
  };

  const handleUpdateCampaignStatus = async (id, status) => {
    try {
        // Map UI status to API status
        const apiStatus = status === 'active' ? 'ACTIVE' : status === 'paused' ? 'PAUSED' : 'COMPLETED';
        await campaignsApi.updateStatus(id, apiStatus);
        const cData = await campaignsApi.list();
        setCampaigns(cData);
    } catch (err) {
        console.error("Failed to update campaign status:", err);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
          await campaignsApi.delete(id);
          const cData = await campaignsApi.list();
          setCampaigns(cData);
      } catch (err) {
          console.error("Failed to delete campaign:", err);
      }
    }
  };

  // ─── Email Sequence Handlers ─────────────────────────────────────
  const handleSequenceStepCountChange = (count) => {
    const emails = Array.from({ length: count }, (_, i) =>
      newSequence.emails[i] || blankEmailStep(i + 1)
    );
    setNewSequence(s => ({ ...s, steps: count, emails }));
    setActiveEmailStep(Math.min(activeEmailStep, count));
  };

  const handleEmailFieldChange = (stepIndex, field, value) => {
    setNewSequence(s => {
      const emails = s.emails.map((e, i) => i === stepIndex ? { ...e, [field]: value } : e);
      return { ...s, emails };
    });
  };

  const saveEmailSequence = async () => {
    if (!newSequence.name) return;
    try {
        if (editingSequenceId) {
          await emailSequencesApi.update(editingSequenceId, newSequence);
        } else {
          await emailSequencesApi.create(newSequence);
        }
        const sData = await emailSequencesApi.list();
        setEmailSequences(sData);
        setIsEmailModalOpen(false);
        setEditingSequenceId(null);
        setNewSequence(blankSequence());
        setActiveEmailStep(1);
    } catch (err) {
        console.error("Failed to save email sequence:", err);
        alert("Failed to save email sequence. See console.");
    }
  };

  const deleteEmailSequence = async (id) => {
    if (window.confirm('Delete this email sequence?')) {
      try {
          await emailSequencesApi.delete(id);
          const sData = await emailSequencesApi.list();
          setEmailSequences(sData);
      } catch (err) {
          console.error("Failed to delete email sequence:", err);
      }
    }
  };

  const assignSequenceToCampaign = async (sequenceId, campaignId) => {
    try {
        await emailSequencesApi.update(sequenceId, { assignedCampaignId: campaignId || null });
        const sData = await emailSequencesApi.list();
        setEmailSequences(sData);
    } catch (err) {
        console.error("Failed to assign sequence:", err);
    }
  };

  const generateEmailsWithAI = async () => {
    if (localStorage.getItem('orbis_master_sync') === 'false') {
      alert('Cannot generate emails while Master Sync is Offline.');
      return;
    }
    setAiGenerating(true);
    setAiGenError(null);
    try {
      const data = await aiApi.generateEmails({ ...aiInputs, step_count: newSequence.steps });
      setNewSequence(s => ({
        ...s,
        emails: s.emails.map((e, i) => {
          const key = `email_${i + 1}`;
          return data[key] ? { ...e, subject: data[key].subject, body: data[key].body } : e;
        }),
      }));
    } catch (err) {
      if (!err.isOffline) {
        setAiGenError(err.message || 'Generation failed. Check your API keys in the .env file.');
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const t = isDark ? {

    bg: '#020817', card: '#0f172a', cardHover: '#1e293b', text: '#f1f5f9', textSecondary: '#94a3b8', textMuted: '#64748b',
    border: 'rgba(99,102,241,0.15)', borderSubtle: 'rgba(99,102,241,0.1)', borderFaint: 'rgba(99,102,241,0.05)',
    headerBg: 'rgba(2,8,23,0.9)', codeBg: 'rgba(2,8,23,0.5)', gridLine: '#1e293b', barBg: '#1e293b',
  } : {
    bg: '#f8fafc', card: '#ffffff', cardHover: '#f1f5f9', text: '#0f172a', textSecondary: '#475569', textMuted: '#94a3b8',
    border: 'rgba(99,102,241,0.12)', borderSubtle: 'rgba(99,102,241,0.08)', borderFaint: 'rgba(0,0,0,0.04)',
    headerBg: 'rgba(255,255,255,0.9)', codeBg: '#f1f5f9', gridLine: '#e2e8f0', barBg: '#e2e8f0',
  };

  const safeCrmData = Array.isArray(crmData) ? crmData : [];
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  const totalApisCount = Object.keys(API_COST_MODELS || {}).length;
  const activeApisCount = Object.keys(apiKeys || {}).filter(k => apiKeys[k]).length;
  const llmCount = 3; // OpenAI, Claude, Runware
  const serviceProviderCount = totalApisCount - llmCount;

  // ─── User Stats ──────────────────────────────────────────────────
  const totalUsersCount = users.length;
  const adminCount = users.filter(u => u.role === 'Admins').length;
  const supervisorCount = users.filter(u => u.role === 'Supervisors').length;
  const standardUserCount = users.filter(u => u.role === 'Users').length;
  const onlineCount = users.filter(u => u.status === 'Online').length;

  const leadsPerStage = (PIPELINE_STAGES || []).map(stage => ({
    ...stage,
    leads: (safeCrmData || []).filter(l => l.stage === stage.id),
  }));

  const renderApiCard = (id) => {
    const api = API_COST_MODELS[id];
    if (!api) return null;

    const status = testStatus[id];
    const isSet = !!apiKeys[id];
    const hasModels = !!api.models;
    const selectedModelId = selectedModels[id];
    const selectedModel = hasModels ? api.models.find(m => m.id === selectedModelId) : null;
    const costDisplay = hasModels ? (selectedModel?.costPerLead || 0) : api.costPerLead;

    return (
      <div key={id} className="api-card-premium" style={{ 
        padding: '20px', 
        background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(16px)',
        border: `1px solid ${status === 'success' ? '#22c55e' : 'rgba(99, 102, 241, 0.15)'}`, 
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: status === 'success' ? '0 0 20px rgba(34, 197, 94, 0.15)' : '0 8px 32px rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0
      }}>
        {/* Subtle internal glow */}
        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        {status === 'success' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #22c55e, #10b981)', zIndex: 2 }} />
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.2))' }}>{api.icon}</div>
          <div style={{ 
            padding: '4px 10px', 
            borderRadius: '12px', 
            fontSize: '0.6rem', 
            fontWeight: 900, 
            background: isSet ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.08)', 
            color: isSet ? '#22c55e' : '#ef4444',
            border: `1px solid ${isSet ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: isSet ? '0 0 10px rgba(34,197,94,0.1)' : 'none'
          }}>
            {isSet ? 'Online' : 'Offline'}
          </div>
          
          {/* On/Off Toggle */}
          <div 
            onClick={() => handleToggleApi(id)}
            style={{
              width: '34px',
              height: '18px',
              background: apiToggles[id] ? 'linear-gradient(135deg, #22c55e, #10b981)' : 'rgba(148, 163, 184, 0.2)',
              borderRadius: '20px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: '2px',
              border: apiToggles[id] ? 'none' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              background: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              left: apiToggles[id] ? '18px' : '2px',
              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '2px', color: t.text, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{api.name}</div>
          <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500 }}>
            {costDisplay > 0 ? `$${costDisplay}` : 'Standard'} <span style={{ opacity: 0.4 }}>|</span> {api.available || 0} hits
          </div>
        </div>

        {hasModels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', zIndex: 1 }}>
            <label style={{ fontSize: '0.65rem', color: t.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Variant</label>
            <select 
              value={selectedModelId}
              onChange={(e) => {
                const newModels = { ...selectedModels, [id]: e.target.value };
                setSelectedModels(newModels);
                localStorage.setItem('orbis_api_models', JSON.stringify(newModels));
              }}
              style={{ 
                padding: '8px 10px', 
                background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.8)', 
                border: `1px solid ${t.borderSubtle}`, 
                borderRadius: '10px', 
                color: t.text, 
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                appearance: 'none'
              }}
            >
              {api.models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ position: 'relative', marginTop: (hasModels ? '0' : 'auto'), zIndex: 1 }}>
          <input 
            type="password" 
            value={apiKeys[id] || ''} 
            onChange={(e) => setApiKeys(prev => ({ ...prev, [id]: e.target.value }))}
            placeholder='API Key'
            className="premium-input-glass"
            style={{ 
              width: '100%', 
              padding: '10px 14px', 
              background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.8)', 
              border: `1px solid ${t.borderSubtle}`, 
              borderRadius: '12px', 
              color: t.text, 
              fontSize: '0.75rem',
              outline: 'none',
              transition: 'all 0.2s',
              fontWeight: 500
            }}
          />
          <button 
            onClick={() => handleSaveApiKey(id, apiKeys[id])}
            style={{ 
              position: 'absolute', 
              right: '6px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '6px',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Save Key"
          >
            💾
          </button>
        </div>

        <button 
          onClick={() => handleTestApiConnection(id)}
          disabled={!apiKeys[id] || status === 'testing'}
          className={status === 'success' ? '' : 'premium-test-button'}
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: status === 'testing' ? t.barBg : (status === 'success' ? 'linear-gradient(135deg, #22c55e, #10b981)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'), 
            color: '#fff',
            border: 'none',
            borderRadius: '12px', 
            fontWeight: 800, 
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: status === 'success' ? '0 4px 12px rgba(34, 197, 94, 0.3)' : (status === 'testing' ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)'),
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {status === 'testing' ? 'Verifying...' : (status === 'success' ? '✓ Ready' : 'Test Heartbeat')}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#6366f1' }}>
        <div className="premium-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(99, 102, 241, 0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={(userData) => { setUser(userData); setIsAuthenticated(true); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Inter', system-ui, sans-serif", transition: 'background 0.3s, color 0.3s' }}>
      <header style={{ padding: 'clamp(14px, 1.5vw, 22px) clamp(20px, 2.5vw, 36px)', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.headerBg, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 'clamp(32px, 3vw, 42px)', height: 'clamp(32px, 3vw, 42px)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(0.9rem, 1.2vw, 1.2rem)' }}>◉</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(1.1rem, 1.5vw, 1.5rem)' }}>Orbis Outreach - BPS</span>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(2px, 0.4vw, 8px)', alignItems: 'center', flexWrap: 'wrap' }}>
          {['campaigns', 'emailcampaigns', 'jobqueue', 'agents', 'pipeline', 'crm', 'analytics', 'api', 'users', 'system'].map(view => (
            <button 
              key={view} 
              onClick={() => handleViewChange(view)} 
              style={{ 
                padding: 'clamp(4px, 0.5vw, 8px) clamp(8px, 1vw, 16px)', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: 'clamp(0.58rem, 0.68vw, 0.84rem)', 
                fontWeight: 600, 
                letterSpacing: '0.05em', 
                background: activeView === view ? 'rgba(99,102,241,0.2)' : 'transparent', 
                color: activeView === view ? '#818cf8' : t.textMuted, 
                transition: 'all 0.15s' 
              }}
            >
              {view === 'emailcampaigns' ? 'EMAIL CAMPAIGNS' : (view === 'jobqueue' ? 'JOB QUEUE' : view.toUpperCase())}
            </button>
          ))}
          <button 
            onClick={handleToggleMasterConnect} 
            title={masterConnect ? "Master Sync: Online" : "Master Sync: Offline"}
            style={{ 
              padding: 'clamp(6px, 0.7vw, 10px)', 
              borderRadius: '8px', 
              border: 'none', 
              background: masterConnect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
              cursor: 'pointer', 
              fontSize: 'clamp(1rem, 1.2vw, 1.4rem)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {masterConnect ? '🔗' : '🔌'}
          </button>
          <div style={{ width: '1px', height: '24px', background: t.borderSubtle, margin: '0 8px' }} />
          
          <button 
            onClick={handleLogout}
            style={{ 
              padding: 'clamp(6px, 0.7vw, 10px) clamp(10px, 1.2vw, 20px)', 
              borderRadius: '8px', 
              border: 'none', 
              background: 'rgba(244, 63, 94, 0.1)', 
              color: '#f43f5e', 
              fontSize: 'clamp(0.72rem, 0.85vw, 1.05rem)', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            LOGOUT
          </button>
          <button onClick={toggleTheme} style={{ padding: 'clamp(6px, 0.7vw, 10px)', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 'clamp(1rem, 1.2vw, 1.4rem)' }}>{isDark ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: '95%', margin: '0 auto' }}>
        {hasMounted ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {(activeView === 'api' ? [
                { label: 'Total APIs', value: totalApisCount, color: '#6366f1', pct: 100 },
                { label: 'Active APIs', value: activeApisCount, color: '#22c55e', pct: totalApisCount > 0 ? (activeApisCount / totalApisCount) * 100 : 0 },
                { label: 'Total LLMs', value: llmCount, color: '#f59e0b', pct: 100 },
                { label: 'Service Providers', value: serviceProviderCount, color: '#14b8a6', pct: 100 },
              ] : activeView === 'users' ? [
                { label: 'Total Users', value: totalUsersCount, color: '#6366f1', pct: 100 },
                { label: 'Admins / Supervisors', value: `${users.filter(u => u.role === 'admin' || u.role === 'super_admin').length} / ${users.filter(u => u.role === 'supervisor').length}`, color: '#22c55e', pct: totalUsersCount > 0 ? ((users.filter(u => u.role === 'admin' || u.role === 'super_admin').length + users.filter(u => u.role === 'supervisor').length) / totalUsersCount) * 100 : 0 },
                { label: 'Standard Users', value: users.filter(u => u.role === 'standard_user').length, color: '#f59e0b', pct: totalUsersCount > 0 ? (users.filter(u => u.role === 'standard_user').length / totalUsersCount) * 100 : 0 },
                { label: 'Online Now', value: onlineCount, color: '#14b8a6', pct: totalUsersCount > 0 ? (onlineCount / totalUsersCount) * 100 : 0 },
              ] : [
                { label: 'Total Leads', value: safeCrmData.length, color: '#6366f1', pct: safeCrmData.length > 0 ? Math.min((safeCrmData.length / 100) * 100, 100) : 0 },
                { label: 'Campaigns', value: safeCampaigns.length, color: '#22c55e', pct: safeCampaigns.length > 0 ? Math.min((safeCampaigns.length / 10) * 100, 100) : 0 },
                { label: 'Conversion', value: '11%', color: '#f59e0b', pct: 11 },
                { label: 'Revenue', value: '$2,994', color: '#14b8a6', pct: 60 },
              ]).map((stat, i) => (
                <div key={i} style={{ padding: '20px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: t.textMuted }}>{stat.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  </div>
                  {/* Bar Graph Graphic */}
                  <div style={{ width: '100%', height: '6px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${stat.pct}%`, height: '100%', background: stat.color, borderRadius: '3px', transition: 'width 1s ease-in-out' }} />
                  </div>
                </div>
              ))}
            </div>

            {activeView === 'pipeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 20px', 
                  background: t.card, 
                  borderRadius: '16px', 
                  border: `1px solid ${t.border}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ fontSize: '0.8rem', color: t.textSecondary, fontWeight: 700, letterSpacing: '0.02em' }}>PIPELINE DISPLAY:</span>
                  <div style={{ display: 'flex', background: t.bg, borderRadius: '10px', padding: '4px' }}>
                    <button 
                      onClick={() => setPipelineFitMode(false)}
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        background: !pipelineFitMode ? '#6366f1' : 'transparent', 
                        color: !pipelineFitMode ? '#fff' : t.textMuted,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        transition: 'all 0.2s'
                      }}
                    >
                      Scrolling
                    </button>
                    <button 
                      onClick={() => setPipelineFitMode(true)}
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        background: pipelineFitMode ? '#6366f1' : 'transparent', 
                        color: pipelineFitMode ? '#fff' : t.textMuted,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        transition: 'all 0.2s'
                      }}
                    >
                      Fit to Screen
                    </button>
                  </div>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: pipelineFitMode 
                    ? `repeat(${PIPELINE_STAGES.length}, 1fr)` 
                    : `repeat(${PIPELINE_STAGES.length}, minmax(320px, 1fr))`, 
                  gap: pipelineFitMode ? '8px' : '16px', 
                  overflowX: pipelineFitMode ? 'hidden' : 'auto', 
                  paddingBottom: '20px' 
                }}>
                {leadsPerStage.map((stage, idx) => {
                  const isActive = phaseSettings?.[stage.id];
                  const columnBg = idx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)');

                  return (
                    <div
                      key={stage.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                          const leadId = e.dataTransfer.getData('leadId');
                          handleUpdateLeadStage(leadId, stage.id);
                      }}
                      style={{ 
                        minWidth: pipelineFitMode ? '0' : '320px', 
                        background: columnBg, 
                        padding: pipelineFitMode ? '8px' : '16px', 
                        borderRadius: '12px', 
                        transition: 'all 0.3s', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: pipelineFitMode ? '8px' : '16px',
                        fontSize: pipelineFitMode ? '0.9em' : '1em'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: t.textSecondary, letterSpacing: '0.05em' }}>{stage.label.toUpperCase()}</span>
                        <div onClick={() => togglePhase(stage.id)} style={{ width: 28, height: 14, background: isActive ? stage.color : t.barBg, borderRadius: 10, cursor: 'pointer', position: 'relative' }}>
                          <div style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: isActive ? 16 : 2, transition: '0.2s' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stage.leads.map(lead => (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('leadId', lead.id)}
                            onClick={() => handleSelectLead(lead)}
                            style={{ padding: '12px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', cursor: 'grab', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lead.name}</div>
                            <div style={{ fontSize: '0.7rem', color: t.textSecondary }}>{lead.industry}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

            {activeView === 'agents' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {(dashboardAgents || []).map((agent, i) => {
                  const status = getStatusStyle(agent.status);
                  return (
                    <div key={i} style={{ padding: '24px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{agent.name}</div>
                          <div style={{ fontSize: '0.75rem', color: t.textMuted }}>Last active: {agent.lastRun}</div>
                        </div>
                        <div style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: status.bg, color: status.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {status.label}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                        <div style={{ padding: '12px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderFaint}` }}>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: '4px' }}>Processed</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{agent.processed}</div>
                        </div>
                        <div style={{ padding: '12px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderFaint}` }}>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: '4px' }}>Efficiency</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>98.2%</div>
                        </div>
                      </div>

                      <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                        <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${t.borderSubtle}`, background: 'transparent', color: t.textSecondary, cursor: 'pointer', fontSize: '0.8rem' }}>Logs</button>
                        <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'rgba(99,102,241,0.1)', color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Configure</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeView === 'jobqueue' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.02em' }}>Job Queue</span>
                  <div style={{ padding: '4px 12px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
                    {safeCampaigns.filter(c => c.status === 'queued' || c.status === 'scheduled').length} Pending
                  </div>
                </div>

                {safeCampaigns.filter(c => c.status === 'queued' || c.status === 'scheduled').length === 0 ? (
                  <div style={{ padding: '60px 40px', textAlign: 'center', background: t.card, borderRadius: '16px', border: `1px dashed ${t.border}`, color: t.textMuted }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✅</div>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>Queue is empty</div>
                    <div style={{ fontSize: '0.85rem' }}>Create a campaign to see it appear here before it runs.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {safeCampaigns.filter(c => c.status === 'queued' || c.status === 'scheduled').map(camp => {
                      const isQueued = camp.status === 'queued';
                      return (
                        <div key={camp.id} style={{ padding: '24px', background: t.card, border: `2px solid ${isQueued ? 'rgba(34,197,94,0.4)' : 'rgba(99,102,241,0.4)'}`, borderRadius: '16px', position: 'relative', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = isQueued ? '#22c55e' : '#6366f1'} onMouseLeave={e => e.currentTarget.style.borderColor = isQueued ? 'rgba(34,197,94,0.4)' : 'rgba(99,102,241,0.4)'}>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(camp.id); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.5, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5} title="Remove from Queue">🗑️</button>

                          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', paddingRight: '28px' }}>{camp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: t.textSecondary, marginBottom: '12px' }}>
                            {camp.industry?.label || camp.niche} • {camp.geography?.city || (typeof camp.geography === 'string' ? camp.geography : 'Remote')}
                          </div>

                          <div style={{ padding: '12px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.borderFaint}`, marginBottom: '16px' }}>
                            {isQueued ? (
                              <>
                                <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: '4px' }}>STATUS</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
                                  <span>🚀</span>
                                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Orbis Sales Engine</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: '4px' }}>LAUNCH TIME</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{camp.scheduledDate?.replace('T', ' ') || 'Not set'}</div>
                              </>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleUpdateCampaignStatus(camp.id, 'active')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#16a34a'} onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}>
                              {isQueued ? 'Launch Now' : 'Launch Early'}
                            </button>
                            <button onClick={() => handleUpdateCampaignStatus(camp.id, 'stopped')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid #ef4444`, background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: '0.2s' }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeView === 'campaigns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* All Campaigns */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.02em' }}>Campaigns</div>
                    <button onClick={() => {
                      setEditingCampaignId(null);
                      setNewCampaign({
                        name: '',
                        targetCount: 50,
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        industry: null,
                        services: [],
                        geography: { state: null, county: null, city: null },
                        isScheduled: false,
                        scheduledDate: ''
                      });
                      setModalStep(1);
                      setIsCampaignModalOpen(true);
                    }} style={{ padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>+ New Campaign</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {safeCampaigns.filter(c => c.status !== 'queued' && c.status !== 'scheduled').map(camp => (
                      <div key={camp.id} style={{ padding: '24px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '12px', transition: 'all 0.2s', position: 'relative' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'} onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(camp.id); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>🗑️</button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', paddingRight: '24px' }}>
                          <div style={{ fontWeight: 700 }}>{camp.name}</div>
                          <div style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', background: camp.status === 'active' ? '#22c55e22' : camp.status === 'paused' ? '#f59e0b22' : '#ef444422', color: camp.status === 'active' ? '#22c55e' : camp.status === 'paused' ? '#f59e0b' : '#ef4444', border: `1px solid ${camp.status === 'active' ? '#22c55e44' : camp.status === 'paused' ? '#f59e0b44' : '#ef444444'}` }}>
                            {camp.status}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: t.textSecondary, marginBottom: '16px' }}>
                          {camp.niche || camp.industry?.label} • {camp.geography?.city || (typeof camp.geography === 'string' ? camp.geography : 'Remote')}
                        </div>
                        <div style={{ height: 4, background: t.barBg, borderRadius: 2, overflow: 'hidden', marginBottom: '20px' }}>
                          <div style={{ height: '100%', width: camp.targetCount > 0 ? `${(camp.sent / camp.targetCount) * 100}%` : '0%', background: camp.color }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {camp.status !== 'active' ? (
                            <button onClick={() => handleUpdateCampaignStatus(camp.id, 'active')} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              {camp.status === 'paused' ? 'Continue' : 'Start'}
                            </button>
                          ) : (
                            <button onClick={() => handleUpdateCampaignStatus(camp.id, 'paused')} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              Pause
                            </button>
                          )}
                          <button onClick={() => handleUpdateCampaignStatus(camp.id, 'stopped')} disabled={camp.status === 'stopped'} style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${camp.status === 'stopped' ? t.borderSubtle : '#ef4444'}`, background: 'transparent', color: camp.status === 'stopped' ? t.textMuted : '#ef4444', cursor: camp.status === 'stopped' ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            Stop
                          </button>
                        </div>

                        <div onClick={() => {
                          setEditingCampaignId(camp.id);
                          setNewCampaign({ ...camp });
                          setModalStep(1);
                          setIsCampaignModalOpen(true);
                        }} style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.7rem', color: t.textMuted, cursor: 'pointer', textDecoration: 'underline' }}>
                          Edit Settings
                        </div>
                      </div>
                    ))}
                    <button onClick={() => {
                      setEditingCampaignId(null);
                      setNewCampaign({
                        name: '',
                        targetCount: 50,
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        industry: null,
                        services: [],
                        geography: { state: null, county: null, city: null },
                        isScheduled: false,
                        scheduledDate: ''
                      });
                      setModalStep(1);
                      setIsCampaignModalOpen(true);
                    }} style={{ padding: '24px', border: `2px dashed ${t.border}`, background: 'transparent', borderRadius: '12px', color: t.textMuted, cursor: 'pointer', minHeight: '200px' }}>+ Create New Campaign</button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── EMAIL CAMPAIGNS VIEW ─────────────────────────────────── */}
            {activeView === 'emailcampaigns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.02em' }}>Email Campaigns</div>
                    <div style={{ fontSize: '0.85rem', color: t.textMuted, marginTop: '4px' }}>Build multi-step email sequences and assign them to outreach campaigns.</div>
                  </div>
                  <button onClick={() => { setEditingSequenceId(null); setNewSequence(blankSequence()); setActiveEmailStep(1); setIsEmailModalOpen(true); }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                    ✉️ New Email Sequence
                  </button>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Total Sequences', value: emailSequences.length, icon: '📋', color: '#6366f1' },
                    { label: 'Assigned to Campaigns', value: emailSequences.filter(s => s.assignedCampaignId).length, icon: '🔗', color: '#22c55e' },
                    { label: 'Unassigned', value: emailSequences.filter(s => !s.assignedCampaignId).length, icon: '⏳', color: '#f59e0b' },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '20px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: t.textMuted }}>{s.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sequence list */}
                {emailSequences.length === 0 ? (
                  <div style={{ padding: '60px 40px', textAlign: 'center', background: t.card, borderRadius: '16px', border: `2px dashed ${t.border}`, color: t.textMuted }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✉️</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>No Email Sequences Yet</div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '24px' }}>Create a sequence of 1–5 emails, then assign it to any outreach campaign.</div>
                    <button onClick={() => { setEditingSequenceId(null); setNewSequence(blankSequence()); setActiveEmailStep(1); setIsEmailModalOpen(true); }} style={{ padding: '12px 28px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                      Create First Sequence
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {emailSequences.map(seq => {
                      const assignedCamp = safeCampaigns.find(c => c.id === seq.assignedCampaignId);
                      return (
                        <div key={seq.id} style={{ padding: '24px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '16px', transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'} onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                            {/* Left — name + step pills */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{seq.name}</div>
                                <div style={{ padding: '3px 10px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                  {seq.emails.length} Email{seq.emails.length > 1 ? 's' : ''}
                                </div>
                              </div>
                              {/* Step previews */}
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {seq.emails.map((email, i) => (
                                  <div key={i} style={{ padding: '8px 12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', minWidth: '160px' }}>
                                    <div style={{ fontSize: '0.65rem', color: t.textMuted, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      Email {i + 1}{i > 0 ? ` · Day ${email.delayDays}` : ' · Send immediately'}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                      {email.subject || <span style={{ color: t.textMuted, fontStyle: 'italic' }}>No subject</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right — assignment + actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '240px' }}>
                              {/* Campaign assignment dropdown */}
                              <div style={{ width: '100%' }}>
                                <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Campaign</div>
                                <select
                                  value={seq.assignedCampaignId || ''}
                                  onChange={e => assignSequenceToCampaign(seq.id, e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                                >
                                  <option value=''>— Unassigned —</option>
                                  {safeCampaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                              {assignedCamp && (
                                <div style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(34,197,94,0.2)', width: '100%', textAlign: 'center' }}>
                                  ✓ Active in: {assignedCamp.name}
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                <button onClick={() => {
                                  setEditingSequenceId(seq.id);
                                  setNewSequence({ ...seq, emails: seq.emails.map(e => ({ ...e })) });
                                  setActiveEmailStep(1);
                                  setIsEmailModalOpen(true);
                                }} style={{ flex: 1, padding: '8px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', color: t.textSecondary, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                  ✏️ Edit
                                </button>
                                <button onClick={() => deleteEmailSequence(seq.id)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #ef444440', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── EMAIL SEQUENCE MODAL ─────────────────────────────────── */}
            {isEmailModalOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
                <div style={{ background: t.card, borderRadius: '20px', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', border: `1px solid ${t.border}` }}>
                  {/* Modal Header */}
                  <div style={{ padding: '24px 28px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{editingSequenceId ? '✏️ Edit Email Sequence' : '✉️ New Email Sequence'}</div>
                      <div style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: '2px' }}>Define up to 5 emails with subject, body, and send timing.</div>
                    </div>
                    <button onClick={() => { setIsEmailModalOpen(false); setEditingSequenceId(null); }} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>✕</button>
                  </div>

                  <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left panel — meta + step tabs */}
                    <div style={{ width: '240px', borderRight: `1px solid ${t.border}`, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', background: t.bg }}>
                      {/* Sequence name */}
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Sequence Name</label>
                        <input
                          value={newSequence.name}
                          onChange={e => setNewSequence(s => ({ ...s, name: e.target.value }))}
                          placeholder='e.g. Home Service Cold Outreach'
                          style={{ width: '100%', padding: '10px 12px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Number of emails — 3 to 5 */}
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Email Count (3–5)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {[3, 4, 5].map(n => (
                            <button key={n} onClick={() => handleSequenceStepCountChange(n)} style={{ padding: '10px 0', borderRadius: '8px', border: `2px solid ${newSequence.steps === n ? '#6366f1' : t.borderSubtle}`, background: newSequence.steps === n ? 'rgba(99,102,241,0.15)' : 'transparent', color: newSequence.steps === n ? '#818cf8' : t.textMuted, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.15s' }}>
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AutoWriteEmail™ Toggle */}
                      <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))', borderRadius: '12px', border: `1px solid ${newSequence.autoWriteEmail ? 'rgba(99,102,241,0.3)' : t.borderSubtle}`, marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AutoWriteEmail™</span>
                          <div onClick={() => setNewSequence({ ...newSequence, autoWriteEmail: !newSequence.autoWriteEmail })} style={{ width: 44, height: 22, background: newSequence.autoWriteEmail ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : t.barBg, borderRadius: 11, cursor: 'pointer', position: 'relative', transition: '0.3s' }}>
                            <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: newSequence.autoWriteEmail ? 25 : 3, transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: t.textMuted, lineHeight: 1.4 }}>
                          {newSequence.autoWriteEmail 
                            ? "✨ AI will automatically populate and personalize every lead's outreach." 
                            : "⚪ Manual sequence management enabled."}
                        </div>
                      </div>

                      {/* ✨ AI Generate Panel */}
                      <div style={{ borderRadius: '10px', border: `1px solid ${aiPanelOpen ? '#6366f1' : t.borderSubtle}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                        <button onClick={() => setAiPanelOpen(p => !p)} style={{ width: '100%', padding: '10px 14px', background: aiPanelOpen ? 'rgba(99,102,241,0.1)' : 'transparent', border: 'none', color: aiPanelOpen ? '#818cf8' : t.textSecondary, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                          <span>✨ Generate with AI</span>
                          <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{aiPanelOpen ? '▲' : '▼'}</span>
                        </button>
                        {aiPanelOpen && (
                          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: `1px solid ${t.borderSubtle}` }}>
                            {[['industry', 'Industry', 'e.g. HVAC, Dental, Roofing'], ['pain_point_signal', 'Pain Point', 'e.g. poor website visibility'], ['primary_outcome', 'Primary Outcome', 'e.g. more leads from Google'], ['secondary_outcome', 'Secondary Outcome (opt.)', 'e.g. save on marketing costs'], ['sender_name', 'Your Name', 'e.g. Alex Smith'], ['sender_company', 'Company', 'Orbis Outreach - BPS']].map(([field, label, placeholder]) => (
                              <div key={field}>
                                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: '3px' }}>{label}</label>
                                <input
                                  value={aiInputs[field]}
                                  onChange={e => setAiInputs(prev => ({ ...prev, [field]: e.target.value }))}
                                  placeholder={placeholder}
                                  style={{ width: '100%', padding: '7px 10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '6px', color: t.text, fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                              </div>
                            ))}

                            {/* Provider & Model Selection */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: '3px' }}>Provider</label>
                                <select
                                  value={aiInputs.provider}
                                  onChange={e => setAiInputs(prev => ({ 
                                    ...prev, 
                                    provider: e.target.value,
                                    model: e.target.value === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620'
                                  }))}
                                  style={{ width: '100%', padding: '7px 8px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '6px', color: t.text, fontSize: '0.78rem', outline: 'none' }}
                                >
                                  <option value="anthropic">Anthropic</option>
                                  <option value="openai">OpenAI</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: '3px' }}>Model</label>
                                <select
                                  value={aiInputs.model}
                                  onChange={e => setAiInputs(prev => ({ ...prev, model: e.target.value }))}
                                  style={{ width: '100%', padding: '7px 8px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '6px', color: t.text, fontSize: '0.78rem', outline: 'none' }}
                                >
                                  {aiInputs.provider === 'anthropic' ? (
                                    <>
                                      <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                      <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="gpt-4o">GPT-4o</option>
                                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            </div>

                            {aiGenError && <div style={{ fontSize: '0.72rem', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', padding: '8px 10px', borderRadius: '6px' }}>{aiGenError}</div>}

                            <button
                              onClick={generateEmailsWithAI}
                              disabled={aiGenerating || !aiInputs.industry || !aiInputs.pain_point_signal || !aiInputs.primary_outcome}
                              style={{ padding: '10px', borderRadius: '8px', border: 'none', background: aiGenerating ? t.borderSubtle : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: aiGenerating ? t.textMuted : '#fff', cursor: aiGenerating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s', boxShadow: aiGenerating ? 'none' : '0 3px 10px rgba(99,102,241,0.35)' }}
                            >
                              {aiGenerating ? `⏳ Generating ${newSequence.steps} emails…` : `✨ Generate ${newSequence.steps} Emails`}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Step navigation */}
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Steps</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {newSequence.emails.map((email, i) => (
                             <button key={i} onClick={() => setActiveEmailStep(i + 1)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${activeEmailStep === i + 1 ? '#6366f1' : t.borderSubtle}`, background: activeEmailStep === i + 1 ? 'rgba(99,102,241,0.1)' : 'transparent', color: activeEmailStep === i + 1 ? '#818cf8' : t.textSecondary, cursor: 'pointer', textAlign: 'left', fontSize: '0.82rem', fontWeight: activeEmailStep === i + 1 ? 700 : 500 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Email {i + 1}</span>
                                {newSequence.autoWriteEmail && <span style={{ fontSize: '0.6rem', padding: '2px 4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '4px', fontWeight: 800 }}>AUTO</span>}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {email.subject || 'No subject yet'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Campaign assignment */}
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Assign to Campaign</label>
                        <select
                          value={newSequence.assignedCampaignId || ''}
                          onChange={e => setNewSequence(s => ({ ...s, assignedCampaignId: e.target.value || null }))}
                          style={{ width: '100%', padding: '10px 12px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text, fontSize: '0.82rem', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value=''>— None —</option>
                          {safeCampaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Right panel — email editor */}
                    <div style={{ flex: 1, padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {newSequence.emails.map((email, i) => activeEmailStep === i + 1 && (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: `1px solid ${t.borderSubtle}` }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>{i + 1}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Email {i + 1}</div>
                              <div style={{ fontSize: '0.78rem', color: t.textMuted }}>{i === 0 ? 'Sent immediately when campaign launches' : `Sent ${email.delayDays} day${email.delayDays !== 1 ? 's' : ''} after previous email`}</div>
                            </div>
                          </div>

                          {/* Delay (for steps > 1) */}
                          {i > 0 && (
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: t.textSecondary, display: 'block', marginBottom: '6px' }}>Send delay (days after previous email)</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 5, 7, 10, 14].map(d => (
                                  <button key={d} onClick={() => handleEmailFieldChange(i, 'delayDays', d)} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${email.delayDays === d ? '#6366f1' : t.borderSubtle}`, background: email.delayDays === d ? 'rgba(99,102,241,0.12)' : 'transparent', color: email.delayDays === d ? '#818cf8' : t.textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: '0.15s' }}>
                                    +{d}d
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Subject line */}
                          <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: t.textSecondary, display: 'block', marginBottom: '6px' }}>Subject Line</label>
                            <input
                              value={email.subject}
                              onChange={e => handleEmailFieldChange(i, 'subject', e.target.value)}
                              placeholder='e.g. Quick question about your website...'
                              style={{ width: '100%', padding: '12px 14px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                            <div style={{ fontSize: '0.7rem', color: email.subject.length > 50 ? '#ef4444' : t.textMuted, marginTop: '4px', textAlign: 'right' }}>{email.subject.length}/50 chars recommended</div>
                          </div>

                          {/* Body */}
                          <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: t.textSecondary, display: 'block', marginBottom: '6px' }}>Email Body</label>
                            <textarea
                              value={email.body}
                              onChange={e => handleEmailFieldChange(i, 'body', e.target.value)}
                              placeholder={'Hi {{first_name}},\n\nI came across {{business_name}} while looking at local businesses in {{city}}...\n\n[Your personalized message here]\n\nBest,\n{{agent_name}}'}
                              rows={12}
                              style={{ width: '100%', padding: '14px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, fontSize: '0.85rem', fontFamily: "'Inter', monospace", outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                            />
                            <div style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: '4px' }}>
                              Available variables: <code style={{ background: t.borderFaint, padding: '1px 5px', borderRadius: '3px' }}>{'{{first_name}}'}</code> <code style={{ background: t.borderFaint, padding: '1px 5px', borderRadius: '3px' }}>{'{{business_name}}'}</code> <code style={{ background: t.borderFaint, padding: '1px 5px', borderRadius: '3px' }}>{'{{city}}'}</code> <code style={{ background: t.borderFaint, padding: '1px 5px', borderRadius: '3px' }}>{'{{agent_name}}'}</code>
                            </div>
                          </div>

                          {/* Navigate steps */}
                          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                            {i > 0 && <button onClick={() => setActiveEmailStep(i)} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', color: t.textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>← Previous Email</button>}
                            {i < newSequence.steps - 1 && <button onClick={() => setActiveEmailStep(i + 2)} style={{ padding: '10px 20px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#818cf8', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Next Email →</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div style={{ padding: '20px 28px', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.bg }}>
                    <div style={{ fontSize: '0.82rem', color: t.textMuted }}>
                      {newSequence.name ? `"${newSequence.name}" · ${newSequence.steps} email${newSequence.steps > 1 ? 's' : ''}` : 'Name your sequence to save it'}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => { setIsEmailModalOpen(false); setEditingSequenceId(null); }} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textSecondary, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                      <button onClick={saveEmailSequence} disabled={!newSequence.name} style={{ padding: '10px 24px', background: newSequence.name ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : t.borderSubtle, color: newSequence.name ? '#fff' : t.textMuted, border: 'none', borderRadius: '10px', cursor: newSequence.name ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.9rem', boxShadow: newSequence.name ? '0 4px 14px rgba(99,102,241,0.4)' : 'none', transition: 'all 0.2s' }}>
                        {editingSequenceId ? '💾 Update Sequence' : '✉️ Save Sequence'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System Performance Dashboard</h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: t.textSecondary, maxWidth: '800px' }}>
                      Real-time monitoring of the Autonomous Web Sales Engine. Tracking financial health, agent efficiency, and infrastructure stability.
                    </p>
                  </div>
                  <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', border: `1px solid rgba(34, 197, 94, 0.2)`, borderRadius: '12px', fontSize: '0.85rem', color: '#22c55e', fontWeight: 700 }}>
                    System Status: Normal
                  </div>
                </div>

                {/* Full-width GSC Card */}
                <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🔍</span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Google Search Console</h3>
                    </div>
                    <div style={{ padding: '6px 14px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', fontSize: '0.8rem', color: '#6366f1', fontWeight: 700 }}>
                      Connected
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    <div style={{ padding: '24px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                      <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Clicks</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>12.4K</div>
                      <div style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginTop: '8px' }}>↑ 14% vs last month</div>
                    </div>
                    
                    <div style={{ padding: '24px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                      <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Impressions</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7' }}>245K</div>
                      <div style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginTop: '8px' }}>↑ 8% vs last month</div>
                    </div>
                    
                    <div style={{ padding: '24px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                      <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Avg. CTR</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>5.1%</div>
                      <div style={{ fontSize: '0.8rem', color: t.textMuted, fontWeight: 600, marginTop: '8px' }}>Stable</div>
                    </div>
                    
                    <div style={{ padding: '24px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                      <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Average Position</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>14.2</div>
                      <div style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginTop: '8px' }}>↑ 1.5 spots</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  {/* Card 1: Financial Performance */}
                  <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Financial Performance</h3>
                      <span style={{ fontSize: '1.5rem' }}>💰</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Total Revenue (MTD)</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>
                          ${safeCrmData.filter(l => l.paymentStatus === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Projected MRR</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>$12,450</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>API Cost/Lead</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>$0.42</div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px' }}>
                          <span>Cost vs Revenue Efficiency</span>
                          <span style={{ color: '#6366f1' }}>94%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: t.borderSubtle, borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Agent Efficiency */}
                  <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Agent Efficiency</h3>
                      <span style={{ fontSize: '1.5rem' }}>🤖</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', background: `conic-gradient(#6366f1 82%, ${t.borderSubtle} 0)` }}>
                          <div style={{ position: 'absolute', width: '64px', height: '64px', background: t.card, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem', fontWeight: 800 }}>82%</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Conversion Rate</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Optimal</div>
                          <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>+12% vs last month</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {[
                          { label: 'Scout Volume', val: 1240, color: '#6366f1', unit: 'leads' },
                          { label: 'Outreach Velocity', val: 85, color: '#a855f7', unit: 'emails/hr' },
                          { label: 'Avg Time to Close', val: 12, color: '#f59e0b', unit: 'days' }
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <span style={{ color: t.textSecondary }}>{item.label}</span>
                            <span style={{ fontWeight: 700 }}>{item.val.toLocaleString()} <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 500 }}>{item.unit}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Infrastructure Health */}
                  <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Infrastructure</h3>
                      <span style={{ fontSize: '1.5rem' }}>⚡</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>
                          <span>Global API Connectivity</span>
                          <span style={{ color: '#22c55e' }}>{activeApisCount} / {totalApisCount} Active</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {Object.keys(API_COST_MODELS || {}).map(id => (
                            <div key={id} style={{ flex: 1, height: '6px', background: apiKeys[id] ? '#22c55e' : t.borderSubtle, borderRadius: '3px' }} title={id} />
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                        <div style={{ padding: '12px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                          <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Avg Latency</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700 }}>240ms</div>
                        </div>
                        <div style={{ padding: '12px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                          <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Job Queue</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700 }}>Empty</div>
                        </div>
                      </div>

                      <div style={{ padding: '16px', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px dashed rgba(99,102,241,0.3)', fontSize: '0.75rem', color: t.textSecondary }}>
                        <div style={{ fontWeight: 800, color: '#6366f1', marginBottom: '4px' }}>AI SCALING ADVICE</div>
                        Infrastructure is under-utilized. Recommended: Increase target lead count by 25%.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>API Integration Hub</h2>
                  <div style={{ padding: '8px 16px', background: 'rgba(99,102,241,0.1)', border: `1px solid ${t.border}`, borderRadius: '12px', fontSize: '0.85rem', color: t.textSecondary }}>
                    Current Usage Density: <span style={{ color: '#6366f1', fontWeight: 700 }}>Optimal</span>
                  </div>
                </div>

                {/* LLMs Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6366f1' }}>LLMs</h3>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(99,102,241,0.2), transparent)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
                    {['openai', 'claude', 'runware'].map(renderApiCard)}
                  </div>
                </div>

                {/* Other Services Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textSecondary }}>Service Providers</h3>
                    <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${t.border}, transparent)` }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
                    {[
                      'dataseo', 'pagespeed', 'google_places', 'hunter', 'instantly', 
                      'reoon', 'twilio', 'stripe', 'whatsapp', 'resend',
                      'linkedin', 'facebook', 'instagram',
                      'gtmetrix', 'pingdom'
                    ].map(renderApiCard)}
                  </div>
                </div>

                <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '24px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ fontSize: '3rem' }}>🔒</div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0' }}>End-to-End Encryption</h3>
                      <p style={{ margin: 0, color: t.textSecondary, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        All API keys are stored securely in your dashboard&apos;s local vault. Keys are never transmitted to our telemetry servers and are only used for direct agent communication with the respective service providers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'users' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>User Management</h2>
                  <button 
                    onClick={() => { setEditingUser(null); setNewUser({ name: '', email: '', username: '', role: 'standard_user', status: 'Offline' }); setIsUserModalOpen(true); }}
                    style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>+</span> Add User
                  </button>
                </div>

                <div style={{ padding: '24px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: `1px solid ${t.border}` }}>
                        <th style={{ padding: '16px', color: t.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>IDENTITY</th>
                        <th style={{ padding: '16px', color: t.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>ROLE</th>
                        <th style={{ padding: '16px', color: t.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>STATUS</th>
                        <th style={{ padding: '16px', color: t.textMuted, fontSize: '0.8rem', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: `1px solid ${t.borderSubtle}` }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {u.name?.split(' ').map(n=>n[0]).join('') || 'U'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {u.name}
                                  {u.isOnline && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} title="Online" />}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: t.textMuted }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: u.role === 'super_admin' || u.role === 'admin' ? 'rgba(99,102,241,0.1)' : (u.role === 'supervisor' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)'), color: u.role === 'super_admin' || u.role === 'admin' ? '#6366f1' : (u.role === 'supervisor' ? '#f59e0b' : t.textMuted) }}>
                              {RBAC.roles[u.role]?.name || u.role}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ padding: '4px 12px', background: u.status === 'BLOCKED' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: u.status === 'BLOCKED' ? '#ef4444' : '#22c55e', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {u.status === 'BLOCKED' ? 'Blocked' : 'Unblocked'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button onClick={() => { setEditingUser(u); setNewUser({ name: u.fullName || u.name, username: u.username, email: u.email, role: u.role, status: u.status }); setIsUserModalOpen(true); }} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', color: t.text, marginRight: '8px' }}>Edit</button>
                              {(!ui_restrictions?.hide_delete_button && u.role !== 'super_admin' && permissions?.users?.[`can_delete_${u.role === 'super_admin' ? 'admin' : (u.role === 'standard_user' ? 'standard' : u.role)}`]) && (
                                <button onClick={() => usersApi.delete(u.id).then(() => usersApi.list().then(setUsers))} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444' }}>Delete</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'system' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', alignItems: 'start' }}>
                <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', gridColumn: 'span 4' }}>
                  <div onClick={() => setIsGscAccordionOpen(!isGscAccordionOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>Google Search Console {isGscAccordionOpen ? '▴' : '▾'}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: t.textMuted }}>Configure Google Search Console API metrics and tracking</p>
                    </div>
                  </div>

                  {isGscAccordionOpen && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ padding: '24px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: t.textMuted, marginBottom: '8px' }}>CLIENT EMAIL</label>
                            <input
                              type="text"
                              placeholder="gsc-service-account@project.iam.gserviceaccount.com"
                              value={apiKeys.gsc_client_email || ''}
                              onChange={e => handleSaveApiKey('gsc_client_email', e.target.value)}
                              style={{ width: '100%', padding: '12px 16px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none', transition: 'all 0.2s', fontSize: '0.9rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: t.textMuted, marginBottom: '8px' }}>PROPERTY URI</label>
                            <input
                              type="text"
                              placeholder="sc-domain:example.com or https://example.com"
                              value={apiKeys.gsc_property_uri || ''}
                              onChange={e => handleSaveApiKey('gsc_property_uri', e.target.value)}
                              style={{ width: '100%', padding: '12px 16px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none', transition: 'all 0.2s', fontSize: '0.9rem' }}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: t.textMuted, marginBottom: '8px' }}>PRIVATE KEY (JSON FILE)</label>
                            <textarea
                              placeholder='{"type": "service_account", "project_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n", ...}'
                              value={apiKeys.gsc_private_key || ''}
                              onChange={e => handleSaveApiKey('gsc_private_key', e.target.value)}
                              style={{ width: '100%', height: '120px', padding: '12px 16px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none', transition: 'all 0.2s', fontSize: '0.85rem', fontFamily: 'monospace', resize: 'vertical' }}
                            />
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: t.textSecondary }}>
                              Paste the <strong>entire</strong> contents of the JSON credentials file downloaded from Google Cloud Console.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px' }}>
                  <div onClick={() => setIsSystemAccordionOpen(!isSystemAccordionOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Categories and Service {isSystemAccordionOpen ? '▴' : '▾'}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: t.textMuted }}>Manage global settings and data overrides</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {customCategories && (
                        <button onClick={(e) => { e.stopPropagation(); handleClearCategories(); }} style={{ padding: '8px 16px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Clear Custom Overrides</button>
                      )}
                    </div>
                  </div>

                  {isSystemAccordionOpen && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ padding: '24px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1' }}>IMPORT CATEGORIES & SERVICES (JSON)</label>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted }}>Expects: {"{\"Category\": [\"Service 1\", ...]}"}</div>
                        </div>

                        <textarea
                          value={importJsonText}
                          onChange={e => setImportJsonText(e.target.value)}
                          placeholder='{ "Plumbing": ["Leak Repair", "Drain Cleaning"], "Electrical": ["Rewiring", "Panel Upgrade"] }'
                          style={{ width: '100%', height: '200px', padding: '16px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none', marginBottom: '16px', resize: 'vertical' }}
                        />

                        {importError && (
                          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <strong>Import Error:</strong> {importError}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={handleImportCategories}
                            disabled={!importJsonText}
                            style={{ flex: 1, padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: importJsonText ? 1 : 0.5, transition: 'all 0.2s' }}
                          >
                            Process & Import Text
                          </button>

                          <div style={{ flex: 1, position: 'relative' }}>
                            <input
                              type="file"
                              id="category-upload"
                              accept=".json,application/json"
                              onChange={handleFileUpload}
                              style={{ display: 'none' }}
                            />
                            <button
                              onClick={() => document.getElementById('category-upload').click()}
                              style={{ width: '100%', padding: '14px', background: 'transparent', color: '#6366f1', border: '2px solid #6366f1', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Upload JSON File
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
                        {[
                          { title: 'Data Format', desc: 'Paste a JSON object with category names as keys.' },
                          { title: 'Validation', desc: 'Click process to validate and save to local storage.' },
                          { title: 'Deployment', desc: 'Modified categories will appear in the Campaign Wizard.' }
                        ].map((step, i) => (
                          <div key={i} style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderFaint}` }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: t.textMuted, marginBottom: '8px' }}>STEP {i + 1}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{step.title}</div>
                            <div style={{ fontSize: '0.75rem', color: t.textSecondary }}>{step.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px' }}>
                  <div onClick={() => setIsLocationsAccordionOpen(!isLocationsAccordionOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Locations {isLocationsAccordionOpen ? '▴' : '▾'}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: t.textMuted }}>Manage custom geographic data and municipality overrides</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {customLocations && (
                        <button onClick={(e) => { e.stopPropagation(); handleClearLocations(); }} style={{ padding: '8px 16px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Clear Custom Overrides</button>
                      )}
                    </div>
                  </div>

                  {isLocationsAccordionOpen && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ padding: '24px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1' }}>IMPORT LOCATIONS (JSON ARRAY)</label>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted }}>Expects: {"[{\"state\": \"NY\", \"municipality\": \"...\"}, ...]"}</div>
                        </div>

                        <textarea
                          value={importLocationsText}
                          onChange={e => setImportLocationsText(e.target.value)}
                          placeholder='[{"state": "New York", "county": "Albany County", "municipality": "Albany", "type": "city"}]'
                          style={{ width: '100%', height: '200px', padding: '16px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none', marginBottom: '16px', resize: 'vertical' }}
                        />

                        {importLocationsError && (
                          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <strong>Import Error:</strong> {importLocationsError}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={handleImportLocations}
                            disabled={!importLocationsText}
                            style={{ flex: 1, padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: importLocationsText ? 1 : 0.5, transition: 'all 0.2s' }}
                          >
                            Process & Import Text
                          </button>

                          <div style={{ flex: 1, position: 'relative' }}>
                            <input
                              type="file"
                              id="location-upload"
                              accept=".json,application/json"
                              onChange={handleLocationFileUpload}
                              style={{ display: 'none' }}
                            />
                            <button
                              onClick={() => document.getElementById('location-upload').click()}
                              style={{ width: '100%', padding: '14px', background: 'transparent', color: '#6366f1', border: '2px solid #6366f1', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Upload JSON File
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
                        {[
                          { title: 'Data Format', desc: 'Paste a JSON array of location objects.' },
                          { title: 'Validation', desc: 'Click process to validate and save to local storage.' },
                          { title: 'Deployment', desc: 'Modified locations will appear in the Campaign Wizard.' }
                        ].map((step, i) => (
                          <div key={i} style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderFaint}` }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: t.textMuted, marginBottom: '8px' }}>STEP {i + 1}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{step.title}</div>
                            <div style={{ fontSize: '0.75rem', color: t.textSecondary }}>{step.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px' }}>
                  <div onClick={() => setIsWorkflowTestAccordionOpen(!isWorkflowTestAccordionOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>Workflow Test (Diagnostic) {isWorkflowTestAccordionOpen ? '▴' : '▾'}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: t.textMuted }}>Inject one or more business URLs to test the entire E2E pipeline</p>
                    </div>
                  </div>

                  {isWorkflowTestAccordionOpen && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ padding: '24px', background: 'rgba(245,158,11,0.05)', borderRadius: '16px', border: `1px solid rgba(245,158,11,0.2)` }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: '12px' }}>TARGET BUSINESS URL(S)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <textarea 
                            value={workflowTestUrl}
                            onChange={e => setWorkflowTestUrl(e.target.value)}
                            placeholder="Enter URLs (one per line or comma-separated)&#10;https://example-plumbing.com&#10;https://city-dental.com" 
                            style={{ width: '100%', minHeight: '100px', padding: '14px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                          />
                          <button 
                            onClick={handleRunWorkflowTest}
                            disabled={isWorkflowTesting || !workflowTestUrl.trim()}
                            style={{ alignSelf: 'flex-end', padding: '12px 32px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: (isWorkflowTesting || !workflowTestUrl.trim()) ? 0.5 : 1 }}
                          >
                            {isWorkflowTesting ? 'Firing Up...' : 'Run E2E Test'}
                          </button>
                        </div>
                        <p style={{ marginTop: '16px', fontSize: '0.75rem', color: t.textMuted }}>
                          <strong>Note:</strong> This creates a temporary diagnostic campaign and lead. 
                          The <strong>Scout Agent</strong> will pick it up immediately.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'crm' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="text" placeholder="Search leads by name, email or company..." value={crmSearchTerm} onChange={e => setCrmSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 40px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, outline: 'none' }} />
                    <span style={{ position: 'absolute', left: '14px', top: '12px', opacity: 0.5 }}>🔍</span>
                  </div>
                  <select value={crmFilterStage} onChange={e => setCrmFilterStage(e.target.value)} style={{ padding: '12px 16px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, outline: 'none', cursor: 'pointer' }}>
                    <option value="all">All Stages</option>
                    {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: '16px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: t.bg, borderBottom: `1px solid ${t.border}` }}>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase' }}>Company</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase' }}>Contact</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase' }}>Stage</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase' }}>Score</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase' }}>Automation</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase' }}>Revenue</th>
                        <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeCrmData
                        .filter(c => {
                          const matchesSearch = !crmSearchTerm ||
                            c.name.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
                            c.contact.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
                            c.email.toLowerCase().includes(crmSearchTerm.toLowerCase());
                          const matchesStage = crmFilterStage === 'all' || c.stage === crmFilterStage;
                          return matchesSearch && matchesStage;
                        }).length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: t.textMuted }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📂</div>
                            <div>No leads found matching your criteria.</div>
                          </td>
                        </tr>
                      ) : (
                        safeCrmData
                          .filter(c => {
                            const matchesSearch = !crmSearchTerm ||
                              c.name.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
                              c.contact.toLowerCase().includes(crmSearchTerm.toLowerCase()) ||
                              c.email.toLowerCase().includes(crmSearchTerm.toLowerCase());
                            const matchesStage = crmFilterStage === 'all' || c.stage === crmFilterStage;
                            return matchesSearch && matchesStage;
                          })
                          .map(c => {
                            const stage = PIPELINE_STAGES.find(s => s.id === c.stage) || PIPELINE_STAGES[0];
                            const scoreColor = c.score > 80 ? '#22c55e' : c.score > 50 ? '#f59e0b' : '#ef4444';

                            return (
                              <React.Fragment key={c.id}>
                                <tr onClick={() => {
                                   const isExpanding = expandedLeadId !== c.id;
                                   setExpandedLeadId(isExpanding ? c.id : null);
                                   if (isExpanding) setEditLeadData({ ...c });
                                 }} style={{ borderBottom: `1px solid ${t.borderSubtle}`, cursor: 'pointer', background: expandedLeadId === c.id ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : 'transparent', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} onMouseLeave={e => e.currentTarget.style.background = expandedLeadId === c.id ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : 'transparent'}>
                                  <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#818cf8', textDecoration: 'underline' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: t.textSecondary }}>{c.website}</div>
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontSize: '0.85rem' }}>{c.contact}</div>
                                    <div style={{ fontSize: '0.7rem', color: t.textMuted }}>{c.email}</div>
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: `${stage.color}22`, color: stage.color, border: `1px solid ${stage.color}44` }}>
                                      {stage.label}
                                    </span>
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '40px', height: '4px', background: t.borderSubtle, borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${c.score}%`, height: '100%', background: scoreColor }} />
                                      </div>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: scoreColor }}>{c.score}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      {[
                                        { key: 'scout', label: 'S' },
                                        { key: 'outreach', label: 'O' },
                                        { key: 'analysis', label: 'A' },
                                        { key: 'design', label: 'D' }
                                      ].map(item => (
                                        <div key={item.key} title={item.key.toUpperCase()} style={{ width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, background: c.automation?.[item.key] ? '#6366f1' : t.borderSubtle, color: c.automation?.[item.key] ? '#fff' : t.textMuted, border: c.automation?.[item.key] ? 'none' : `1px solid ${t.border}` }}>
                                          {item.label}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: c.paymentStatus === 'paid' ? '#22c55e' : t.text }}>
                                      {c.amount ? `$${c.amount.toLocaleString()}` : '-'}
                                    </div>
                                    {c.paymentStatus && <div style={{ fontSize: '0.65rem', color: t.textMuted, textTransform: 'uppercase' }}>{c.paymentStatus}</div>}
                                  </td>
                                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <button style={{ padding: '6px 12px', border: `1px solid ${t.borderSubtle}`, background: t.card, borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s', color: t.text }}>Details</button>
                                  </td>
                                </tr>
                                {expandedLeadId === c.id && (
                                  <tr>
                                    <td colSpan="7" style={{ padding: '0', background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
                                      <div style={{ padding: '32px', borderBottom: `1px solid ${t.border}` }}>
                                        <div style={{ display: 'flex', gap: '24px', borderBottom: `1px solid ${t.borderSubtle}`, marginBottom: '24px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                          {['details', 'performance', 'technical', 'communications', 'journey'].map(tab => (
                                            <button key={tab} onClick={() => setCrmActiveTab(tab)} style={{ padding: '12px 0', border: 'none', background: 'transparent', color: crmActiveTab === tab ? '#6366f1' : t.textMuted, fontWeight: 600, borderBottom: crmActiveTab === tab ? '2px solid #6366f1' : 'none', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                              {tab === 'technical' ? 'Technical Audit' : tab}
                                            </button>
                                          ))}
                                        </div>

                                        {crmActiveTab === 'journey' && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>Automated Agent Journey</div>
                                            {(c.timeline || []).map((event, i) => (
                                              <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                                                {i < c.timeline.length - 1 && <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: '-12px', width: '2px', background: t.borderSubtle }} />}
                                                <div style={{ minWidth: '16px', height: '16px', borderRadius: '50%', background: event.type === 'system' ? '#6366f1' : event.type === 'email' ? '#a855f7' : '#22c55e', marginTop: '4px', zIndex: 1 }} />
                                                <div style={{ paddingBottom: '16px' }}>
                                                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.action}</div>
                                                  <div style={{ fontSize: '0.75rem', color: t.textMuted }}>{event.date} • {event.type.toUpperCase()}</div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {crmActiveTab === 'performance' && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                                              {/* Card 1: Reach & Engagement */}
                                              <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Reach & Engagement</h3>
                                                
                                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                                                  {/* Engagement Gauge */}
                                                  <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', background: `conic-gradient(#6366f1 ${c.engagementScore || 0}%, ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} 0)` }}>
                                                    <div style={{ position: 'absolute', width: '96px', height: '96px', background: t.card, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                      <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{c.engagementScore || 0}%</span>
                                                    </div>
                                                  </div>

                                                  {/* Engagement Metrics */}
                                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '150px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                                                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '12px' }}>● High Engagement</span>
                                                    </div>
                                                    
                                                    {[
                                                      { label: 'Email Open Rate', val: c.emailOpenRate || 0, unit: '%' },
                                                      { label: 'Demo View Time', val: c.demoViewTime || 0, unit: 'm' },
                                                      { label: 'Reply Velocity', val: c.replyVelocity || 0, unit: 'd', inverse: true }
                                                    ].map(item => (
                                                      <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                                                          <span>{item.label}</span>
                                                          <span>{item.val}{item.unit}</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                          <div style={{ width: `${item.inverse ? Math.max(0, 100 - item.val * 10) : item.val}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }} />
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Card 2: Journey Progression */}
                                              <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Journey Progression</h3>
                                                
                                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                                                  {/* Progress Chart */}
                                                  <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', background: `conic-gradient(#22c55e ${c.readinessFactor || 0}%, #f59e0b ${c.churnRisk || 0}%, #ef4444 0%)` }}>
                                                    <div style={{ position: 'absolute', width: '96px', height: '96px', background: t.card, borderRadius: '50%' }} />
                                                  </div>

                                                  {/* Journey Metrics */}
                                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '150px' }}>
                                                    {[
                                                      { label: 'Velocity', sub: 'Days in Stage', val: c.conversionVelocity || 0, color: '#22c55e' },
                                                      { label: 'Churn Risk', sub: 'Drop-off Prob.', val: `${c.churnRisk || 0}%`, color: '#f59e0b' },
                                                      { label: 'Readiness', sub: 'Asset Collection', val: `${c.readinessFactor || 0}%`, color: '#3b82f6' }
                                                    ].map(item => (
                                                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                                            {item.label}
                                                          </div>
                                                          <div style={{ fontSize: '0.7rem', color: t.textMuted, paddingLeft: '16px' }}>{item.sub}</div>
                                                        </div>
                                                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>{item.val}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Card 3: Business Impact (Estimated) */}
                                              <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Business Impact</h3>
                                                  <div style={{ padding: '4px 8px', background: '#22c55e15', color: '#22c55e', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>PROJECTION</div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                                                  {[
                                                    { label: 'Monthly Lead Jump', val: `+${c.monthlyLeadProjection || 0}`, pct: 85, color: '#22c55e', unit: 'Leads' },
                                                    { label: 'ROI Factor', val: `${c.roiFactor || 0}x`, pct: 75, color: '#22c55e', unit: 'Multiplier' },
                                                    { label: 'Automation Savings', val: `${c.automationSavings || 0}h`, pct: 65, color: '#22c55e', unit: 'Hrs / Mo' }
                                                  ].map(item => (
                                                    <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <div>
                                                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</div>
                                                          <div style={{ fontSize: '0.7rem', color: t.textMuted }}>Target {item.unit}</div>
                                                        </div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color }}>{item.val}</div>
                                                      </div>
                                                      <div style={{ width: '100%', height: '10px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${item.pct}%`, height: '100%', background: `linear-gradient(90deg, ${item.color}88, ${item.color})`, borderRadius: '5px' }} />
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Journey AI Summary */}
                                            <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))', border: `1px solid ${t.border}`, borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                              <span style={{ fontSize: '1.5rem' }}>🧠</span>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Lead Sentiment & Next Best Action</div>
                                                <div style={{ fontSize: '0.85rem', color: t.textMuted, lineHeight: 1.5 }}>
                                                  Based on {c.engagementScore}% engagement and a reply velocity of {c.replyVelocity} days, this lead shows **{c.engagementScore > 80 ? 'High Intent' : 'Moderate Interest'}**. 
                                                  Recommended action: {c.stage === 'delivered' ? 'Upsell to Managed SEO services.' : 'Schedule follow-up call to close proposal.'}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {crmActiveTab === 'technical' && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                                              {/* Card 1: Listings Accuracy */}
                                              <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Listings Accuracy</h3>
                                                
                                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                                                  {/* Circular Progress */}
                                                  <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', background: `conic-gradient(#22c55e 72%, ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} 0)` }}>
                                                    <div style={{ position: 'absolute', width: '96px', height: '96px', background: t.card, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                      <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>72%</span>
                                                    </div>
                                                  </div>

                                                  {/* Bars */}
                                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '150px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                                                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '12px' }}>● 72% Accurate</span>
                                                    </div>
                                                    
                                                    {[ { label: 'Business Name', val: 73 }, { label: 'Address', val: 70 }, { label: 'Phone', val: 73 } ].map(item => (
                                                      <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                                                          <span>{item.label}</span>
                                                          <span>{item.val}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                          <div style={{ width: `${item.val}%`, height: '100%', background: '#22c55e', borderRadius: '4px' }} />
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Card 2: Online Health Score */}
                                              <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Online Health Score</h3>
                                                
                                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                                                  {/* Donut Chart */}
                                                  <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', background: 'conic-gradient(#22c55e 0% 67%, #3b82f6 67% 76%, #ef4444 76% 100%)' }}>
                                                    <div style={{ position: 'absolute', width: '96px', height: '96px', background: t.card, borderRadius: '50%' }} />
                                                  </div>

                                                  {/* Legend */}
                                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '150px' }}>
                                                    {[ 
                                                      { label: 'Match', val: '22 / 33', pct: '67%', color: '#22c55e' },
                                                      { label: 'Partial Match', val: '3 / 33', pct: '9%', color: '#3b82f6' },
                                                      { label: 'No Match', val: '8 / 33', pct: '24%', color: '#ef4444' }
                                                    ].map(item => (
                                                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                                            {item.label}
                                                          </div>
                                                          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', paddingLeft: '16px' }}>{item.val}</div>
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color, background: `${item.color}15`, padding: '4px 8px', borderRadius: '8px' }}>{item.pct}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Card 3: Performance Audit (Speed Metrics) */}
                                              <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Site Performance</h3>
                                                  <span style={{ fontSize: '1.3rem' }}>⚡</span>
                                                </div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                  {[
                                                    { label: 'PageSpeed Insights', val: c.pagespeedScore || 42, color: (c.pagespeedScore || 42) > 80 ? '#22c55e' : (c.pagespeedScore || 42) > 50 ? '#f59e0b' : '#ef4444', desc: (c.pagespeedScore || 42) < 50 ? 'Critical: LCP > 2.5s' : 'Good Core Web Vitals' },
                                                    { label: 'GTMetrix Grade', val: c.gtmetrixScore || 56, color: (c.gtmetrixScore || 56) > 80 ? '#22c55e' : (c.gtmetrixScore || 56) > 50 ? '#f59e0b' : '#ef4444', desc: `Grade: ${(c.gtmetrixScore || 56) > 90 ? 'A' : (c.gtmetrixScore || 56) > 80 ? 'B' : (c.gtmetrixScore || 56) > 60 ? 'C' : 'D'} (${(c.gtmetrixScore || 56) > 60 ? 'Acceptable' : 'Poor'})` },
                                                    { label: 'Pingdom Uptime', val: c.pingdomScore || 98, color: (c.pingdomScore || 98) > 99 ? '#22c55e' : (c.pingdomScore || 98) > 95 ? '#f59e0b' : '#ef4444', desc: 'Global Availability Monitoring' }
                                                  ].map(item => (
                                                    <div key={item.label}>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                                        <span>{item.label}</span>
                                                        <span style={{ color: item.color }}>{item.val}%</span>
                                                      </div>
                                                      <div style={{ width: '100%', height: '6px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                                                        <div style={{ width: `${item.val}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
                                                      </div>
                                                      <div style={{ fontSize: '0.7rem', color: t.textMuted }}>{item.desc}</div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {/* AI Optimization Summary */}
                                            <div style={{ padding: '24px', background: 'rgba(99,102,241,0.05)', borderRadius: '20px', border: `1px solid rgba(99,102,241,0.2)` }}>
                                              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>🔧</span> AI Technical Assessment
                                              </div>
                                              <p style={{ margin: 0, fontSize: '0.9rem', color: t.textSecondary, lineHeight: '1.6' }}>
                                                The audit for {c.name} reveals {c.pagespeedScore < 60 ? 'significant technical debt' : 'minor optimization opportunities'}. 
                                                Improving local listings and addressing PageSpeed core web vitals will directly impact conversion.
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {crmActiveTab === 'communications' && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <div style={{ fontWeight: 700 }}>Communication History</div>
                                              <button style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Send New Email</button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                              <div style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Outreach Email #1</span>
                                                  <span style={{ fontSize: '0.75rem', color: t.textMuted }}>2 days ago</span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: t.textSecondary, fontStyle: 'italic' }}>&quot;I noticed your site is losing customers because it takes 4.2s to load on mobile...&quot;</div>
                                              </div>
                                              <div style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Client Replied</span>
                                                  <span style={{ fontSize: '0.75rem', color: t.textMuted }}>1 day ago</span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: t.textSecondary }}>&quot;Interested, show me more&quot;</div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {crmActiveTab === 'activity' && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ fontWeight: 700 }}>Recent Activity</div>
                                            <div style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                                              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Lead viewed proposal</div>
                                              <div style={{ fontSize: '0.75rem', color: t.textMuted }}>3 hours ago</div>
                                            </div>
                                            <div style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                                              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Agent sent follow-up email</div>
                                              <div style={{ fontSize: '0.75rem', color: t.textMuted }}>1 day ago</div>
                                            </div>
                                          </div>
                                        )}

                                        {crmActiveTab === 'details' && editLeadData && (
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Company Name</label>
                                              <input type="text" value={editLeadData.name || ''} onChange={e => setEditLeadData({ ...editLeadData, name: e.target.value })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Website</label>
                                              <input type="text" value={editLeadData.website || ''} onChange={e => setEditLeadData({ ...editLeadData, website: e.target.value })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Main Contact</label>
                                              <input type="text" value={editLeadData.contact || ''} onChange={e => setEditLeadData({ ...editLeadData, contact: e.target.value })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Email Address</label>
                                              <input type="text" value={editLeadData.email || ''} onChange={e => setEditLeadData({ ...editLeadData, email: e.target.value })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Phone Number</label>
                                              <input type="text" value={editLeadData.phone || ''} onChange={e => setEditLeadData({ ...editLeadData, phone: e.target.value })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Complete Address</label>
                                              <input type="text" value={editLeadData.address || ''} onChange={e => setEditLeadData({ ...editLeadData, address: e.target.value })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Google Business (GBP) Link</label>
                                              <input type="text" value={editLeadData.gbpLink || ''} onChange={e => setEditLeadData({ ...editLeadData, gbpLink: e.target.value })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Categories (comma separated)</label>
                                              <input type="text" value={(editLeadData.categories || []).join(', ')} onChange={e => setEditLeadData({ ...editLeadData, categories: e.target.value.split(',').map(s => s.trim()) })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Services (comma separated)</label>
                                              <input type="text" value={(editLeadData.services || []).join(', ')} onChange={e => setEditLeadData({ ...editLeadData, services: e.target.value.split(',').map(s => s.trim()) })} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                                <button onClick={() => handleSaveLeadChanges(c.id)} style={{ padding: '10px 24px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteLead(c.id); }} style={{ padding: '10px 16px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
                                                  Delete Record
                                                </button>
                                              </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: t.textMuted }}>
            Refreshing secure dashboard...
          </div>
        )}
      </main>

      {/* Modals */}
      {isUserModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: t.card, padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '480px', border: `1px solid ${t.border}`, boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 800 }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: t.textMuted }}>FULL NAME</label>
                <input 
                  type="text" 
                  value={newUser.name || newUser.fullName || ''} 
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                  style={{ width: '100%', padding: '12px 16px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: t.textMuted }}>USERNAME</label>
                <input 
                  type="text" 
                  value={newUser.username} 
                  disabled={!!editingUser}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Enter username"
                  style={{ width: '100%', padding: '12px 16px', background: editingUser ? 'rgba(0,0,0,0.1)' : t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: editingUser ? t.textMuted : t.text, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: t.textMuted }}>EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  placeholder="name@agency.com"
                  style={{ width: '100%', padding: '12px 16px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: t.textMuted }}>ROLE</label>
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }}
                  >
                    {permissions?.users?.can_create_admin && <option value="admin">Admin</option>}
                    {permissions?.users?.can_create_supervisor && <option value="supervisor">Supervisor</option>}
                    {permissions?.users?.can_create_standard && <option value="standard_user">Standard User</option>}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: t.textMuted }}>STATUS</label>
                  <select 
                    value={newUser.status} 
                    onChange={e => setNewUser({...newUser, status: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }}
                  >
                    <option value="UNBLOCKED">Unblocked</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setIsUserModalOpen(false)} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: t.text }}>Cancel</button>
                <button onClick={handleSaveUser} style={{ flex: 1, padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>{editingUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        isCampaignModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2,8,23,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsCampaignModalOpen(false)}>
            <div style={{ padding: '0', background: isDark ? '#0f172a' : '#fff', borderRadius: '24px', width: '900px', maxWidth: '95vw', height: 'auto', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: `1px solid ${t.border}`, display: 'flex' }} onClick={e => e.stopPropagation()}>

              {/* Left Column: Form Section */}
              <div style={{ flex: 1, padding: '32px', borderRight: `1px solid ${t.borderSubtle}`, display: 'flex', flexDirection: 'column', height: '90vh', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{editingCampaignId ? 'Edit Campaign' : 'Create Campaign'}</h2>
                  <div style={{ display: 'flex', background: t.bg, borderRadius: '8px', padding: '2px' }}>
                    <button onClick={() => setIsWizard(true)} style={{ padding: '6px 12px', border: 'none', background: isWizard ? '#6366f1' : 'transparent', color: isWizard ? '#fff' : t.textMuted, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>Wizard</button>
                    <button onClick={() => setIsWizard(false)} style={{ padding: '6px 12px', border: 'none', background: !isWizard ? '#6366f1' : 'transparent', color: !isWizard ? '#fff' : t.textMuted, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>Standard</button>
                  </div>
                </div>
                {isWizard && (
                  <div style={{ fontSize: '0.85rem', color: t.textMuted, fontWeight: 600, marginBottom: '24px', textAlign: 'right' }}>Step {modalStep} of 4</div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
                  {(() => {
                    const mergedIndustries = [
                      ...(customCategories ? Object.keys(customCategories)
                        .filter(cat => !['schema_version', 'metadata', 'categories'].includes(cat.toLowerCase()))
                        .map(cat => ({
                          id: cat,
                          label: cat,
                          services: customCategories[cat] || []
                        })) : []),
                      ...CAMPAIGN_DATA.industries.filter(ind => !customCategories || !customCategories[ind.label])
                    ].sort((a, b) => a.label.localeCompare(b.label));

                    const mergedGeography = buildGeoHierarchy([
                      ...SYSTEM_LOCATIONS,
                      ...(customLocations || [])
                    ]);

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {isWizard && (
                          <div style={{ height: '4px', background: t.borderSubtle, borderRadius: '2px', marginBottom: '8px', display: 'flex' }}>
                            <div style={{ height: '100%', width: `${(modalStep / 4) * 100}%`, background: '#6366f1', borderRadius: '2px', transition: 'width 0.3s' }} />
                          </div>
                        )}

                        {(isWizard ? modalStep === 1 : true) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {!isWizard && <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1' }}>STEP 1: IDENTITY</div>}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>CAMPAIGN NAME</label>
                              <input placeholder="e.g. Q2 Dental Outreach" value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })} style={{ width: '100%', padding: '14px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 700, letterSpacing: '0.05em' }}>TARGET LEAD COUNT ({newCampaign.targetCount})</label>
                              </div>
                              <input type="range" min="10" max="500" step="10" value={newCampaign.targetCount} onChange={e => setNewCampaign({ ...newCampaign, targetCount: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#6366f1' }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.7rem', color: t.textMuted }}>
                                <span>10</span>
                                <span>500</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {(isWizard ? modalStep === 2 : true) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {!isWizard && <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1' }}>STEP 2: CATEGORY & SERVICES</div>}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 700 }}>CATEGORY</label>
                              <select value={newCampaign.industry?.id} onChange={e => {
                                const selected = mergedIndustries.find(ind => ind.id === e.target.value);
                                setNewCampaign({ ...newCampaign, industry: selected, services: [] });
                              }} style={{ width: '100%', padding: '14px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }}>
                                <option value="">Select Category</option>
                                {mergedIndustries.map(ind => <option key={ind.id} value={ind.id}>{ind.label}</option>)}
                              </select>
                            </div>
                            {newCampaign.industry && (
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>SERVICES (OPTIONAL)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                                  {newCampaign.industry.services.map(svc => {
                                    const isSelected = newCampaign.services.includes(svc);
                                    return (
                                      <button key={svc} onClick={() => {
                                        const next = isSelected ? newCampaign.services.filter(s => s !== svc) : [...newCampaign.services, svc];
                                        setNewCampaign({ ...newCampaign, services: next });
                                      }} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', border: `1px solid ${isSelected ? '#6366f1' : t.borderSubtle}`, background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent', color: isSelected ? '#818cf8' : t.textSecondary, cursor: 'pointer' }}>
                                        {svc}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {(isWizard ? modalStep === 3 : true) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {!isWizard && <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1' }}>STEP 3: GEOGRAPHY</div>}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 700 }}>STATE</label>
                              <select value={newCampaign.geography?.state} onChange={e => setNewCampaign({ ...newCampaign, geography: { state: e.target.value, county: null, city: null } })} style={{ width: '100%', padding: '14px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }}>
                                <option value="">Select State</option>
                                {mergedGeography.map(g => <option key={g.state} value={g.state}>{g.state}</option>)}
                              </select>
                            </div>
                            {newCampaign.geography?.state && (
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>COUNTY</label>
                                <select value={newCampaign.geography?.county || ''} onChange={e => setNewCampaign({ ...newCampaign, geography: { ...newCampaign.geography, county: e.target.value, city: null } })} style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }}>
                                  <option value="">Select County</option>
                                  {mergedGeography.find(g => g.state === newCampaign.geography.state)?.counties.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                              </div>
                            )}
                            {newCampaign.geography?.county && (
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>CITY</label>
                                <select value={newCampaign.geography?.city || ''} onChange={e => setNewCampaign({ ...newCampaign, geography: { ...newCampaign.geography, city: e.target.value } })} style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }}>
                                  <option value="">Select City</option>
                                  {mergedGeography.find(g => g.state === newCampaign.geography.state)?.counties.find(c => c.name === newCampaign.geography.county)?.cities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                        )}

                        {(isWizard ? modalStep === 4 : true) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {!isWizard && <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1' }}>STEP 4: SCHEDULING & AUTOMATION</div>}
                            
                            <div style={{ padding: '24px', background: t.bg, borderRadius: '20px', border: `1px solid ${t.borderSubtle}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.text }}>AutoWriteEmail™ Outreach</div>
                                  <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: '2px' }}>Automatically craft hyper-personalized emails for this campaign.</div>
                                </div>
                                <div onClick={() => setNewCampaign({ ...newCampaign, autoWriteEmail: !newCampaign.autoWriteEmail })} style={{ width: 50, height: 26, background: newCampaign.autoWriteEmail ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : t.barBg, borderRadius: 13, cursor: 'pointer', position: 'relative', transition: '0.3s', boxShadow: newCampaign.autoWriteEmail ? '0 0 15px rgba(99,102,241,0.3)' : 'none' }}>
                                  <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: newCampaign.autoWriteEmail ? 27 : 3, transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                              </div>
                              
                              {newCampaign.autoWriteEmail && (
                                <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px dashed rgba(99,102,241,0.3)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '1.2rem' }}>✨</span>
                                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>
                                    AI will generate a 3-step outreach sequence based on the <b>{newCampaign.industry?.label || 'selected industry'}</b>.
                                  </span>
                                </div>
                              )}
                            </div>

                            <div style={{ padding: '24px', background: t.bg, borderRadius: '20px', border: `1px solid ${t.borderSubtle}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.text }}>Schedule for later?</div>
                                  <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: '2px' }}>Set a specific time for the system to launch.</div>
                                </div>
                                <div onClick={() => setNewCampaign({ ...newCampaign, isScheduled: !newCampaign.isScheduled })} style={{ width: 50, height: 26, background: newCampaign.isScheduled ? '#22c55e' : t.barBg, borderRadius: 13, cursor: 'pointer', position: 'relative', transition: '0.3s' }}>
                                  <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: newCampaign.isScheduled ? 27 : 3, transition: '0.3s' }} />
                                </div>
                              </div>
                              {newCampaign.isScheduled && (
                                <div style={{ marginTop: '4px' }}>
                                  <label style={{ display: 'block', fontSize: '0.7rem', color: t.textMuted, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>LAUNCH DATE & TIME</label>
                                  <input type="datetime-local" value={newCampaign.scheduledDate} onChange={e => setNewCampaign({ ...newCampaign, scheduledDate: e.target.value })} style={{ width: '100%', padding: '14px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '12px', color: t.text, outline: 'none' }} />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '32px' }}>
                  <button
                    onClick={() => {
                      if (isWizard && modalStep > 1) {
                        setModalStep(modalStep - 1);
                      } else {
                        setIsCampaignModalOpen(false);
                        setEditingCampaignId(null);
                      }
                    }}
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${t.borderSubtle}`, background: 'transparent', color: t.textSecondary, cursor: 'pointer', fontWeight: 600 }}
                  >
                    {(isWizard && modalStep === 1) || !isWizard ? 'Cancel' : 'Back'}
                  </button>

                  {isWizard && modalStep < 4 ? (
                    <button
                      onClick={() => setModalStep(modalStep + 1)}
                      disabled={
                        (modalStep === 1 && !newCampaign.name) ||
                        (modalStep === 2 && !newCampaign.industry) ||
                        (modalStep === 3 && !newCampaign.geography?.state)
                      }
                      style={{
                        flex: 2, padding: '14px', background: '#6366f1', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: (
                          (modalStep === 1 && !newCampaign.name) ||
                          (modalStep === 2 && !newCampaign.industry) ||
                          (modalStep === 3 && !newCampaign.geography?.state)
                        ) ? 0.5 : 1
                      }}
                    >
                      Next
                    </button>
                  ) : (
                      <button
                        onClick={addCampaign}
                        disabled={
                          aiGenerating ||
                          !newCampaign.name ||
                          !newCampaign.industry ||
                          !newCampaign.geography?.state ||
                          (newCampaign.isScheduled && !newCampaign.scheduledDate)
                        }
                        style={{
                          flex: 2, padding: '14px', background: aiGenerating ? '#8b5cf6' : '#22c55e', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, transition: '0.3s', transform: aiGenerating ? 'scale(0.98)' : 'scale(1)', opacity: (
                            aiGenerating ||
                            !newCampaign.name ||
                            !newCampaign.industry ||
                            !newCampaign.geography?.state ||
                            (newCampaign.isScheduled && !newCampaign.scheduledDate)
                          ) ? 0.5 : 1
                        }}
                      >
                        {aiGenerating ? '🪄 Generating Sequence...' : (editingCampaignId ? 'Update Campaign' : 'Create Campaign')}
                      </button>
                  )}
                </div>
              </div>

              {/* Right Column: Persistent Summary Sidebar */}
              <div style={{ width: '320px', background: isDark ? 'rgba(30,41,59,0.5)' : '#f8fafc', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1', letterSpacing: '0.05em' }}>CAMPAIGN PREVIEW</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ padding: '20px', background: isDark ? '#1e293b' : '#fff', borderRadius: '16px', border: `1px solid ${t.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: t.text }}>{newCampaign.name || 'Untitled Campaign'}</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: t.textMuted }}>Target:</span>
                        <span style={{ fontWeight: 600, color: '#6366f1' }}>{newCampaign.targetCount} leads</span>
                      </div>

                      <div style={{ height: '1px', background: t.borderSubtle }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Scope</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{newCampaign.industry?.label || 'Not Selected'}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {newCampaign.services && newCampaign.services.length > 0 ? newCampaign.services.map(s => (
                            <span key={s} style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>{s}</span>
                          )) : <span style={{ fontSize: '0.75rem', color: t.textMuted, fontStyle: 'italic' }}>All Services</span>}
                        </div>
                      </div>

                      <div style={{ height: '1px', background: t.borderSubtle }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Location</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {newCampaign.geography?.city ? `${newCampaign.geography.city}, ` : ''}
                          {newCampaign.geography?.state || 'Selection Pending'}
                        </span>
                      </div>

                      <div style={{ height: '1px', background: t.borderSubtle }} />

                      <div style={{ height: '1px', background: t.borderSubtle }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Automation</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: newCampaign.autoWriteEmail ? '#8b5cf6' : t.textMuted }}>
                          <span style={{ fontSize: '1rem' }}>{newCampaign.autoWriteEmail ? '✨' : '⚪'}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{newCampaign.autoWriteEmail ? 'AutoWrite Outreach' : 'Manual Outreach'}</span>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: t.borderSubtle }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Launch</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: newCampaign.isScheduled ? '#f59e0b' : '#22c55e' }}>
                          <span style={{ fontSize: '1rem' }}>{newCampaign.isScheduled ? '🕒' : '🚀'}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{newCampaign.isScheduled ? (newCampaign.scheduledDate ? new Date(newCampaign.scheduledDate).toLocaleString() : 'Scheduling Required') : 'Immediate'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {newCampaign.autoWriteEmail && (
                    <div style={{ padding: '16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '0.75rem', color: '#818cf8', display: 'flex', gap: '10px' }}>
                      <span>🪄</span>
                      <span>AI will write personalized outreach sequences for every discovered lead in this campaign.</span>
                    </div>
                  )}

                  {!newCampaign.industry && (
                    <div style={{ padding: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', fontSize: '0.75rem', color: '#f59e0b', display: 'flex', gap: '10px' }}>
                      <span>ℹ️</span>
                      <span>Complete category selection to finalize your target audience.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        selectedLeadId && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2,8,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900 }} onClick={() => handleSelectLead(null)}>
            <div style={{ width: '500px', padding: '32px', background: t.card, borderRadius: '20px', border: `1px solid ${t.border}` }} onClick={e => e.stopPropagation()}>
              <h2>{safeCrmData.find(l => l.id === selectedLeadId)?.name}</h2>
              <button onClick={() => handleSelectLead(null)} style={{ marginTop: '20px', padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )
      }

      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; } 
        body { margin: 0; }
        .api-card-premium:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(99, 102, 241, 0.5) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 15px rgba(99, 102, 241, 0.2) !important;
        }
        .premium-input-glass:focus {
          border-color: #6366f1 !important;
          background: rgba(15, 23, 42, 0.6) !important;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }
        .premium-test-button:hover {
          filter: brightness(1.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4) !important;
        }
        .premium-test-button:active {
          transform: translateY(0);
        }
      ` }} />
    </div>
  );
}