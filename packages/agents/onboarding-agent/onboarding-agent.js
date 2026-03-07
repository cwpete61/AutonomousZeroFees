/**
 * ONBOARDING AGENT
 * Manages the transition from "Paid" to "Building"
 * Automates asset collection, folder setup, and kickoff communication
 */

const ONBOARDING_SYSTEM_PROMPT = `You are a project coordinator for a web design agency.
Your job is to ensure a smooth kickoff for new clients.

Tasks:
1. Identify missing assets (Logo, brand colors, domain access, hosting info)
2. Draft a personalized welcome message that feels high-touch
3. Create a "Build Brief" for the Design and Content agents

Return JSON:
{
  "welcomeMessage": "string",
  "missingAssets": ["array"],
  "buildBrief": {
    "primaryGoal": "string",
    "designStyle": "string",
    "suggestedPages": ["array"]
  }
}`;

class OnboardingAgent {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Start the onboarding process for a new client
     */
    async startOnboarding(client) {
        console.log(`[Onboarding] Starting project for ${client.name}`);

        // 1. Setup project structure (Mock)
        const projectFolder = `clients/${client.id}_${client.name.replace(/\s+/g, '_').toLowerCase()}`;
        
        // 2. Draft communications
        const instructions = await this.generateInstructions(client);

        return {
            clientId: client.id,
            projectFolder,
            welcomeEmail: instructions.welcomeMessage,
            todoList: instructions.missingAssets,
            brief: instructions.buildBrief,
            status: 'started',
            createdAt: new Date().toISOString()
        };
    }

    async generateInstructions(client) {
        // Fallback or LLM call here
        return {
            welcomeMessage: `Hi ${client.contactName || 'there'},\n\nWe're thrilled to start on the ${client.name} project! I've set up your project portal. To get moving, could you send over your latest logo and any specific brand colors you'd like us to use?\n\nLooking forward to it!`,
            missingAssets: ['Logo (SVG/PNG)', 'Brand Colors', 'Hosting Login'],
            buildBrief: {
                primaryGoal: 'Conversion-focused redesign',
                designStyle: 'Modern, clean, local-service oriented',
                suggestedPages: ['Home', 'Services', 'About', 'Contact', 'Gallery']
            }
        };
    }
}

module.exports = { OnboardingAgent };
