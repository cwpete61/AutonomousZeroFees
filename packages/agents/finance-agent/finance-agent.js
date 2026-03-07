/**
 * FINANCE & BILLING AGENT
 * Manages revenue, expenses, and automated invoicing
 * Syncs with Stripe and tracks agency profitability
 */

class FinanceAgent {
    constructor(config = {}) {
        this.config = config;
        this.stripeKey = config.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    }

    /**
     * Generate an invoice for a client
     */
    async createInvoice(client, amount, description) {
        console.log(`[Finance] Creating invoice for ${client.name}: $${amount}`);
        
        // Mock Stripe API call
        const invoiceId = `INV-${Math.floor(Math.random() * 9000) + 1000}`;
        
        return {
            invoiceId,
            clientId: client.id,
            amount,
            currency: 'USD',
            description,
            status: 'sent',
            hostedInvoiceUrl: `https://stripe.com/invoice/${invoiceId}`,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Calculate campaign ROI and profitability
     */
    async calculateCampaignProfit(campaign) {
        const adSpend = campaign.budget || 0;
        const apiCosts = campaign.leadsProcessed * 0.15; // $0.15 per lead avg
        const revenue = campaign.revenueGenerated || 0;
        
        const profit = revenue - (adSpend + apiCosts);
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
            campaignId: campaign.id,
            revenue,
            costs: { adSpend, apiCosts },
            profit,
            margin: margin.toFixed(1) + '%',
            roi: adSpend > 0 ? (profit / adSpend).toFixed(2) : 'N/A'
        };
    }
}

module.exports = { FinanceAgent };
