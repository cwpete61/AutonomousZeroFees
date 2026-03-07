'use client';

import React, { useState, useEffect } from 'react';

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

const AGENTS = [
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
    id: 'c1', name: 'Sparkle Cleaning', contact: 'Maria Garcia', email: 'maria@sparklecleaning.com', phone: '(312) 555-8821', industry: 'Cleaning', city: 'Chicago, IL', website: 'sparklecleaning.com', score: 89, stage: 'delivered', outreachAt: '2026-02-02', repliedAt: '2026-02-04', paidAt: '2026-02-08', deliveredAt: '2026-02-15', invoiceId: 'INV-1001', amount: 2994, paymentMethod: 'Stripe', paymentStatus: 'paid', automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-01', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-01', action: 'Auto-qualified: Score 89/100', type: 'system' }, { date: '2026-02-02', action: 'Cold email sent via Resend', type: 'email' }, { date: '2026-02-03', action: 'SMS outreach sent (Twilio)', type: 'sms' }, { date: '2026-02-04', action: 'Maria replied: "Interested, show me more"', type: 'reply' }, { date: '2026-02-05', action: 'Blurred mockup sent via email', type: 'email' }, { date: '2026-02-05', action: 'Maria viewed demo (2m 34s)', type: 'engagement' }, { date: '2026-02-06', action: 'Voice follow-up call (AI script)', type: 'call' }, { date: '2026-02-06', action: 'Proposal generated: $2,994', type: 'system' }, { date: '2026-02-06', action: 'Stripe invoice sent', type: 'payment' }, { date: '2026-02-08', action: 'Payment received: $2,994', type: 'payment' }, { date: '2026-02-09', action: 'Web Build Agent started', type: 'system' }, { date: '2026-02-15', action: 'Website delivered & live', type: 'delivery' }
    ]
  },
  {
    id: 'c2', name: 'Summit Roofing', contact: 'Jake Williams', email: 'jake@summitroofing.com', phone: '(615) 555-3390', industry: 'Roofing', city: 'Nashville, TN', website: 'summitroofing.com', score: 78, stage: 'building', outreachAt: '2026-02-11', repliedAt: '2026-02-14', paidAt: '2026-02-18', deliveredAt: null, invoiceId: 'INV-1002', amount: 3494, paymentMethod: 'Stripe', paymentStatus: 'paid', automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-10', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-11', action: 'Email + LinkedIn DM sent', type: 'email' }, { date: '2026-02-14', action: 'Jake replied via LinkedIn', type: 'reply' }, { date: '2026-02-15', action: 'Demo mockup delivered', type: 'system' }, { date: '2026-02-16', action: 'Proposal sent: $3,494', type: 'system' }, { date: '2026-02-18', action: 'Payment received: $3,494', type: 'payment' }, { date: '2026-02-20', action: 'Web Build Agent started', type: 'system' }
    ]
  },
  {
    id: 'c3', name: 'Diamond Cleaning', contact: 'Lisa Park', email: 'lisa@diamondclean.com', phone: '(206) 555-7712', industry: 'Cleaning', city: 'Seattle, WA', website: 'diamondclean.com', score: 67, stage: 'proposal_sent', outreachAt: '2026-02-19', repliedAt: '2026-02-22', paidAt: null, deliveredAt: null, invoiceId: 'INV-1003', amount: 2494, paymentMethod: null, paymentStatus: 'pending', automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-18', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-19', action: 'Cold email sent', type: 'email' }, { date: '2026-02-22', action: 'Lisa replied: "What does this cost?"', type: 'reply' }, { date: '2026-02-23', action: 'Mockup + pricing sent', type: 'email' }, { date: '2026-02-25', action: 'Proposal sent: $2,494', type: 'system' }, { date: '2026-02-25', action: 'Stripe invoice sent — awaiting payment', type: 'payment' }
    ]
  },
  {
    id: 'c4', name: 'Green Landscaping', contact: 'Tom Chen', email: 'tom@greenlandscaping.com', phone: '(503) 555-4488', industry: 'Landscaping', city: 'Portland, OR', website: 'greenlandscaping.com', score: 52, stage: 'replied', outreachAt: '2026-02-26', repliedAt: '2026-03-01', paidAt: null, deliveredAt: null, invoiceId: null, amount: null, paymentMethod: null, paymentStatus: null, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-02-25', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-02-26', action: 'Email + Facebook DM sent', type: 'email' }, { date: '2026-03-01', action: 'Tom replied: "Send me info"', type: 'reply' }
    ]
  },
  {
    id: 'c5', name: 'Best Roofing LLC', contact: 'Dan Miller', email: 'dan@bestroofingco.com', phone: '(720) 555-1199', industry: 'Roofing', city: 'Denver, CO', website: 'bestroofingco.com', score: 38, stage: 'outreach_sent', outreachAt: '2026-03-02', repliedAt: null, paidAt: null, deliveredAt: null, invoiceId: null, amount: null, paymentMethod: null, paymentStatus: null, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
      { date: '2026-03-01', action: 'Discovered by Scout Agent', type: 'system' }, { date: '2026-03-02', action: 'Cold email sent', type: 'email' }, { date: '2026-03-04', action: 'Follow-up #1 sent', type: 'email' }
    ]
  },
  {
    id: 'c6', name: 'Apex Electric', contact: 'Rosa Diaz', email: 'rosa@apexelectric.net', phone: '(305) 555-6644', industry: 'Electrical', city: 'Miami, FL', website: 'apexelectric.net', score: 41, stage: 'outreach_sent', outreachAt: '2026-03-03', repliedAt: null, paidAt: null, deliveredAt: null, invoiceId: null, amount: null, paymentMethod: null, paymentStatus: null, automation: { scout: true, outreach: true, analysis: true, design: true }, timeline: [
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
  scout: { name: 'Google Places', costPerLead: 0.05, multiplier: 1.5, available: 1500 },
  pagespeed: { name: 'PageSpeed', costPerLead: 0.01, multiplier: 1.0, available: 5000 },
  claude: { name: 'Anthropic (Claude)', costPerLead: 0.12, multiplier: 1.0, available: 40 },
  hunter: { name: 'Hunter.io', costPerLead: 0.08, multiplier: 1.2, available: 800 },
};

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

export default function Dashboard() {
  const [activeView, setActiveView] = useState('pipeline');
  const [isDark, setIsDark] = useState(true);
  const [phaseSettings, setPhaseSettings] = useState({
    lead_inbox: true, discovered: true, qualified: true, outreach_sent: true, replied: true,
    demo_sent: true, proposal_sent: true, paid: true, building: true, delivered: true
  });
  const [leadSettings, setLeadSettings] = useState({});
  const [crmData, setCrmData] = useState(INITIAL_CRM_CLIENTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
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
    scheduledDate: ''
  });
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

  useEffect(() => {
    // Force mount immediately to avoid getting stuck
    setHasMounted(true);

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

        const savedCrm = localStorage.getItem('orbis_crm_data');
        if (savedCrm) {
          try {
            const parsed = JSON.parse(savedCrm);
            if (Array.isArray(parsed)) setCrmData(parsed);
          } catch (e) { console.error("Error parsing CRM data:", e); }
        }

        const savedCampaigns = localStorage.getItem('orbis_campaigns');
        if (savedCampaigns) {
          try {
            const parsed = JSON.parse(savedCampaigns);
            if (Array.isArray(parsed)) setCampaigns(parsed);
          } catch (e) { console.error("Error parsing campaigns:", e); }
        }

        const savedSelected = localStorage.getItem('orbis_selected_lead');
        if (savedSelected) setSelectedLeadId(savedSelected);

        const savedCategories = localStorage.getItem('orbis_custom_categories');
        if (savedCategories) {
          try {
            const parsed = JSON.parse(savedCategories);
            if (parsed && typeof parsed === 'object') setCustomCategories(parsed);
          } catch (e) { console.error("Error parsing custom categories:", e); }
        }

        const savedLocations = localStorage.getItem('orbis_custom_locations');
        if (savedLocations) {
          try {
            const parsed = JSON.parse(savedLocations);
            if (Array.isArray(parsed)) setCustomLocations(parsed);
          } catch (e) { console.error("Error parsing custom locations:", e); }
        }
      }
    } catch (err) {
      console.error("Initialization Error:", err);
    }
  }, []);

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

  const handleDeleteLead = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      // 1. Remove from CRM main data
      const nextLeads = crmData.filter(l => l.id !== id);
      setCrmData(nextLeads);
      if (typeof window !== 'undefined') localStorage.setItem('orbis_crm_data', JSON.stringify(nextLeads));

      // 2. Remove from lead settings (active/inactive status)
      setLeadSettings(prev => {
        const next = { ...prev };
        delete next[id];
        if (typeof window !== 'undefined') localStorage.setItem('orbis_leads_active', JSON.stringify(next));
        return next;
      });

      // 3. Reset selection if this lead was selected
      if (selectedLeadId === id) {
        setSelectedLeadId(null);
        if (typeof window !== 'undefined') localStorage.removeItem('orbis_selected_lead');
      }

      setExpandedLeadId(null);
    }
  };

  const addCampaign = () => {
    if (!newCampaign?.name) return;

    if (editingCampaignId) {
      // Update existing
      const nextCampaigns = campaigns.map(c => c.id === editingCampaignId ? { ...newCampaign } : c);
      setCampaigns(nextCampaigns);
      if (typeof window !== 'undefined') localStorage.setItem('orbis_campaigns', JSON.stringify(nextCampaigns));
    } else {
      // Create new
      const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#f59e0b', '#22c55e', '#06b6d4'];
      const campaign = {
        id: `cp${Date.now()}`,
        ...newCampaign,
        leads: 0,
        sent: 0,
        replies: 0,
        status: newCampaign.isScheduled ? 'scheduled' : 'active',
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      const nextCampaigns = [campaign, ...campaigns];
      setCampaigns(nextCampaigns);
      if (typeof window !== 'undefined') localStorage.setItem('orbis_campaigns', JSON.stringify(nextCampaigns));
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
      scheduledDate: ''
    });
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

  const updateLead = (id, updates) => {
    setCrmData(prev => {
      const next = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      if (typeof window !== 'undefined') localStorage.setItem('orbis_crm_data', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateCampaignStatus = (id, status) => {
    setCampaigns(prev => {
      const next = prev.map(c => c.id === id ? { ...c, status } : c);
      if (typeof window !== 'undefined') localStorage.setItem('orbis_campaigns', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteCampaign = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(prev => {
        const next = prev.filter(c => c.id !== id);
        if (typeof window !== 'undefined') localStorage.setItem('orbis_campaigns', JSON.stringify(next));
        return next;
      });
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

  const leadsPerStage = (PIPELINE_STAGES || []).map(stage => ({
    ...stage,
    leads: (safeCrmData || []).filter(l => l.stage === stage.id),
  }));

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Inter', system-ui, sans-serif", transition: 'background 0.3s, color 0.3s' }}>
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.headerBg, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>◉</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem' }}>Orbis Outreach</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['pipeline', 'agents', 'crm', 'campaigns', 'jobqueue', 'analytics', 'api', 'users', 'system'].map(view => (
            <button key={view} onClick={() => handleViewChange(view)} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, background: activeView === view ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeView === view ? '#818cf8' : t.textMuted }}>
              {view.toUpperCase()}
            </button>
          ))}
          <button onClick={toggleTheme} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}>{isDark ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: '95%', margin: '0 auto' }}>
        {hasMounted ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Leads', value: safeCrmData.length, color: '#6366f1' },
                { label: 'Campaigns', value: safeCampaigns.length, color: '#22c55e' },
                { label: 'Conversion', value: '11%', color: '#f59e0b' },
                { label: 'Revenue', value: '$2,994', color: '#14b8a6' },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '20px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: t.textMuted }}>{stat.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {activeView === 'pipeline' && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, minmax(220px, 1fr))`, gap: '8px', overflowX: 'auto', paddingBottom: '20px' }}>
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isActive = phaseSettings?.[stage.id];
                  const stageLeads = safeCrmData.filter(l => l.stage === stage.id);
                  const columnBg = idx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)');

                  return (
                    <div key={stage.id} style={{ minWidth: '220px', background: columnBg, padding: '12px', borderRadius: '12px', transition: 'background 0.3s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: t.textSecondary, letterSpacing: '0.05em' }}>{stage.label.toUpperCase()}</span>
                        <div onClick={() => togglePhase(stage.id)} style={{ width: 28, height: 14, background: isActive ? stage.color : t.barBg, borderRadius: 10, cursor: 'pointer', position: 'relative' }}>
                          <div style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: isActive ? 16 : 2, transition: '0.2s' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stageLeads.map(lead => (
                          <div key={lead.id} onClick={() => handleSelectLead(lead)} style={{ padding: '12px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lead.name}</div>
                            <div style={{ fontSize: '0.7rem', color: t.textSecondary }}>{lead.industry}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeView === 'agents' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {(AGENTS || []).map((agent, i) => {
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
                    {safeCampaigns.filter(c => c.status === 'scheduled').length} Pending
                  </div>
                </div>

                {safeCampaigns.filter(c => c.status === 'scheduled').length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', background: t.card, borderRadius: '16px', border: `1px dashed ${t.border}`, color: t.textMuted }}>
                    No pending jobs in the queue.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {safeCampaigns.filter(c => c.status === 'scheduled').map(camp => (
                      <div key={camp.id} style={{ padding: '24px', background: t.card, border: `2px dashed ${t.border}`, borderRadius: '12px', position: 'relative', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'} onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(camp.id); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.5, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5} title="Delete Job">🗑️</button>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', pr: '28px' }}>{camp.name}</div>
                        <div style={{ padding: '4px 8px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', marginBottom: '16px' }}>
                          SCHEDULED
                        </div>
                        <div style={{ padding: '16px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.borderFaint}`, marginBottom: '20px' }}>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: '4px' }}>LAUNCH TIME</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{camp.scheduledDate?.replace('T', ' ')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleUpdateCampaignStatus(camp.id, 'active')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'} onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>Launch Now</button>
                        </div>
                      </div>
                    ))}
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
                    {safeCampaigns.filter(c => c.status !== 'scheduled').map(camp => (
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

            {activeView === 'analytics' && (
              <div style={{ padding: '40px', textAlign: 'center', background: t.card, borderRadius: '20px', border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📈</div>
                <h3>Advanced Analytics Engine</h3>
                <p style={{ color: t.textMuted }}>Predictive modeling and revenue forecasting are being calibrated.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} style={{ width: 30, height: h, background: '#6366f1', borderRadius: '4px', opacity: 0.3 + (i * 0.1) }} />
                  ))}
                </div>
              </div>
            )}

            {activeView === 'api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '24px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>API Integration Hub</h3>
                    <button style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Generate Key</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {Object.entries(API_COST_MODELS).map(([id, api]) => (
                      <div key={id} style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{api.name}</div>
                        <div style={{ fontSize: '0.75rem', color: t.textSecondary }}>${api.costPerLead}/lead • {api.available} calls left</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'users' && (
              <div style={{ padding: '24px', background: t.card, border: `1px solid ${t.border}`, borderRadius: '16px' }}>
                <h3 style={{ marginBottom: '20px' }}>User Management</h3>
                <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${t.borderSubtle}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>JD</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Agency Owner</div>
                    <div style={{ fontSize: '0.75rem', color: t.textMuted }}>owner@agency.com • Full Access</div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'system' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                <tr onClick={() => setExpandedLeadId(expandedLeadId === c.id ? null : c.id)} style={{ borderBottom: `1px solid ${t.borderSubtle}`, cursor: 'pointer', background: expandedLeadId === c.id ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : 'transparent', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} onMouseLeave={e => e.currentTarget.style.background = expandedLeadId === c.id ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : 'transparent'}>
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
                                        <div style={{ display: 'flex', gap: '24px', borderBottom: `1px solid ${t.borderSubtle}`, marginBottom: '24px' }}>
                                          {['details', 'communications', 'journey'].map(tab => (
                                            <button key={tab} onClick={() => setCrmActiveTab(tab)} style={{ padding: '12px 0', border: 'none', background: 'transparent', color: crmActiveTab === tab ? '#6366f1' : t.textMuted, fontWeight: 600, borderBottom: crmActiveTab === tab ? '2px solid #6366f1' : 'none', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                              {tab}
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
                                                <div style={{ fontSize: '0.8rem', color: t.textSecondary, fontStyle: 'italic' }}>"I noticed your site is losing customers because it takes 4.2s to load on mobile..."</div>
                                              </div>
                                              <div style={{ padding: '16px', background: t.bg, borderRadius: '12px', border: `1px solid ${t.borderSubtle}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Client Replied</span>
                                                  <span style={{ fontSize: '0.75rem', color: t.textMuted }}>1 day ago</span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: t.textSecondary }}>"Interested, show me more"</div>
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

                                        {crmActiveTab === 'details' && (
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Company Name</label>
                                              <input type="text" defaultValue={c.name} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Website</label>
                                              <input type="text" defaultValue={c.website} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Main Contact</label>
                                              <input type="text" defaultValue={c.contact} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Email Address</label>
                                              <input type="text" defaultValue={c.email} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Phone Number</label>
                                              <input type="text" defaultValue={c.phone || ''} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Complete Address</label>
                                              <input type="text" defaultValue={c.address || ''} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Google Business (GBP) Link</label>
                                              <input type="text" defaultValue={c.gbpLink || ''} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Categories (comma separated)</label>
                                              <input type="text" defaultValue={(c.categories || []).join(', ')} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div>
                                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px' }}>Services (comma separated)</label>
                                              <input type="text" defaultValue={(c.services || []).join(', ')} style={{ width: '100%', padding: '10px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '8px', color: t.text }} />
                                            </div>
                                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                              <button style={{ padding: '10px 24px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
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
      {
        isCampaignModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2,8,23,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsCampaignModalOpen(false)}>
            <div style={{ padding: '32px', background: isDark ? '#1e293b' : '#fff', borderRadius: '24px', width: '550px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: `1px solid ${t.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{editingCampaignId ? 'Edit Campaign' : 'Create Campaign'}</h2>
                <div style={{ fontSize: '0.85rem', color: t.textMuted, fontWeight: 600 }}>Step {modalStep} of 5</div>
              </div>

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
                  <>
                    <div style={{ height: '4px', background: t.borderSubtle, borderRadius: '2px', marginBottom: '32px', display: 'flex' }}>
                      <div style={{ height: '100%', width: `${(modalStep / 5) * 100}%`, background: '#6366f1', borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>

                    {modalStep === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>CAMPAIGN NAME</label>
                          <input type="text" value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })} style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }} placeholder="e.g. Q2 Dental Outreach" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>TARGET LEAD COUNT ({newCampaign.targetCount})</label>
                          <input type="range" min="10" max="500" step="10" value={newCampaign.targetCount} onChange={e => setNewCampaign({ ...newCampaign, targetCount: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#6366f1' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: t.textMuted, marginTop: '4px' }}>
                            <span>10</span>
                            <span>500</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {modalStep === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>CATEGORY</label>
                          <select
                            value={newCampaign.industry?.id || ''}
                            onChange={e => {
                              const ind = mergedIndustries.find(i => i.id === e.target.value);
                              setNewCampaign({ ...newCampaign, industry: ind, services: [] });
                            }}
                            style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }}
                          >
                            <option value="">Select Category</option>
                            {mergedIndustries.map(ind => (
                              <option key={ind.id} value={ind.id}>{ind.label}</option>
                            ))}
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

                    {modalStep === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>STATE</label>
                          <select value={newCampaign.geography?.state || ''} onChange={e => {
                            setNewCampaign({ ...newCampaign, geography: { state: e.target.value, county: null, city: null } });
                          }} style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }}>
                            <option value="">Select State</option>
                            {mergedGeography.map(g => <option key={g.state} value={g.state}>{g.state}</option>)}
                          </select>
                        </div>
                        {newCampaign.geography?.state && (
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>COUNTY</label>
                            <select value={newCampaign.geography?.county || ''} onChange={e => {
                              setNewCampaign({ ...newCampaign, geography: { ...newCampaign.geography, county: e.target.value, city: null } });
                            }} style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }}>
                              <option value="">Select County</option>
                              {mergedGeography.find(g => g.state === newCampaign.geography.state)?.counties.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>
                        )}
                        {newCampaign.geography?.county && (
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>CITY</label>
                            <select value={newCampaign.geography?.city || ''} onChange={e => {
                              setNewCampaign({ ...newCampaign, geography: { ...newCampaign.geography, city: e.target.value } });
                            }} style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }}>
                              <option value="">Select City</option>
                              {mergedGeography.find(g => g.state === newCampaign.geography.state)?.counties.find(c => c.name === newCampaign.geography.county)?.cities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {modalStep === 4 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ padding: '20px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontWeight: 600 }}>Schedule for later?</div>
                            <div onClick={() => setNewCampaign({ ...newCampaign, isScheduled: !newCampaign.isScheduled })} style={{ width: 44, height: 24, background: newCampaign.isScheduled ? '#22c55e' : t.barBg, borderRadius: 12, cursor: 'pointer', position: 'relative', transition: '0.2s' }}>
                              <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: newCampaign.isScheduled ? 23 : 3, transition: '0.2s' }} />
                            </div>
                          </div>
                          {newCampaign.isScheduled && (
                            <div style={{ marginTop: '20px' }}>
                              <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '8px', fontWeight: 600 }}>LAUNCH DATE & TIME</label>
                              <input type="datetime-local" value={newCampaign.scheduledDate} onChange={e => setNewCampaign({ ...newCampaign, scheduledDate: e.target.value })} style={{ width: '100%', padding: '12px', background: t.card, border: `1px solid ${t.borderSubtle}`, borderRadius: '10px', color: t.text, outline: 'none' }} />
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: t.textMuted, fontStyle: 'italic', textAlign: 'center' }}>
                          Scheduled campaigns will be held in the Job Queue until their launch time.
                        </div>
                      </div>
                    )}

                    {modalStep === 5 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ padding: '20px', background: t.bg, borderRadius: '16px', border: `1px solid ${t.borderSubtle}` }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px', color: '#6366f1' }}>CAMPAIGN SUMMARY</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', fontSize: '0.8rem' }}>
                            <span style={{ color: t.textMuted }}>Name:</span> <span style={{ fontWeight: 600 }}>{newCampaign.name}</span>
                            <span style={{ color: t.textMuted }}>Target:</span> <span style={{ fontWeight: 600 }}>{newCampaign.targetCount} leads</span>
                            <span style={{ color: t.textMuted }}>Category:</span> <span style={{ fontWeight: 600 }}>{newCampaign.industry?.label || 'N/A'}</span>
                            <span style={{ color: t.textMuted }}>Services:</span> <span style={{ fontWeight: 600 }}>{newCampaign.services.join(', ') || 'All'}</span>
                            <span style={{ color: t.textMuted }}>Location:</span> <span style={{ fontWeight: 600 }}>{newCampaign.geography?.city || 'Remote'}, {newCampaign.geography?.state || 'Anywhere'}</span>
                            <span style={{ color: t.textMuted }}>Status:</span> <span style={{ fontWeight: 600 }}>{newCampaign.isScheduled ? `Scheduled for ${newCampaign.scheduledDate || 'TBD'}` : 'Launch Immediately'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                      <button
                        onClick={() => modalStep > 1 ? setModalStep(modalStep - 1) : setIsCampaignModalOpen(false)}
                        style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${t.borderSubtle}`, background: 'transparent', color: t.textSecondary, cursor: 'pointer', fontWeight: 600 }}
                      >
                        {modalStep === 1 ? 'Cancel' : 'Back'}
                      </button>
                      {modalStep < 5 ?
                        <button
                          onClick={() => setModalStep(modalStep + 1)}
                          disabled={
                            (modalStep === 1 && !newCampaign.name) ||
                            (modalStep === 2 && !newCampaign.industry) ||
                            (modalStep === 3 && !newCampaign.geography?.state) ||
                            (modalStep === 4 && newCampaign.isScheduled && !newCampaign.scheduledDate)
                          }
                          style={{
                            flex: 2, padding: '14px', background: '#6366f1', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: (
                              (modalStep === 1 && !newCampaign.name) ||
                              (modalStep === 2 && !newCampaign.industry) ||
                              (modalStep === 3 && !newCampaign.geography?.state) ||
                              (modalStep === 4 && newCampaign.isScheduled && !newCampaign.scheduledDate)
                            ) ? 0.5 : 1
                          }}
                        >
                          Next
                        </button> :
                        <button
                          onClick={addCampaign}
                          style={{ flex: 2, padding: '14px', background: '#22c55e', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                        >
                          {editingCampaignId ? 'Save Changes' : 'Launch Campaign'}
                        </button>
                      }
                    </div>
                  </>
                );
              })()}
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

      <style dangerouslySetInnerHTML={{ __html: `* { box-sizing: border-box; } body { margin: 0; }` }} />
    </div >
  );
}