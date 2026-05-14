--
-- PostgreSQL database dump
--

\restrict sfaDFpaSfcbhfgdGcdbvLXE5nEhQ92dXrpt5bOxs9zmqEL2lnd03pk4TzsSbpLb

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: jimmy
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO jimmy;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: jimmy
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO jimmy;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: jimmy
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO jimmy;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: jimmy
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: market_opportunities; Type: TABLE; Schema: public; Owner: jimmy
--

CREATE TABLE public.market_opportunities (
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
    source_origin text
);


ALTER TABLE public.market_opportunities OWNER TO jimmy;

--
-- Name: market_opportunities_id_seq; Type: SEQUENCE; Schema: public; Owner: jimmy
--

CREATE SEQUENCE public.market_opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.market_opportunities_id_seq OWNER TO jimmy;

--
-- Name: market_opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jimmy
--

ALTER SEQUENCE public.market_opportunities_id_seq OWNED BY public.market_opportunities.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: jimmy
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: market_opportunities id; Type: DEFAULT; Schema: public; Owner: jimmy
--

ALTER TABLE ONLY public.market_opportunities ALTER COLUMN id SET DEFAULT nextval('public.market_opportunities_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: jimmy
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	31c918e05a998f11dab27e63aace921aa335d83f6785de308f115164f4a9de6e	1777340141427
2	4893f0c733f4125f6f4304e58591bd8232486bfe8e13902b4ffbc3cf22d3d774	1777426025929
\.


--
-- Data for Name: market_opportunities; Type: TABLE DATA; Schema: public; Owner: jimmy
--

COPY public.market_opportunities (id, "timestamp", opportunity, market_why, material_recommendation, cnc_edge, target_buyer_persona, craft_type, hull_type, construction_method, length, width, primary_wood, accent_wood, finish_trend, price_point, market_sentiment, luxury_features, source_origin) FROM stdin;
1	2026-04-28 02:26:30.068789	14' Hollow-Wood Touring SUP with Tech Integration	2026 data shows 34% increase in luxury touring board sales, with customers specifically seeking 14' displacement hulls for stability and speed. Instagram hashtag #woodenSUP has 2.3M posts with 'touring' as dominant category.	Western Red Cedar hull with Dark Walnut racing stripe and accent rails. Bio-epoxy eco-luxe finish (matte) appeals to sustainability-conscious luxury buyers.	Use 3018 Pro to mill custom GPS mount plates (StarBoard), personalized nameplate inlays (Teak/Walnut), and precision-cut decorative animal motifs for premium customization.	Affluent outdoor enthusiasts, 35-55, value craftsmanship and sustainability, willing to pay $4500-6500 for heirloom-quality boards. Priority: aesthetics + performance.	SUP	Touring/Displacement	Hollow-wood	14'	28"-30"	Western Red Cedar	Dark Walnut	Bio-Epoxy Eco-Luxe (Matte)	$4500-6500	Strong Growth	GPS mounts, custom inlays, racing stripes, personalized nameplates	\N
2	2026-04-28 02:31:40.821513	14' Hollow-Wood Touring SUP with Tech Integration	2026 data shows 34% increase in luxury touring board sales, with customers specifically seeking 14' displacement hulls for stability and speed. Instagram hashtag #woodenSUP has 2.3M posts with 'touring' as dominant category.	Western Red Cedar hull with Dark Walnut racing stripe and accent rails. Bio-epoxy eco-luxe finish (matte) appeals to sustainability-conscious luxury buyers.	Use 3018 Pro to mill custom GPS mount plates (StarBoard), personalized nameplate inlays (Teak/Walnut), and precision-cut decorative animal motifs for premium customization.	Affluent outdoor enthusiasts, 35-55, value craftsmanship and sustainability, willing to pay $4500-6500 for heirloom-quality boards. Priority: aesthetics + performance.	SUP	Touring/Displacement	Hollow-wood	14'	28"-30"	Western Red Cedar	Dark Walnut	Bio-Epoxy Eco-Luxe (Matte)	$4500-6500	Strong Growth	GPS mounts, custom inlays, racing stripes, personalized nameplates	\N
3	2026-04-28 02:31:40.821513	12'6" Cedar-Strip Racing SUP with Carbon Reinforcements	Racing SUP market projected to grow at 10.95% CAGR. Carbon sandwich laminates in displacement hulls command premium prices. Rising demand for high-performance boards among competitive paddlers.	Canadian Red Cedar strips with Carbon reinforcements for optimal strength-to-weight ratio. Sleek design with minimalistic finish for speed-focused enthusiasts.	Utilize 3018 Pro for precision shaping of carbon fiber inserts, ensuring structural integrity and performance enhancement.	Competitive paddlers, age 25-45, prioritize speed and agility. Willing to invest $3500-5000 for cutting-edge racing technology.	SUP	Racing/Displacement	Cedar-Strip	12'6"	26"-28"	Canadian Red Cedar	Carbon Fiber	Minimalistic Carbon Finish	$3500-5000	High Growth	Carbon reinforcements, precision shaping, lightweight design	\N
4	2026-04-28 02:31:40.821513	Hollow-Wood Longboard Surfboard with CNC Decorative Inlays	Surfboard market shows a demand for premium handcrafted boards. Longboard segment gaining popularity for classic styling and performance characteristics.	Mix of Western Red Cedar and Mahogany for durability and aesthetics. Intricate CNC-cut decorative inlays for a personalized touch.	Leverage 3018 Pro for intricate geometric inlays, bringing a modern twist to classic longboard designs.	Surf enthusiasts, age 30-50, nostalgic for classic longboarding era. Will pay $2500-4000 for bespoke, high-performance longboards.	Surfboard	Longboard	Hollow-wood	9'6"-10'	22"-24"	Western Red Cedar	Mahogany	Hand-rubbed Matte Finish	$2500-4000	Stable Growth	Decorative CNC inlays, classic styling	\N
5	2026-04-28 02:31:40.821513	Personalized Cedar-Strip Solo Expedition Kayak	Expedition kayak market seeing increased interest from adventurers seeking premium custom builds. Cedar-strip construction offers a blend of performance and aesthetics.	Premium Western Red Cedar construction with Teak accents. Bio-resin finish for eco-conscious outdoor enthusiasts.	Customize kayak with precision-cut inlays of wildlife motifs or personalized engravings using the 3018 Pro CNC machine.	Adventure seekers, age 30-60, willing to invest $4000-6000 for custom expedition kayaks. Value craftsmanship and unique design.	Kayak	Expedition	Cedar-Strip	16'-18'	22"-24"	Western Red Cedar	Teak	Bio-Resin Eco-Finish	$4000-6000	Growing Demand	Custom inlays, personalized engravings	\N
6	2026-04-28 02:31:40.821513	CNC-Machined Decorative Inlays for Artisan Paddleboard Accessories	Growing trend of personalized accessories in the paddleboarding market. CNC-machined inlays offer a unique and premium customization option for current paddleboard owners.	Utilize a variety of marine hardwoods like Teak, Mahogany, and Walnut for intricate inlay designs. Acrylic accents for a modern touch.	Offer custom CNC-machined inlays for paddleboard fins, paddles, or deck accessories, catering to individual preferences for aesthetics.	Paddleboard owners looking to personalize their gear, age 25-45, appreciate unique customization options. Willing to pay $200-500 for bespoke CNC accessories.	Artisan Accessories	N/A	CNC-Machined	N/A	N/A	Teak, Mahogany, Walnut	Acrylic	Intricate CNC Inlays	$200-500	Rising Trend	Custom CNC-machined designs	\N
7	2026-04-28 02:34:21.730161	14' Hollow-Wood Touring SUP with Tech Integration	2026 data shows 34% increase in luxury touring board sales, with customers specifically seeking 14' displacement hulls for stability and speed. Instagram hashtag #woodenSUP has 2.3M posts with 'touring' as dominant category.	Western Red Cedar hull with Dark Walnut racing stripe and accent rails. Bio-epoxy eco-luxe finish (matte) appeals to sustainability-conscious luxury buyers.	Use 3018 Pro to mill custom GPS mount plates (StarBoard), personalized nameplate inlays (Teak/Walnut), and precision-cut decorative animal motifs for premium customization.	Affluent outdoor enthusiasts, 35-55, value craftsmanship and sustainability, willing to pay $4500-6500 for heirloom-quality boards. Priority: aesthetics + performance.	SUP	Touring/Displacement	Hollow-wood	14'	28"-30"	Western Red Cedar	Dark Walnut	Bio-Epoxy Eco-Luxe (Matte)	$4500-6500	Strong Growth	GPS mounts, custom inlays, racing stripes, personalized nameplates	\N
8	2026-04-28 02:34:21.730161	12'6" Cedar-Strip Recreational SUP with Advanced Fin Setup	Recreational SUP market growing at 7.55% CAGR, demand for all-around boards declining as users seek specialized features. Western Red Cedar trending for aesthetic appeal and lightweight performance.	Primary cedar-strip construction with Paulownia or Mahogany accent for visual contrast. Satin varnish finish for a traditional yet premium look.	Utilize 3018 Pro for precision fin box milling to accommodate various fin setups, offering versatility for different water conditions.	Health-conscious active individuals, 25-45, looking for durability and performance in a visually appealing package. Willing to invest $3000-4500 for a unique board.	SUP	Recreational/All-Around	Cedar-strip	12'6"	30"-32"	Western Red Cedar	Paulownia or Mahogany	Satin Varnish	$3000-4500	Growing	Advanced fin setup, custom tailoring options	\N
9	2026-04-28 02:34:21.730161	Custom Hollow Wooden Mid-length Surfboard with Inlay Options	Surfboard segment showing interest in artisan builds, especially mid-length boards for versatile performance. Consumers looking for unique design elements and customization options.	Blend of Cedar and Mahogany for a lightweight yet durable construction. Gloss finish with intricate inlay designs to cater to the customization trend.	Precision-cut decorative inlays using 3018 Pro, offering customers a range of customization options for personalized boards.	Surfing enthusiasts, 20-40, seeking premium boards with unique designs. Willing to pay $2500-4000 for a handcrafted surfboard that stands out in the lineup.	Surfboard	Mid-length	Hollow-wood	7'6"-8'6"	20"-22"	Cedar	Mahogany	Gloss Finish with Inlays	$2500-4000	Rising Interest	Customizable inlays, unique design elements	\N
10	2026-04-28 02:34:21.730161	Cedar-Strip Solo Pack Canoe with CNC-Machined Accessories	Growing interest in sustainable watercraft, expanding to the canoe segment. Lightweight solo pack canoes gaining popularity for outdoor adventures.	Cedar-strip construction with Teak accents for a classic look. Matte eco-friendly finish to align with sustainability trends.	Utilize 3018 Pro for creating custom CNC-machined accessories like yoke pads, seat frames, and deck plates for functional and aesthetic enhancements.	Outdoor enthusiasts, 30-50, who value traditional craftsmanship and eco-conscious products. Prepared to invest $3500-5000 for a premium solo canoe.	Canoe	\N	Cedar-strip	14'	\N	Cedar	Teak	Matte Eco-Friendly	$3500-5000	Emerging Trend	Custom CNC-machined accessories, lightweight design	\N
11	2026-04-28 02:34:21.730161	Custom Cedar-Strip Expedition Kayak with Decorative Inlays	Expedition kayaks attracting attention for their versatility and durability. Consumers looking for artisan-built options with personalized touches.	Western Red Cedar construction with Walnut inlays for a visually striking appearance. Clear gloss finish for a polished look.	Incorporate CNC-cut decorative inlays into the kayak design using the 3018 Pro for intricate customization and premium aesthetics.	Adventure seekers, 25-45, interested in high-performance kayaks with unique design elements. Willing to pay $4000-6000 for a customized expedition kayak.	Kayak	\N	Cedar-strip	16'-18'	\N	Western Red Cedar	Walnut	Clear Gloss	$4000-6000	Growing Demand	Decorative inlays, personalized design	\N
12	2026-04-28 22:38:34.121622	14' Hollow-Wood Touring SUP with Tech Integration	2026 data shows 34% increase in luxury touring board sales, with customers specifically seeking 14' displacement hulls for stability and speed. Instagram hashtag #woodenSUP has 2.3M posts with 'touring' as dominant category.	Western Red Cedar hull with Dark Walnut racing stripe and accent rails. Bio-epoxy eco-luxe finish (matte) appeals to sustainability-conscious luxury buyers.	Use 3018 Pro to mill custom GPS mount plates (StarBoard), personalized nameplate inlays (Teak/Walnut), and precision-cut decorative animal motifs for premium customization.	Affluent outdoor enthusiasts, 35-55, value craftsmanship and sustainability, willing to pay $4500-6500 for heirloom-quality boards. Priority: aesthetics + performance.	SUP	Touring/Displacement	Hollow-wood	14'	28"-30"	Western Red Cedar	Dark Walnut	Bio-Epoxy Eco-Luxe (Matte)	$4500-6500	Strong Growth	GPS mounts, custom inlays, racing stripes, personalized nameplates	\N
13	2026-04-28 22:38:34.121622	Hollow Wooden Surfboard - Longboard/Mid-length segments	Demand for hollow wooden surfboards surging in boutique markets, especially for longboard and mid-length segments. Trend fueled by luxury surf culture and craftsmanship appreciation.	Blend of Paulownia and Mahogany for lightweight performance with striking aesthetics. Highlight natural wood grain patterns with high-gloss marine varnish finish.	Utilize 3018 Pro for intricate fin box shaping, custom logo inlays, and precision-cut deck patterns for unique customization.	Discerning surf enthusiasts seeking premium, handcrafted boards for timeless style and superior ride. Willing to invest $3000-5000 for bespoke, heirloom-quality surfcraft.	Surfboard	Longboard/Mid-Length	Hollow-wood	\N	\N	Paulownia	Mahogany	High-Gloss Marine Varnish	$3000-5000	Rapid Growth	Custom fin boxes, logo inlays, intricate deck patterns	\N
14	2026-04-28 22:38:34.121622	Cedar-Strip Canoe - Solo Pack Boat	Solo pack canoes gaining popularity among outdoor adventurers for lightweight exploration. Cedar-strip construction offers excellent durability and customizable designs.	Select Western Red Cedar strips for hull with Ash gunwales for added strength. Enhance aesthetics with Cherry accents and Ash seats. Opt for marine-grade varnish for protection.	Employ 3018 Pro for precision cutting of intricate deck patterns, personalized inlays, and custom seat contours for ergonomic comfort.	Solo paddlers looking for premium, hand-built canoes for backcountry trips and serene lake paddles. Willing to pay $4000-6000 for artisan-crafted, lightweight canoes.	Canoe	Solo Pack Boat	Cedar-Strip	\N	\N	Western Red Cedar	Cherry	Marine-Grade Varnish	$4000-6000	Emerging Trend	Custom deck patterns, personalized inlays, ergonomic seat contours	\N
15	2026-04-28 22:38:34.121622	CNC-Machined Artisan Fin Boxes & Decorative Inlays	Growing demand for custom fin boxes and decorative inlays in artisan watercraft. Customers seek unique, personalized touches to enhance the aesthetic and performance of their boards.	Utilize precision CNC machining with Teak or Walnut for fin boxes, and Maple or Cherry for inlays. Offer customization options for intricate designs and personalization.	Leverage 3018 Pro for precise cutting of fin box slots, routering decorative inlays, and creating custom shapes for functional yet artistic enhancements.	Artisanal craft enthusiasts and paddleboard connoisseurs looking to elevate the aesthetics and performance of their boards. Willing to invest in bespoke, tailored components.	Technical Accessories	\N	CNC-Integrated Composite	\N	\N	Teak, Walnut, Maple, Cherry	\N	\N	Varies based on customization	Increasing Demand	Precision-cut fin boxes, decorative inlays, personalized designs	\N
16	2026-04-29 01:32:00.844209	14' Hollow-Wood Touring SUP with Tech Integration	2026 data shows 34% increase in luxury touring board sales, with customers specifically seeking 14' displacement hulls for stability and speed. Instagram hashtag #woodenSUP has 2.3M posts with 'touring' as dominant category.	Western Red Cedar hull with Dark Walnut racing stripe and accent rails. Bio-epoxy eco-luxe finish (matte) appeals to sustainability-conscious luxury buyers.	Use 3018 Pro to mill custom GPS mount plates (StarBoard), personalized nameplate inlays (Teak/Walnut), and precision-cut decorative animal motifs for premium customization.	Affluent outdoor enthusiasts, 35-55, value craftsmanship and sustainability, willing to pay $4500-6500 for heirloom-quality boards. Priority: aesthetics + performance.	SUP	Touring/Displacement	Hollow-wood	14'	28"-30"	Western Red Cedar	Dark Walnut	Bio-Epoxy Eco-Luxe (Matte)	$4500-6500	Strong Growth	GPS mounts, custom inlays, racing stripes, personalized nameplates	NMMA 2026 Boating Market Report, Instagram Analytics #woodenSUP, Verified Market Research
17	2026-04-29 01:32:00.844209	12'6" Cedar-Strip High-End SUP with Eco-Luxe Finish	Growing trend towards artisan-crafted wooden SUPs using cedar-strip construction for lightweight performance. Eco-luxe finishes gaining popularity among luxury buyers seeking sustainable products.	Cedar-strip hull with Paulownia accents for a visually striking design. Bio-resin eco-luxe finish enhances durability and aesthetics for luxury appeal.	Leverage 3018 Pro CNC for precision-cut decorative inlays, custom fin setups, and integrated tech mounting solutions, catering to tech-savvy customers.	Environmentally conscious individuals, 30-50, willing to invest $3500-5000 in premium wooden SUPs. Emphasis on performance, aesthetics, and eco-friendliness.	SUP	All-Around	Cedar-Strip	12'6"	30"	Cedar	Paulownia	Eco-Luxe Finish	$3500-5000	Growing Demand	Custom inlays, specialized fin setups, Eco-Luxe finish	Alibaba Wood SUP Market Analysis, Coherent Market Insights Stand-Up Paddleboard Market Report
18	2026-04-29 01:32:00.844209	Custom Cedar-Strip Expedition Kayak with CNC-Machined Accents	Rising interest in artisanal cedar-strip watercraft for solo pack boat and expedition kayak segments. Customers seeking personalized, hand-built kayaks for unique on-water experiences.	Durable Cedar-Strip construction with Mahogany accents for a classic yet luxurious aesthetic. Custom CNC-machined fittings and inlays enhance both functionality and visual appeal.	Utilize 3018 Pro CNC for precision-machined fin boxes, decorative inlays, and personalized nameplates, offering a high level of customization for discerning buyers.	Adventure enthusiasts, 25-45, willing to pay $4000-6000 for bespoke expedition kayaks. Value craftsmanship, performance, and unique design features.	Kayak	Expedition	Cedar-Strip	Varies	30"-34"	Cedar	Mahogany	Custom CNC-Machined Accents	$4000-6000	Emerging Niche	CNC-machined parts, personalized inlays, expedition-ready design	Cognitive Market Research SUP Boards and Paddles Market Report, Little Bay Boards Artisan Kayak Sales Data
19	2026-04-29 01:32:00.844209	Artisan Wooden Longboard Surfboard with Decorative Inlays	Upsurge in demand for handcrafted wooden surfboards in the longboard segment. Customers prioritize aesthetics and performance, driving interest in custom-built wooden longboards.	Exquisite Cedar-Strip construction complemented by Teak or Walnut inlays for a visually stunning appearance. Handcrafted with precision for superior performance.	Employ 3018 Pro CNC for intricate decorative inlays, customized fin boxes, and precision shaping, adding unique design elements and enhancing performance.	Surfing enthusiasts, 20-40, discerning collectors willing to invest $3000-4500 in customized wooden longboards. Emphasis on aesthetics and high-performance surfing.	Surfboard	Longboard	Cedar-Strip	9'6"-10'2"	22"-24"	Cedar	Teak or Walnut	Custom Decorative Inlays	$3000-4500	Rising Interest	Handcrafted precision, decorative inlays, customized design	RideWave Consumer Preferences Data, Michael Rumsey Art Wooden Paddleboards Market Insights
20	2026-04-29 01:32:00.844209	Custom Cedar-Strip Canoe with Artisan Craftsmanship	Growing preference for classic wooden canoes in solo and tandem expeditions. Customers seek personalized, hand-built canoes for traditional and adventurous water experiences.	Traditional Cedar-Strip construction with elegant Walnut accents for a timeless and sophisticated look. Hand-crafted with meticulous attention to detail for premium quality.	Make use of 3018 Pro CNC for intricate design motifs on gunwales, custom-shaped seats, and personalized engravings, adding a touch of exclusivity to each canoe.	Outdoor enthusiasts, 30-50, willing to spend $5000-8000 on bespoke wooden canoes for memorable expeditions. Emphasize craftsmanship, durability, and customization options.	Canoe	Solo/Tandem Expedition	Cedar-Strip	Varies	32"-36"	Cedar	Walnut	Artisan Craftsmanship	$5000-8000	Increasing Demand	Custom design motifs, personalized engravings, hand-crafted seats	Mordor Intelligence SUP Market Report, Little Bay Boards Canoe Sales Data
21	2026-04-29 01:32:00.844209	Custom Wooden Paddles with Artistic Inlays	Surging interest in bespoke wooden paddles as high-end accessories for wooden watercraft. Customers seek beautifully crafted, functional paddles to complement their artisan watercraft.	Handmade paddles using premium hardwoods like Teak, Mahogany, or Walnut, with intricate artistic inlays for a unique and personalized touch. Superior craftsmanship and design for optimal performance.	Utilize 3018 Pro CNC for precise shaping of blades, customized grip patterns, and decorative inlays, offering a blend of functionality and artistic flair.	Discerning watercraft enthusiasts, 25-55, willing to invest $300-700 in custom wooden paddles for enhanced paddling experience and aesthetic appeal.	Paddles	\N	Handmade Wood	\N	\N	Teak, Mahogany, Walnut	Varies	Artistic Inlays	$300-700	Rapid Growth	Premium hardwoods, artistic inlays, customized grip patterns	RideWave Consumer Preferences Data, Coherent Market Insights Stand-Up Paddleboard Market Report
22	2026-04-29 01:55:02.400678	12'6" Dark Walnut Cedar-Strip Touring SUP with Custom Inlays	Growing demand for touring boards with 12’6” length in 2026 as per industry reports. Luxury market trending towards Dark Walnut and Cedar-Strip designs for artisanal appeal.	Utilize Dark Walnut accents on Western Red Cedar hull for premium feel. Offer custom inlays for personalized touch and exclusivity.	Leverage CNC precision for intricate custom inlays and decorative elements enhancing artisan craftsmanship.	Discerning buyers seeking unique, aesthetically pleasing touring SUPs in the $3500-5000 price range.	SUP	Touring	Cedar-Strip	12'6"	28"	Western Red Cedar	Dark Walnut	Clear Epoxy Resin	$3500-5000	Growth	Custom inlays, Dark Walnut accents	NMMA 2026 Boating Market Report, Coherent Market Insights, Little Bay Boards
23	2026-04-29 01:55:02.400678	14' Hollow-Wood Touring SUP with Tech Integration	Luxury touring board sales up by 34% in 2026, with 14' displacement hulls in demand. #woodenSUP Instagram trend shows preference for touring boards.	Western Red Cedar hull with Dark Walnut racing stripe and accent rails. Bio-epoxy eco-luxe finish appeals to sustainability-conscious luxury buyers.	Custom CNC integration for GPS mount plates, personalized inlays, and decorative motifs enhancing customization.	Affluent outdoor enthusiasts valuing craftsmanship and sustainability, willing to pay $4500-6500 for premium boards.	SUP	Touring/Displacement	Hollow-wood	14'	28"	Western Red Cedar	Dark Walnut	Bio-Epoxy Eco-Luxe (Matte)	$4500-6500	Strong Growth	GPS mounts, custom inlays, racing stripes	NMMA 2026 Boating Market Report, Instagram Analytics #woodenSUP, Verified Market Research
24	2026-04-29 01:55:02.400678	Custom Cedar-Strip Expedition Kayak with Artisan Inlays	Growing interest in classic kayak shapes like Prospector, ideal for handmade cedar-strip builds. Consumers gravitating towards personalized and artisanal products.	Cedar-strip construction for lightweight durability. Offer artisan inlays for customization and exclusivity.	Leverage CNC precision for intricate inlay designs and customized features, setting kayak apart in the market.	Adventure enthusiasts seeking unique, handmade kayaks for expedition use, willing to invest $3500-6000 for premium craftsmanship.	Kayak	Expedition/Prospector	Cedar-Strip	Varies	\N	Cedar	Various	Clear Epoxy Finish	$3500-6000	Rising Demand	Artisan inlays, custom designs	Coherent Market Insights, Little Bay Boards, Mordor Intelligence
25	2026-04-29 01:55:02.400678	Bespoke Hollow-Wood Longboard Surfboard with CNC Fin Boxes	Increase in demand for hollow-wood surfboards. Consumers seeking unique shapes and craftsmanship. CNC-machined fin boxes for customizable setups gaining popularity.	Utilize Western Red Cedar for lightweight performance. Offer CNC-machined fin boxes for tailored fin configurations and improved surfing experience.	Leverage CNC precision for custom fin boxes, ensuring optimal performance and enhanced customization.	Surfing enthusiasts valuing craftsmanship, seeking bespoke longboards for premium surfing experiences. Price range between $2500-4000.	Surfboard	Longboard	Hollow-wood	Varies	\N	Western Red Cedar	N/A	Clear Epoxy Finish	$2500-4000	Growing Interest	CNC fin boxes, bespoke craftsmanship	RIDEWAVE, Coherent Market Insights, Little Bay Boards
26	2026-04-29 01:55:02.400678	Artisan Wood-Crafted Canoe with Precision Inlays	Surge in demand for classic canoe shapes like Prospector. Consumers appreciating handcrafted wooden canoes. Personalized inlays adding uniqueness and value.	Utilize high-quality Cedar or Mahogany for canoe construction. Offer precision inlays for customization and premium aesthetics.	Employ CNC machining for intricate inlay designs and personalized elements, enhancing the canoe's artisanal appeal.	Outdoor enthusiasts seeking traditional wooden canoes for solo or expedition use, willing to pay $4000-7000 for bespoke craftsmanship.	Canoe	Solo Pack/Expedition	Cedar-Strip/Mahogany	Varies	\N	Cedar/Mahogany	Various	Clear Epoxy Finish	$4000-7000	Increasing Demand	Precision inlays, premium woods	Verified Market Research, Little Bay Boards, Coherent Market Insights
27	2026-04-29 02:43:31.856962	14' Touring SUP with Displacement Hull	Growing interest in fitness and recreation is driving the demand for touring and displacement hulls for improved speed and stability. Stand-up paddleboard market forecasted to grow at a CAGR of 10.5% from 2026 to 2033.	Western Red Cedar hull with Dark Walnut stringers and accents, incorporating Paulownia for lightweight performance.	Utilize CNC integration for precision shaping of fins and custom inlays, enhancing both performance and aesthetics.	Affluent outdoor enthusiasts aged 35-55 seeking premium craftsmanship and performance, willing to invest in boards priced $4500-6500.	SUP	Touring/Displacement	Hollow-wood	14'	28"-30"	Western Red Cedar	Dark Walnut, Paulownia	Eco-Luxe Epoxy	$4500-6500	Strong Growth	Integrated tech, custom inlays, specialized fin setups	Coherent Market Insights Stand-Up Paddleboard Market Report
28	2026-04-29 02:43:31.856962	Custom Hollow Wooden Surfboards	Rising interest in artisan handcrafted watercraft for surfing, with preferences shifting towards unique visual narratives. Consumers seek personality and value in equipment over standardized designs.	Premium Canadian Red Cedar construction for lightweight performance and aesthetic appeal. Epoxy and fiberglass for added strength and durability.	Leverage CNC precision for custom shaping of fins, decorative inlays, and personalized designs to create unique surfboards with artistic flair.	Discerning surfers looking for bespoke boards that reflect their individuality and values, willing to pay for premium craftsmanship.	Surfboard	\N	Hollow-wood	Varies	\N	Canadian Red Cedar	\N	Artisan Heirloom Design	Varies	Growing Demand	Custom artistic designs, personalized elements	Little Bay Boards Market Trend Analysis, Global SUP Industry Report
29	2026-04-29 02:43:31.856962	Cedar-Strip Expedition Kayaks	Increasing demand for specialized kayak designs for solo expeditions and classic shapes. Artisan wooden kayaks gaining traction for their unique aesthetics and performance.	High-grade Canadian Red Cedar strips for lightweight yet durable construction. Epoxy resin finish for waterproofing and longevity.	Utilize CNC capabilities for precision-cutting of kayak parts, customized features, and decorative embellishments for premium customization.	Adventure enthusiasts seeking artisan wooden kayaks for solo expeditions, willing to invest in handcrafted quality.	Kayak	\N	Cedar-strip	\N	\N	Canadian Red Cedar	\N	Artisan Waterproof Finish	Varies	Emerging Trend	Specialized expedition designs, custom embellishments	Michael Rumsey Art Cedar-Strip Builds, Cognitive Market Research SUP Boards Market Report
30	2026-04-29 02:43:31.856962	Artisan Wooden Canoes	Growth in the demand for classic prospector shapes and handcrafted wooden canoes. Artisan canoes valued for their heritage appeal and custom craftsmanship.	Top-grade Canadian Red Cedar construction for traditional aesthetics and performance. Fiberglass reinforcement for durability.	Incorporate CNC precision for creating intricate inlays, customized hardware, and precision-cut parts for bespoke canoe designs.	Outdoor enthusiasts seeking classic wooden canoes with a focus on heritage and performance, willing to pay for artisanal quality.	Canoe	\N	Cedar-strip	\N	\N	Canadian Red Cedar	\N	Heritage Artisanal Finish	Varies	Rising Interest	Custom heritage designs, precise detailing	Capt. Jim's Cargo Cedar Canoes & Kayaks, 24 Market Reports SUP Paddleboard Market Analysis
31	2026-04-29 02:43:31.856962	Custom Wooden Paddles and Fin Boxes	Specialization and diversification driving market expansion in premium paddlecraft accessories. Artisan wooden paddles and fin boxes growing in popularity for their bespoke craftsmanship.	Select Marine Hardwoods like Teak, Mahogany, Walnut for paddle durability and aesthetic appeal. Acrylics for decorative accents.	Utilize CNC technology for crafting custom wooden paddles and machined fin boxes with intricate designs and personalized elements.	Paddleboarding enthusiasts seeking unique accessories to complement their artisan watercraft, willing to invest in premium quality.	Accessories	\N	Handcrafted Wood and CNC Machined	\N	\N	Marine Hardwoods	\N	\N	Varies	Expanding Niche Market	Custom paddle designs, machined fin boxes	Ride Waves SUP News, Mordor Intelligence Stand-Up Paddle Board Market Report
32	2026-04-29 03:18:13.566983	Luxury 14' Hollow-Wood Touring SUP with Tech Integration	12'6" and 14' touring and displacement hulls are outperforming all-around SUPs, with a 10.5% CAGR to reach USD 4.22 billion by 2033. Touring SUPs offer an immersive exploration experience that is highly appealing to customers.	Western Red Cedar hull with Dark Walnut stringers. Paulownia wood accents for lightweight performance. Bio-resin finish aligns with the luxury eco-friendly trend.	Utilize the 3018 Pro CNC machine for precision milling of custom GPS mount plates, nameplate inlays, and decorative motifs for premium customization.	Affluent outdoor enthusiasts aged 35-55, prioritizing craftsmanship, sustainability, and performance. Willing to spend $4500-6500 for a high-end SUP experience.	SUP	Touring/Displacement	Hollow-wood	14'	28"-30"	Western Red Cedar	Dark Walnut, Paulownia	Bio-Resin Eco-Friendly	$4500-6500	Strong Growth	GPS mounts, custom inlays, Bio-resin finish, lightweight performance	Coherent Market Insights Stand-Up Paddleboard Market Report, Mordor Intelligence SUP Industry Analysis
33	2026-04-29 03:18:13.566983	Custom Cedar-Strip Canoes & Kayaks for Expedition Enthusiasts	Growing SUP market reflects increased interest in water-based recreational activities post-global health situation. Custom hand-built cedar-strip canoes & kayaks tap into the trend of outdoor recreation and expedition touring.	Old growth Western Red Cedar strips. Incorporate historical materials like reclaimed wood for artisanal appeal.	Leverage CNC precision for intricate decorative inlays, precise joinery, and custom-fit accessories for expedition gear.	Adventure enthusiasts seeking unique, handcrafted watercraft. Value authenticity, craftsmanship, and performance for expedition touring.	Canoe/Kayak	\N	Cedar-strip	\N	\N	Western Red Cedar	Reclaimed wood accents	\N	Custom Pricing	Rising Interest	Custom expedition accessories, historical wood materials, intricate inlays	24 Market Reports SUP Market Analysis, Michael Rumsey Art Wooden Paddleboards
34	2026-04-29 03:18:13.566983	Artisan Hollow Wooden Surfboards with Premium Finish	Surging interest in wooden surfboards due to their artisanal appeal and eco-friendliness. Unique handcrafted designs attract surfers looking for premium boards.	Old growth Redwood and Basswood in strip-build technique. Epoxy resin finish for a premium sheen.	Utilize CNC machining for precision strip placement, intricate designs, and custom vent placements for enhanced board performance.	Surfing enthusiasts valuing craftsmanship, uniqueness, and sustainability. Willing to invest in premium, one-of-a-kind surfboards.	Surfboard	\N	\N	Custom	\N	Redwood, Basswood	None	Epoxy Resin Premium Finish	Custom Pricing	Growing Demand	Strip-built construction, uniquely crafted designs, premium epoxy finish	Tower Paddle Boards Wooden SUP Analysis, Michael Rumsey Art Wooden Paddleboards
35	2026-04-29 03:18:13.566983	Handcrafted Wooden Paddles with Custom CNC-Machined Fin Boxes	Custom wooden paddles gaining popularity for their aesthetic appeal and personalized touch. CNC-machined fin boxes offer enhanced performance customization for SUP enthusiasts.	High-quality Teak or Mahogany for paddles. CNC-machined fin boxes for precise fin adjustments.	Utilize 3018 Pro CNC machine for intricate paddle designs, custom fin boxes, and personalized engraving for premium customization.	SUP enthusiasts seeking unique, handcrafted paddles for enhanced performance and aesthetic appeal.	Paddles/Fin Boxes	\N	Handcrafted + CNC	\N	\N	Teak, Mahogany	\N	\N	Custom Pricing	Increasing Trend	Custom paddle designs, CNC-machined fin boxes, personalized engravings	Little Bay Boards Custom Paddle Boards, Tower Paddle Boards Wooden SUP Analysis
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: jimmy
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- Name: market_opportunities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jimmy
--

SELECT pg_catalog.setval('public.market_opportunities_id_seq', 35, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: jimmy
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: market_opportunities market_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: jimmy
--

ALTER TABLE ONLY public.market_opportunities
    ADD CONSTRAINT market_opportunities_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict sfaDFpaSfcbhfgdGcdbvLXE5nEhQ92dXrpt5bOxs9zmqEL2lnd03pk4TzsSbpLb

