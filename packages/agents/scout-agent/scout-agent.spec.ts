import { ScoutAgent } from './scout-agent';

describe('ScoutAgent — computeQualityScore()', () => {
  let agent: ScoutAgent;

  beforeEach(() => {
    agent = new ScoutAgent({
      anthropicApiKey: 'test-key',
      googlePlacesKey: 'test-key',
      googlePagespeedKey: 'test-key',
      hunterKey: 'test-key',
      gtmetrixApiKey: 'test-key',
      pingdomApiKey: 'test-key',
    });
  });

  it('should return Claude score if no technical data is present', () => {
    const analysis = { qualityScore: 75 };
    const score = agent.computeQualityScore({}, null, analysis, null, null);
    expect(score).toBe(75);
  });

  it('should blend Claude score with average technical badness (PS, GTMetrix, Pingdom)', () => {
    // Claude score (badness) = 50
    // PageSpeed: 20 -> 80 badness
    // GTMetrix: 40 -> 60 badness
    // Pingdom: 60 -> 40 badness
    // Avg Tech Badness: (80 + 60 + 40) / 3 = 60
    // Final score: (50 + 60) / 2 = 55
    const analysis = { qualityScore: 50 };
    const pagespeed = { score: 20 };
    const gtmetrix = { score: 40 };
    const pingdom = { score: 60 };
    const score = agent.computeQualityScore({}, pagespeed, analysis, gtmetrix, pingdom);
    expect(score).toBe(55);
  });

  it('should handle partial technical data correctly', () => {
    // Claude score (badness) = 50
    // GTMetrix: 30 -> 70 badness
    // Avg Tech Badness: 70
    // Final score: (50 + 70) / 2 = 60
    const analysis = { qualityScore: 50 };
    const gtmetrix = { score: 30 };
    const score = agent.computeQualityScore({}, null, analysis, gtmetrix, null);
    expect(score).toBe(60);
  });

  it('should handle high performance scores across all metrics', () => {
    // Claude score (badness) = 50
    // PS: 90 -> 10 badness
    // GTMetrix: 95 -> 5 badness
    // Pingdom: 100 -> 0 badness
    // Avg Tech Badness: (10 + 5 + 0) / 3 = 5
    // Final score: (50 + 5) / 2 = 27.5 -> 28
    const analysis = { qualityScore: 50 };
    const pagespeed = { score: 90 };
    const gtmetrix = { score: 95 };
    const pingdom = { score: 100 };
    const score = agent.computeQualityScore({}, pagespeed, analysis, gtmetrix, pingdom);
    expect(score).toBe(28);
  });

  it('should clamp the score between 0 and 100', () => {
    const analysisLow = { qualityScore: -10 };
    expect(agent.computeQualityScore({}, null, analysisLow, null, null)).toBe(0);

    const analysisHigh = { qualityScore: 110 };
    expect(agent.computeQualityScore({}, null, analysisHigh, null, null)).toBe(100);
  });

  it('should use default 50 if analysis provides no score', () => {
    const analysis = {};
    const score = agent.computeQualityScore({}, null, analysis, null, null);
    expect(score).toBe(50);
  });
});
