-- Migration for Autonomous Arbitrage & Leverage Agent
-- Run this in Railway PostgreSQL instance
-- Table for live pricing comparison across exchanges
CREATE TABLE IF NOT EXISTS market_depth(
    id serial PRIMARY KEY,
    exchange_name text NOT NULL,
    symbol text NOT NULL,
    best_bid DECIMAL(20, 8) NOT NULL,
    best_ask DECIMAL(20, 8) NOT NULL,
    spread DECIMAL(20, 8) GENERATED ALWAYS AS (best_ask - best_bid) STORED,
    spread_pct DECIMAL(10, 6) GENERATED ALWAYS AS ( CASE WHEN best_bid > 0 THEN
        ((best_ask - best_bid) / best_bid * 100)
    ELSE
        0
    END) STORED,
    timestamp timestamptz DEFAULT NOW(),
    INDEX idx_symbol_timestamp(symbol, timestamp),
    INDEX idx_exchange_symbol(exchange_name, symbol)
);

-- Table for logging potential arbitrage and leverage opportunities
CREATE TABLE IF NOT EXISTS leverage_opportunities(
    id serial PRIMARY KEY,
    asset_type text NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
    symbol text NOT NULL,
    exchange_a text, -- Source exchange (lower ask)
    exchange_b text, -- Target exchange (higher bid)
    raw_gap_pct DECIMAL(5, 4) NOT NULL, -- Price difference percentage
    leverage_mult int NOT NULL CHECK (leverage_mult IN (5, 10, 20)), -- Leverage multiplier
    projected_roi_pct DECIMAL(10, 2) NOT NULL, -- (Gap * Mult) after fees
    fee_pct DECIMAL(5, 4) DEFAULT 0.2, -- Trading fee percentage
    capital_used DECIMAL(10, 2) DEFAULT 1000.00, -- Simulated capital
    projected_profit DECIMAL(10, 2) GENERATED ALWAYS AS (capital_used *(projected_roi_pct / 100)) STORED,
    status text DEFAULT 'detected' CHECK (status IN ('detected', 'executed', 'missed', 'rejected')),
    rejection_reason text, -- Why opportunity was rejected (if applicable)
    created_at timestamptz DEFAULT NOW(),
    INDEX idx_asset_type(asset_type),
    INDEX idx_created_at(created_at),
    INDEX idx_status(status)
);

-- Table for tracking kill switch and risk management
CREATE TABLE IF NOT EXISTS risk_management(
    id serial PRIMARY KEY,
    kill_switch_active boolean DEFAULT FALSE,
    consecutive_losses int DEFAULT 0,
    last_loss_timestamp timestamptz,
    total_simulated_trades int DEFAULT 0,
    total_wins int DEFAULT 0,
    total_losses int DEFAULT 0,
    win_rate_pct DECIMAL(5, 2) GENERATED ALWAYS AS ( CASE WHEN total_simulated_trades > 0 THEN
        (total_wins::DECIMAL / total_simulated_trades * 100)
    ELSE
        0
    END) STORED,
    total_simulated_profit DECIMAL(12, 2) DEFAULT 0.00,
    updated_at timestamptz DEFAULT NOW()
);

-- Insert initial risk management row (singleton pattern)
INSERT INTO risk_management(kill_switch_active)
    VALUES (FALSE)
ON CONFLICT
    DO NOTHING;

-- Table for logging execution history
CREATE TABLE IF NOT EXISTS execution_log(
    id serial PRIMARY KEY,
    opportunity_id int REFERENCES leverage_opportunities(id),
    action text NOT NULL CHECK (action IN ('simulated_buy', 'simulated_sell', 'rejected', 'kill_switch_triggered')),
    exchange text,
    symbol text NOT NULL,
    price DECIMAL(20, 8),
    amount DECIMAL(20, 8),
    fee_paid DECIMAL(10, 2),
    profit_loss DECIMAL(10, 2),
    notes text,
    timestamp timestamptz DEFAULT NOW(),
    INDEX idx_opportunity_id(opportunity_id),
    INDEX idx_timestamp(timestamp)
);

-- View for quick arbitrage opportunities analysis
CREATE OR REPLACE VIEW active_arbitrage_opportunities AS
SELECT
    lo.*,
    el.profit_loss AS actual_profit_loss,
    rm.kill_switch_active
FROM
    leverage_opportunities lo
    LEFT JOIN execution_log el ON lo.id = el.opportunity_id
    CROSS JOIN risk_management rm
WHERE
    lo.status = 'detected'
    AND lo.projected_roi_pct >= 20
    AND lo.projected_roi_pct <= 30
    AND rm.kill_switch_active = FALSE
ORDER BY
    lo.projected_roi_pct DESC,
    lo.created_at DESC;

-- Function to update kill switch based on consecutive losses
CREATE OR REPLACE FUNCTION update_kill_switch()
    RETURNS TRIGGER
    AS $$
BEGIN
    -- Check if this is a loss
    IF NEW.profit_loss < 0 THEN
        UPDATE
            risk_management
        SET
            consecutive_losses = consecutive_losses + 1,
            last_loss_timestamp = NEW.timestamp,
            total_losses = total_losses + 1,
            total_simulated_trades = total_simulated_trades + 1,
            total_simulated_profit = total_simulated_profit + NEW.profit_loss,
            -- Activate kill switch if 3 consecutive losses in 24 hours
            kill_switch_active = CASE WHEN consecutive_losses + 1 >= 3
                AND(NEW.timestamp - last_loss_timestamp) <= INTERVAL '24 hours' THEN
                TRUE
            ELSE
                kill_switch_active
            END,
            updated_at = NOW();
        -- This is a win
    ELSE
        UPDATE
            risk_management
        SET
            consecutive_losses = 0, -- Reset consecutive losses on win
            total_wins = total_wins + 1,
            total_simulated_trades = total_simulated_trades + 1,
            total_simulated_profit = total_simulated_profit + NEW.profit_loss,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Trigger to automatically update kill switch
CREATE TRIGGER trigger_update_kill_switch
    AFTER INSERT ON execution_log
    FOR EACH ROW
    WHEN(NEW.profit_loss IS NOT NULL)
    EXECUTE FUNCTION update_kill_switch();

-- Function to reset kill switch manually
CREATE OR REPLACE FUNCTION reset_kill_switch()
    RETURNS void
    AS $$
BEGIN
    UPDATE
        risk_management
    SET
        kill_switch_active = FALSE,
        consecutive_losses = 0,
        updated_at = NOW();
END;
$$
LANGUAGE plpgsql;

