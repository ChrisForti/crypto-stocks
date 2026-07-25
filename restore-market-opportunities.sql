-- Restore market_opportunities table
CREATE TABLE IF NOT EXISTS public.market_opportunities(
    id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    opportunity text NOT NULL,
    market_why text,
    material_recommendation text,
    cnc_edge text,
    target_buyer_persona text,
    craft_type text,
    hull_type text,
    construction_method text,
    length text,
    width text,
    primary_wood text,
    accent_wood text,
    finish_trend text,
    price_point text,
    market_sentiment text,
    luxury_features text,
    source_origin text,
    PRIMARY KEY (id)
);

CREATE SEQUENCE IF NOT EXISTS public.market_opportunities_id_seq AS integer START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

ALTER SEQUENCE public.market_opportunities_id_seq OWNED BY public.market_opportunities.id;

ALTER TABLE ONLY public.market_opportunities
    ALTER COLUMN id SET DEFAULT nextval('public.market_opportunities_id_seq'::regclass);

