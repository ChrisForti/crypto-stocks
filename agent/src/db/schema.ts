import {
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// ===== AUTONOMOUS ARBITRAGE & LEVERAGE AGENT TABLES =====

// Market depth - live pricing comparison across exchanges
export const marketDepth = pgTable(
  "market_depth",
  {
    id: serial("id").primaryKey(),
    exchangeName: text("exchange_name").notNull(),
    symbol: text("symbol").notNull(),
    bestBid: decimal("best_bid", { precision: 20, scale: 8 }).notNull(),
    bestAsk: decimal("best_ask", { precision: 20, scale: 8 }).notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (table) => ({
    symbolTimestampIdx: index("idx_symbol_timestamp").on(
      table.symbol,
      table.timestamp,
    ),
    exchangeSymbolIdx: index("idx_exchange_symbol").on(
      table.exchangeName,
      table.symbol,
    ),
  }),
);

// Leverage opportunities - potential arbitrage trades
export const leverageOpportunities = pgTable(
  "leverage_opportunities",
  {
    id: serial("id").primaryKey(),
    assetType: text("asset_type").notNull(), // 'crypto' or 'stock'
    symbol: text("symbol").notNull(),
    exchangeA: text("exchange_a"), // Source exchange (lower ask)
    exchangeB: text("exchange_b"), // Target exchange (higher bid)
    rawGapPct: decimal("raw_gap_pct", { precision: 5, scale: 4 }).notNull(),
    leverageMult: integer("leverage_mult").notNull(), // 5, 10, or 20
    projectedRoiPct: decimal("projected_roi_pct", {
      precision: 10,
      scale: 2,
    }).notNull(),
    feePct: decimal("fee_pct", { precision: 5, scale: 4 }).default("0.2"),
    capitalUsed: decimal("capital_used", { precision: 10, scale: 2 }).default(
      "1000.00",
    ),
    status: text("status").default("detected"), // detected, executed, missed, rejected
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    assetTypeIdx: index("idx_asset_type").on(table.assetType),
    createdAtIdx: index("idx_created_at").on(table.createdAt),
    statusIdx: index("idx_status").on(table.status),
  }),
);

// Risk management - kill switch and tracking
export const riskManagement = pgTable("risk_management", {
  id: serial("id").primaryKey(),
  killSwitchActive: boolean("kill_switch_active").default(false),
  consecutiveLosses: integer("consecutive_losses").default(0),
  lastLossTimestamp: timestamp("last_loss_timestamp"),
  totalSimulatedTrades: integer("total_simulated_trades").default(0),
  totalWins: integer("total_wins").default(0),
  totalLosses: integer("total_losses").default(0),
  totalSimulatedProfit: decimal("total_simulated_profit", {
    precision: 12,
    scale: 2,
  }).default("0.00"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Execution log - history of all simulated trades
export const executionLog = pgTable(
  "execution_log",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id").references(
      () => leverageOpportunities.id,
    ),
    action: text("action").notNull(), // simulated_buy, simulated_sell, rejected, kill_switch_triggered
    exchange: text("exchange"),
    symbol: text("symbol").notNull(),
    price: decimal("price", { precision: 20, scale: 8 }),
    amount: decimal("amount", { precision: 20, scale: 8 }),
    feePaid: decimal("fee_paid", { precision: 10, scale: 2 }),
    profitLoss: decimal("profit_loss", { precision: 10, scale: 2 }),
    notes: text("notes"),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (table) => ({
    opportunityIdIdx: index("idx_opportunity_id").on(table.opportunityId),
    timestampIdx: index("idx_timestamp").on(table.timestamp),
  }),
);
