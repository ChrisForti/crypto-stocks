-- Add sentiment_analysis table for AI-driven stock analysis
-- Run this migration to enable database persistence for sentiment data
CREATE TABLE IF NOT EXISTS sentiment_analysis(
    id serial PRIMARY KEY,
    symbol text NOT NULL,
    sentiment text NOT NULL, -- bullish, bearish, neutral
    confidence integer NOT NULL, -- 0-100
    reasoning text NOT NULL,
    key_factors text[], -- Array of key factors
    recommendation text NOT NULL, -- buy, sell, hold
    time_horizon text NOT NULL,
    risk_level text NOT NULL, -- low, medium, high
    target_price numeric(10, 2),
    ai_model text DEFAULT 'google/gemini-2.0-flash-exp:free',
    timestamp timestamp DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_sentiment_symbol ON sentiment_analysis(symbol);

CREATE INDEX IF NOT EXISTS idx_sentiment_timestamp ON sentiment_analysis(timestamp);

CREATE INDEX IF NOT EXISTS idx_sentiment_type ON sentiment_analysis(sentiment);

-- Create view for latest sentiment per symbol
CREATE OR REPLACE VIEW latest_sentiment AS SELECT DISTINCT ON (symbol)
    symbol,
    sentiment,
    confidence,
    recommendation,
    risk_level,
    target_price,
    timestamp
FROM
    sentiment_analysis
ORDER BY
    symbol,
    timestamp DESC;

COMMENT ON TABLE sentiment_analysis IS 'AI-driven sentiment analysis for stocks using Gemini 2.0 Flash';

COMMENT ON VIEW latest_sentiment IS 'Most recent sentiment analysis for each stock symbol';

