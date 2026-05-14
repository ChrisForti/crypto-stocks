CREATE TABLE IF NOT EXISTS "execution_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer,
	"action" text NOT NULL,
	"exchange" text,
	"symbol" text NOT NULL,
	"price" numeric(20, 8),
	"amount" numeric(20, 8),
	"fee_paid" numeric(10, 2),
	"profit_loss" numeric(10, 2),
	"notes" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leverage_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_type" text NOT NULL,
	"symbol" text NOT NULL,
	"exchange_a" text,
	"exchange_b" text,
	"raw_gap_pct" numeric(5, 4) NOT NULL,
	"leverage_mult" integer NOT NULL,
	"projected_roi_pct" numeric(10, 2) NOT NULL,
	"fee_pct" numeric(5, 4) DEFAULT '0.2',
	"capital_used" numeric(10, 2) DEFAULT '1000.00',
	"status" text DEFAULT 'detected',
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_depth" (
	"id" serial PRIMARY KEY NOT NULL,
	"exchange_name" text NOT NULL,
	"symbol" text NOT NULL,
	"best_bid" numeric(20, 8) NOT NULL,
	"best_ask" numeric(20, 8) NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "risk_management" (
	"id" serial PRIMARY KEY NOT NULL,
	"kill_switch_active" boolean DEFAULT false,
	"consecutive_losses" integer DEFAULT 0,
	"last_loss_timestamp" timestamp,
	"total_simulated_trades" integer DEFAULT 0,
	"total_wins" integer DEFAULT 0,
	"total_losses" integer DEFAULT 0,
	"total_simulated_profit" numeric(12, 2) DEFAULT '0.00',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sentiment_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"sentiment" text NOT NULL,
	"confidence" integer NOT NULL,
	"reasoning" text NOT NULL,
	"key_factors" text[],
	"recommendation" text NOT NULL,
	"time_horizon" text NOT NULL,
	"risk_level" text NOT NULL,
	"target_price" numeric(10, 2),
	"ai_model" text DEFAULT 'google/gemini-2.0-flash-exp:free',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "kayak_opportunities";--> statement-breakpoint
DROP TABLE "standup_opportunities";--> statement-breakpoint
DROP TABLE "surfboard_opportunities";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opportunity_id" ON "execution_log" ("opportunity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timestamp" ON "execution_log" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asset_type" ON "leverage_opportunities" ("asset_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_created_at" ON "leverage_opportunities" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_status" ON "leverage_opportunities" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_symbol_timestamp" ON "market_depth" ("symbol","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_exchange_symbol" ON "market_depth" ("exchange_name","symbol");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sentiment_symbol" ON "sentiment_analysis" ("symbol");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sentiment_timestamp" ON "sentiment_analysis" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sentiment_type" ON "sentiment_analysis" ("sentiment");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "execution_log" ADD CONSTRAINT "execution_log_opportunity_id_leverage_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "leverage_opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
