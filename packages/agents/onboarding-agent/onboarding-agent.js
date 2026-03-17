/**
 * ONBOARDING AGENT
 * Manages the transition from "Paid" to "Active Recovery"
 * Automates document collection, technical setup, and kickoff communication
 */

const ONBOARDING_SYSTEM_PROMPT = `You are a project coordinator for a merchant recovery agency.
Your job is to ensure a smooth kickoff for new clients activating the 'Zero-Fee Profit Shield'.

Tasks:
1. Identify missing assets (Recent merchant statements, hardware model numbers, bank details for deposits)
2. Draft a personalized welcome message that focuses on ROI and profit retention
3. Create an 'Activation Brief' for the technical team

Return JSON:
{
  "welcomeMessage": "string",
  "missingAssets": ["array"],
  "activationBrief": {
    "primaryGoal": "string",
    "recoveryTarget": "string",
    "suggestedUpgrades": ["array"]
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
        console.log(`[Onboarding] Starting Profit Shield activation for ${client.name}`);

        // 1. Setup project structure (Mock)
        const projectFolder = `clients/${client.id}_${client.name.replace(/\s+/g, '_').toLowerCase()}`;
        
        // 2. Draft communications
        const instructions = await this.generateInstructions(client);

        return {
            clientId: client.id,
            projectFolder,
            welcomeEmail: instructions.welcomeMessage,
            todoList: instructions.missingAssets,
            brief: instructions.activationBrief,
            status: 'shield_activating',
            createdAt: new Date().toISOString()
        };
    }

    async generateInstructions(client) {
        return {
            welcomeMessage: `Hi ${client.contactName || 'there'},\n\nWe're thrilled to activate the Profit Shield for ${client.name}! This is the first step toward reclaiming your profit and scale. To finalize the activation, could you please upload your most recent merchant processing statement and the model number of your current terminal?\n\nWe'll have you live and saving money within 48 hours!`,
            missingAssets: ['Most recent merchant statement (PDF)', 'Current POS/Terminal model number', 'Bank account info for daily deposits'],
            activationBrief: {
                primaryGoal: '100% processing fee elimination',
                recoveryTarget: client.estimatedAnnualWaste || 'Estimated $5,000+',
                suggestedUpgrades: ['Zero-Fee Dual Pricing', 'Automated Daily Recovery Reports']
            }
        };
    }
}

module.exports = { OnboardingAgent };
