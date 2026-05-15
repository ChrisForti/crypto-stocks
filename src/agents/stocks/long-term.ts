/**
 * Stock Long-Term Agent
 *
 * AI-driven sentiment analysis using OpenRouter (Gemini 2.0 Flash)
 * Analyzes market trends, news, and technical indicators
 * Provides long-term investment recommendations
 */

import OpenAI from "openai";
import { db } from "../../db/index.js";
import { sentimentAnalysis } from "../../db/schema.js";

interface SentimentAnalysis {
  symbol: string;
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  recommendation: "buy" | "sell" | "hold";
  timeHorizon: string;
  riskLevel: "low" | "medium" | "high";
  targetPrice?: number;
  timestamp: Date;
}

class StockLongTermAgent {
  private openai: OpenAI;
  private readonly SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"];
  private readonly CHECK_INTERVAL = 3600000; // 1 hour
  private isRunning: boolean;

  constructor() {
    // Initialize OpenRouter client (compatible with OpenAI SDK)
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || "",
    });

    this.isRunning = false;

    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("⚠️  No OPENROUTER_API_KEY found in environment");
    }
  }

  /**
   * Start long-term sentiment analysis
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Long-Term Agent already running");
      return;
    }

    this.isRunning = true;
    console.log("🧠 Starting Stock Long-Term AI Agent...");
    console.log(`   Model: Gemini 2.0 Flash (via OpenRouter)`);
    console.log(`   Monitoring: ${this.SYMBOLS.join(", ")}`);
    console.log(
      `   Analysis Interval: ${this.CHECK_INTERVAL / 60000} minutes\n`,
    );

    while (this.isRunning) {
      try {
        for (const symbol of this.SYMBOLS) {
          console.log(`\n🔍 Analyzing ${symbol}...`);
          const analysis = await this.analyzeSentiment(symbol);
          this.displayAnalysis(analysis);

          // Save to database
          await this.saveToDatabase(analysis);

          // Delay between symbols to avoid rate limits
          await this.sleep(5000);
        }

        console.log(
          `\n⏰ Next analysis in ${this.CHECK_INTERVAL / 60000} minutes...\n`,
        );
        await this.sleep(this.CHECK_INTERVAL);
      } catch (error) {
        console.error("❌ Error in long-term analysis loop:", error);
        await this.sleep(60000); // Wait 1 minute on error
      }
    }
  }

  /**
   * Analyze sentiment for a stock symbol using AI
   */
  private async analyzeSentiment(symbol: string): Promise<SentimentAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(symbol);

      const completion = await this.openai.chat.completions.create({
        model:
          process.env.OPENROUTER_MODEL ||
          "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "You are an expert financial analyst specializing in long-term stock market analysis. Provide detailed, data-driven investment insights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
      });

      const response = completion.choices[0]?.message?.content || "";

      // Parse AI response into structured format
      return this.parseAIResponse(symbol, response);
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);

      // Return fallback neutral analysis
      return {
        symbol,
        sentiment: "neutral",
        confidence: 0,
        reasoning: "Analysis failed - using fallback",
        keyFactors: ["API Error"],
        recommendation: "hold",
        timeHorizon: "N/A",
        riskLevel: "medium",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Build analysis prompt for AI
   */
  private buildAnalysisPrompt(symbol: string): string {
    return `Analyze ${symbol} stock for long-term investment potential (6-12 months).

Please provide:
1. Overall sentiment (bullish/bearish/neutral) with confidence level (0-100%)
2. Key factors influencing the stock (minimum 3)
3. Recommendation (buy/sell/hold)
4. Time horizon for the recommendation
5. Risk level (low/medium/high)
6. Optional: Target price estimate

Consider:
- Recent market trends and sector performance
- Company fundamentals and financial health
- Macroeconomic factors and industry outlook
- Technical indicators and price momentum
- Recent news and analyst sentiment

Format your response as JSON with the following structure:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 75,
  "reasoning": "Detailed explanation...",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "recommendation": "buy|sell|hold",
  "timeHorizon": "6-12 months",
  "riskLevel": "low|medium|high",
  "targetPrice": 250.00
}`;
  }

  /**
   * Parse AI response into structured analysis
   */
  private parseAIResponse(symbol: string, response: string): SentimentAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          symbol,
          sentiment: parsed.sentiment || "neutral",
          confidence: parsed.confidence || 50,
          reasoning: parsed.reasoning || "No reasoning provided",
          keyFactors: parsed.keyFactors || [],
          recommendation: parsed.recommendation || "hold",
          timeHorizon: parsed.timeHorizon || "6-12 months",
          riskLevel: parsed.riskLevel || "medium",
          targetPrice: parsed.targetPrice,
          timestamp: new Date(),
        };
      }

      // Fallback: Parse free-form text
      return this.parseFreeformResponse(symbol, response);
    } catch (error) {
      console.error("Error parsing AI response:", error);

      return {
        symbol,
        sentiment: "neutral",
        confidence: 50,
        reasoning: response.substring(0, 200),
        keyFactors: ["AI response parsing failed"],
        recommendation: "hold",
        timeHorizon: "uncertain",
        riskLevel: "medium",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Parse free-form AI response
   */
  private parseFreeformResponse(
    symbol: string,
    response: string,
  ): SentimentAnalysis {
    const lowerResponse = response.toLowerCase();

    // Detect sentiment
    let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
    if (
      lowerResponse.includes("bullish") ||
      lowerResponse.includes("positive outlook")
    ) {
      sentiment = "bullish";
    } else if (
      lowerResponse.includes("bearish") ||
      lowerResponse.includes("negative outlook")
    ) {
      sentiment = "bearish";
    }

    // Detect recommendation
    let recommendation: "buy" | "sell" | "hold" = "hold";
    if (lowerResponse.includes("buy") || lowerResponse.includes("accumulate")) {
      recommendation = "buy";
    } else if (
      lowerResponse.includes("sell") ||
      lowerResponse.includes("avoid")
    ) {
      recommendation = "sell";
    }

    // Detect risk level
    let riskLevel: "low" | "medium" | "high" = "medium";
    if (
      lowerResponse.includes("low risk") ||
      lowerResponse.includes("conservative")
    ) {
      riskLevel = "low";
    } else if (
      lowerResponse.includes("high risk") ||
      lowerResponse.includes("volatile")
    ) {
      riskLevel = "high";
    }

    return {
      symbol,
      sentiment,
      confidence: 60,
      reasoning: response.substring(0, 300),
      keyFactors: ["Parsed from free-form response"],
      recommendation,
      timeHorizon: "6-12 months",
      riskLevel,
      timestamp: new Date(),
    };
  }

  /**
   * Save analysis to database
   */
  private async saveToDatabase(analysis: SentimentAnalysis) {
    try {
      await db.insert(sentimentAnalysis).values({
        symbol: analysis.symbol,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        keyFactors: analysis.keyFactors,
        recommendation: analysis.recommendation,
        timeHorizon: analysis.timeHorizon,
        riskLevel: analysis.riskLevel,
        targetPrice: analysis.targetPrice?.toString(),
        aiModel:
          process.env.OPENROUTER_MODEL ||
          "meta-llama/llama-3.1-8b-instruct:free",
      });

      console.log(`💾 Saved ${analysis.symbol} analysis to database`);
    } catch (error) {
      console.error(`❌ Failed to save ${analysis.symbol} to database:`, error);
    }
  }

  /**
   * Display analysis in console
   */
  private displayAnalysis(analysis: SentimentAnalysis) {
    const sentimentEmoji = {
      bullish: "📈",
      bearish: "📉",
      neutral: "➡️",
    };

    const recommendationEmoji = {
      buy: "✅",
      sell: "❌",
      hold: "⏸️",
    };

    const riskEmoji = {
      low: "🟢",
      medium: "🟡",
      high: "🔴",
    };

    console.log(
      `\n╔════════════════════════════════════════════════════════════╗`,
    );
    console.log(`║  ${analysis.symbol} - Long-Term Analysis`);
    console.log(
      `╠════════════════════════════════════════════════════════════╣`,
    );
    console.log(
      `║  ${sentimentEmoji[analysis.sentiment]} Sentiment: ${analysis.sentiment.toUpperCase()} (${analysis.confidence}% confidence)`,
    );
    console.log(
      `║  ${recommendationEmoji[analysis.recommendation]} Recommendation: ${analysis.recommendation.toUpperCase()}`,
    );
    console.log(
      `║  ${riskEmoji[analysis.riskLevel]} Risk Level: ${analysis.riskLevel.toUpperCase()}`,
    );
    console.log(`║  ⏱️  Time Horizon: ${analysis.timeHorizon}`);

    if (analysis.targetPrice) {
      console.log(`║  🎯 Target Price: $${analysis.targetPrice.toFixed(2)}`);
    }

    console.log(
      `╠════════════════════════════════════════════════════════════╣`,
    );
    console.log(`║  📝 Reasoning:`);
    console.log(`║  ${this.wrapText(analysis.reasoning, 58)}`);
    console.log(
      `╠════════════════════════════════════════════════════════════╣`,
    );
    console.log(`║  🔑 Key Factors:`);

    for (const factor of analysis.keyFactors) {
      console.log(`║    • ${this.wrapText(factor, 54)}`);
    }

    console.log(
      `╚════════════════════════════════════════════════════════════╝`,
    );
  }

  /**
   * Wrap text for display
   */
  private wrapText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    const lines: string[] = [];
    let currentLine = "";

    for (const word of text.split(" ")) {
      if ((currentLine + word).length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines.join("\n║  ");
  }

  /**
   * Analyze specific symbol on demand
   */
  async analyzeSymbol(symbol: string) {
    console.log(`\n🧠 Running ad-hoc analysis for ${symbol}...\n`);
    const analysis = await this.analyzeSentiment(symbol);
    this.displayAnalysis(analysis);
    await this.saveToDatabase(analysis);
    return analysis;
  }

  /**
   * Add symbol to watch list
   */
  addSymbol(symbol: string) {
    if (!this.SYMBOLS.includes(symbol.toUpperCase())) {
      this.SYMBOLS.push(symbol.toUpperCase());
      console.log(`✅ Added ${symbol} to watch list`);
    }
  }

  /**
   * Remove symbol from watch list
   */
  removeSymbol(symbol: string) {
    const index = this.SYMBOLS.indexOf(symbol.toUpperCase());
    if (index > -1) {
      this.SYMBOLS.splice(index, 1);
      console.log(`✅ Removed ${symbol} from watch list`);
    }
  }

  /**
   * Get current watch list
   */
  getWatchList(): string[] {
    return [...this.SYMBOLS];
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log("\n🛑 Stopping Long-Term AI Agent...");
    this.isRunning = false;
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const stockLongTermAgent = new StockLongTermAgent();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Received SIGINT signal");
  stockLongTermAgent.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Received SIGTERM signal");
  stockLongTermAgent.stop();
  process.exit(0);
});
