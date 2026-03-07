/**
 * RETENTION & NURTURE AGENT
 * Monitors inactive leads and sends value-driven follow-ups
 * Keeps the agency top-of-mind without direct selling
 */

class NurtureAgent {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Check for leads needing nurture
     */
    async findNurtureTargets(leads) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return leads.filter(l => {
            const lastContact = new Date(l.lastContactAt || l.updatedAt);
            return lastContact < thirtyDaysAgo && l.stage !== 'paid';
        });
    }

    /**
     * Generate a nurture "Value Drop"
     */
    async generateValueDrop(lead) {
        console.log(`[Nurture] Crafting value drop for ${lead.name}`);

        const topics = [
            "New AI trends in ${lead.industry}",
            "Local search algorithm update",
            "How competitors are using video",
            "Mobile speed benchmark for ${lead.city}"
        ];

        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        return {
            leadId: lead.id,
            topic: selectedTopic,
            subject: `Thought you'd find this interesting, ${lead.contactFirstName || 'there'}`,
            body: `Hi ${lead.contactFirstName || 'there'},\n\nI was just reading about ${selectedTopic.replace('${lead.industry}', lead.industry).replace('${lead.city}', lead.city)} and immediately thought of ${lead.name}.\n\nIt looks like there's a big shift coming. I've summarized the key takeaways that might affect your business here. No need to reply, just wanted to share!\n\nBest,\n[Agent Name]`,
            scheduledFor: new Date().toISOString()
        };
    }
}

module.exports = { NurtureAgent };
