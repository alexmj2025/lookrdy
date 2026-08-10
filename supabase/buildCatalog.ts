/**
 * Catalog generator.
 *
 * Expands the compact per-retailer product data below into the full
 * `src/data/catalog.json` record shape. Run with `npx tsx supabase/buildCatalog.ts`.
 *
 * The generated catalog.json is the editable source of truth — edit it
 * directly for one-off changes. Re-run this script only when you want to
 * regenerate the whole file from scratch.
 *
 * ⚠️ PLACEHOLDER DATA — product names and prices are realistic but invented,
 * and productUrl points at each retailer's real category page rather than a
 * specific item. Replace with a real sourced list (or a live affiliate feed —
 * see src/lib/catalog/source.ts) before shipping to users.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

type Cat = "jacket" | "top" | "trousers" | "shoes" | "bag" | "accessory";
type Tier = "value" | "mid" | "premium";

// name, category, color, price, formality(1-5), styleTags
type Row = [string, Cat, string, number, number, string];

interface RetailerBlock {
  retailer: string;
  tier: Tier;
  currency: string;
  countries: string[];
  urls: Partial<Record<Cat, string>>;
  rows: Row[];
}

const SIZES: Record<Cat, string[]> = {
  jacket: ["XS", "S", "M", "L", "XL"],
  top: ["XS", "S", "M", "L", "XL"],
  trousers: ["28", "30", "32", "34", "36"],
  shoes: ["7", "8", "9", "10", "11", "12"],
  bag: ["One Size"],
  accessory: ["One Size"],
};

const CA_US = ["CA", "US"];
const GLOBAL = ["CA", "US", "GB", "AU", "JP", "DE", "FR"];

const BLOCKS: RetailerBlock[] = [
  {
    retailer: "Uniqlo",
    tier: "value",
    currency: "CAD",
    countries: CA_US,
    urls: {
      jacket: "https://www.uniqlo.com/ca/en/men/outerwear",
      top: "https://www.uniqlo.com/ca/en/men/tops",
      trousers: "https://www.uniqlo.com/ca/en/men/pants",
      shoes: "https://www.uniqlo.com/ca/en/men/accessories-and-shoes",
      bag: "https://www.uniqlo.com/ca/en/men/accessories",
      accessory: "https://www.uniqlo.com/ca/en/men/accessories",
    },
    rows: [
      ["Ultra Light Down Jacket", "jacket", "navy", 79.9, 2, "minimal practical lightweight"],
      ["Wool-Blend Chesterfield Coat", "jacket", "charcoal", 149.9, 4, "tailored classic monochrome"],
      ["Blocktech Hooded Parka", "jacket", "black", 99.9, 2, "technical utility monochrome"],
      ["Single-Breasted Comfort Jacket", "jacket", "stone", 129.9, 4, "tailored soft neutral"],
      ["Extra Fine Merino Crew Neck Sweater", "top", "black", 49.9, 3, "minimal monochrome layering"],
      ["Lambswool Turtleneck Sweater", "top", "cream", 59.9, 3, "minimal warm neutral"],
      ["Easy Care Stretch Slim-Fit Shirt", "top", "white", 39.9, 4, "classic crisp tailored"],
      ["Flannel Checked Shirt", "top", "grey check", 39.9, 2, "casual textured relaxed"],
      ["Supima Cotton Crew Neck T-Shirt", "top", "white", 19.9, 2, "minimal essential clean"],
      ["Airism Cotton Oversized T-Shirt", "top", "black", 24.9, 1, "relaxed monochrome streetwear"],
      ["Linen-Blend Open-Collar Shirt", "top", "sage", 44.9, 2, "relaxed summer soft"],
      ["3D Knit Cotton Crew Sweater", "top", "brick", 59.9, 2, "textured casual warm"],
      ["Smart Ankle Pants", "trousers", "charcoal", 49.9, 4, "tailored versatile monochrome"],
      ["Pleated Wide Chino Pants", "trousers", "beige", 59.9, 3, "relaxed neutral modern"],
      ["Slim-Fit Stretch Selvedge Jeans", "trousers", "indigo", 59.9, 2, "denim classic casual"],
      ["Ultra Stretch Jogger Pants", "trousers", "black", 49.9, 1, "casual comfort monochrome"],
      ["Wide-Fit Wool-Blend Trousers", "trousers", "mid grey", 69.9, 4, "tailored relaxed neutral"],
      ["Comfort-Sole Canvas Sneaker", "shoes", "white", 49.9, 1, "casual clean minimal"],
      ["Leather-Look Derby Shoe", "shoes", "black", 69.9, 4, "classic smart monochrome"],
      ["Suede-Touch Chelsea Boot", "shoes", "dark taupe", 89.9, 3, "sleek textured neutral"],
      ["Slim-Fit Chino Trousers", "trousers", "navy", 49.9, 3, "classic versatile clean"],
      ["Heattech Fine-Rib Turtleneck", "top", "dark grey", 29.9, 3, "minimal layering monochrome"],
      ["Cotton Canvas Shoulder Bag", "bag", "natural", 29.9, 1, "casual utility neutral"],
      ["Italian Leather Belt", "accessory", "black", 39.9, 4, "classic minimal monochrome"],
      ["Cashmere-Blend Scarf", "accessory", "camel", 49.9, 3, "warm neutral soft"],
    ],
  },
  {
    retailer: "GU",
    tier: "value",
    currency: "CAD",
    countries: CA_US,
    urls: {
      jacket: "https://www.gu-global.com/",
      top: "https://www.gu-global.com/",
      trousers: "https://www.gu-global.com/",
      shoes: "https://www.gu-global.com/",
      bag: "https://www.gu-global.com/",
      accessory: "https://www.gu-global.com/",
    },
    rows: [
      ["Oversized MA-1 Bomber Jacket", "jacket", "olive", 69.9, 1, "streetwear relaxed casual"],
      ["Faux-Suede Blouson", "jacket", "tan", 79.9, 2, "retro casual textured"],
      ["Soft Knit Cardigan", "top", "light grey", 39.9, 2, "relaxed soft layering"],
      ["Relaxed Oxford Band-Collar Shirt", "top", "light blue", 34.9, 3, "modern relaxed clean"],
      ["Heavyweight Boxy T-Shirt", "top", "off-white", 17.9, 1, "streetwear relaxed essential"],
      ["Waffle Long-Sleeve Crew Tee", "top", "mocha", 24.9, 1, "textured casual warm"],
      ["Wide Tapered Easy Trousers", "trousers", "black", 44.9, 2, "relaxed monochrome modern"],
      ["Loose Straight Jeans", "trousers", "washed blue", 49.9, 1, "denim relaxed casual"],
      ["Round-Toe Faux-Leather Loafer", "shoes", "black", 59.9, 3, "smart minimal monochrome"],
      ["Chunky Sole Sneaker", "shoes", "off-white", 64.9, 1, "streetwear bold casual"],
      ["Minimal Nylon Crossbody Bag", "bag", "black", 29.9, 1, "utility minimal monochrome"],
      ["Ribbed Knit Beanie", "accessory", "charcoal", 19.9, 1, "casual warm monochrome"],
    ],
  },
  {
    retailer: "Muji",
    tier: "value",
    currency: "CAD",
    countries: CA_US,
    urls: {
      jacket: "https://www.muji.ca/collections/men",
      top: "https://www.muji.ca/collections/men",
      trousers: "https://www.muji.ca/collections/men",
      shoes: "https://www.muji.ca/collections/men",
      bag: "https://www.muji.ca/collections/bags",
      accessory: "https://www.muji.ca/collections/men",
    },
    rows: [
      ["Recycled Wool Melton Work Jacket", "jacket", "dark brown", 129.9, 3, "minimal utility warm"],
      ["Water-Repellent Hooded Jacket", "jacket", "navy", 109.9, 2, "technical minimal practical"],
      ["Organic Cotton Waffle Knit Pullover", "top", "oatmeal", 59.9, 2, "minimal textured neutral"],
      ["Washed Broad Cloth Regular-Collar Shirt", "top", "white", 49.9, 3, "minimal crisp clean"],
      ["Jersey Stitch Crew Neck T-Shirt", "top", "heather grey", 24.9, 2, "minimal essential soft"],
      ["Silk-Cotton Fine-Gauge Sweater", "top", "off-black", 69.9, 3, "minimal refined monochrome"],
      ["Water-Repellent Stretch Chino Trousers", "trousers", "dark navy", 69.9, 3, "practical minimal versatile"],
      ["Organic Cotton Wide Trousers", "trousers", "ecru", 64.9, 2, "relaxed neutral minimal"],
      ["Water-Repellent Cotton Sneaker", "shoes", "ecru", 54.9, 2, "minimal clean neutral"],
      ["Nylon Shoulder Bag", "bag", "black", 34.9, 1, "utility minimal monochrome"],
      ["Cotton Canvas Tote Bag", "bag", "natural", 29.9, 1, "casual minimal neutral"],
      ["Wool-Blend Ribbed Beanie", "accessory", "charcoal", 24.9, 1, "minimal warm monochrome"],
    ],
  },
  {
    retailer: "Simons",
    tier: "mid",
    currency: "CAD",
    countries: ["CA"],
    urls: {
      jacket: "https://www.simons.ca/en/men-clothing/coats-outerwear--20104",
      top: "https://www.simons.ca/en/men-clothing/sweaters-cardigans--20106",
      trousers: "https://www.simons.ca/en/men-clothing/pants--20107",
      shoes: "https://www.simons.ca/en/men-shoes--20110",
      bag: "https://www.simons.ca/en/men-accessories--20111",
      accessory: "https://www.simons.ca/en/men-accessories--20111",
    },
    rows: [
      ["Le 31 Wool Overcoat", "jacket", "camel", 295, 4, "tailored classic warm"],
      ["Le 31 Water-Repellent Mac Coat", "jacket", "stone", 195, 3, "minimal modern neutral"],
      ["Le 31 Unstructured Wool Blazer", "jacket", "navy", 250, 4, "tailored smart classic"],
      ["Le 31 Merino Quarter-Zip Sweater", "top", "forest green", 89, 3, "smart layering textured"],
      ["Le 31 Textured Piqué Dress Shirt", "top", "sky blue", 69, 4, "crisp tailored classic"],
      ["Le 31 Mercerized Cotton T-Shirt", "top", "ivory", 39, 2, "minimal refined essential"],
      ["Le 31 Shawl-Collar Cardigan", "top", "oat melange", 125, 3, "relaxed warm textured"],
      ["Le 31 Slim-Fit Flannel Dress Pant", "trousers", "mid grey", 110, 4, "tailored classic monochrome"],
      ["Le 31 Stockholm Slim Raw Denim", "trousers", "raw indigo", 98, 2, "denim modern clean"],
      ["Le 31 Pleated Wide Trouser", "trousers", "black", 120, 4, "tailored relaxed monochrome"],
      ["Le 31 Leather Penny Loafer", "shoes", "burgundy", 165, 4, "classic smart refined"],
      ["Le 31 Minimal Leather Sneaker", "shoes", "white", 140, 2, "minimal clean modern"],
      ["Le 31 Suede Desert Boot", "shoes", "sand", 155, 3, "casual textured warm"],
      ["Le 31 Tapered Cotton Chino", "trousers", "olive", 85, 3, "versatile casual neutral"],
      ["Le 31 Fine-Gauge Merino Crewneck", "top", "charcoal", 79, 3, "minimal soft monochrome"],
      ["Le 31 Leather Weekender Bag", "bag", "cognac", 210, 3, "classic refined warm"],
      ["Le 31 Braided Leather Belt", "accessory", "cognac", 45, 3, "classic textured warm"],
    ],
  },
  {
    retailer: "COS",
    tier: "mid",
    currency: "CAD",
    countries: CA_US,
    urls: {
      jacket: "https://www.cos.com/en_cad/men/jackets-coats.html",
      top: "https://www.cos.com/en_cad/men/knitwear.html",
      trousers: "https://www.cos.com/en_cad/men/trousers.html",
      shoes: "https://www.cos.com/en_cad/men/shoes.html",
      bag: "https://www.cos.com/en_cad/men/accessories.html",
      accessory: "https://www.cos.com/en_cad/men/accessories.html",
    },
    rows: [
      ["Relaxed Wool Overshirt", "jacket", "black", 225, 3, "minimal monochrome architectural"],
      ["Double-Faced Wool Coat", "jacket", "off-white", 350, 4, "minimal architectural neutral"],
      ["Boxy Technical Blouson", "jacket", "slate", 195, 2, "minimal modern technical"],
      ["Pure Cashmere Crew-Neck Jumper", "top", "stone grey", 250, 3, "minimal luxe soft"],
      ["Heavyweight Roll-Neck Wool Jumper", "top", "off-black", 175, 3, "minimal monochrome architectural"],
      ["Tailored Poplin Shirt", "top", "white", 99, 4, "minimal crisp architectural"],
      ["Brushed-Cotton Mock-Neck T-Shirt", "top", "graphite", 59, 2, "minimal monochrome soft"],
      ["Wide-Leg Tailored Wool Trousers", "trousers", "black", 175, 4, "architectural monochrome tailored"],
      ["Elasticated Twill Drawstring Trousers", "trousers", "taupe", 119, 2, "relaxed minimal neutral"],
      ["Straight-Leg Rigid Jeans", "trousers", "black rinse", 135, 2, "denim minimal monochrome"],
      ["Leather Square-Toe Loafer", "shoes", "black", 250, 4, "minimal architectural monochrome"],
      ["Chunky Leather Derby", "shoes", "dark brown", 275, 3, "architectural bold refined"],
      ["Minimal Leather Sneaker", "shoes", "off-white", 190, 2, "minimal clean architectural"],
      ["Tapered Wool Trousers", "trousers", "charcoal", 155, 4, "tailored minimal monochrome"],
      ["Structured Leather Tote", "bag", "black", 290, 3, "minimal architectural monochrome"],
      ["Grained-Leather Slim Belt", "accessory", "black", 99, 4, "minimal monochrome refined"],
    ],
  },
  {
    retailer: "Nordstrom",
    tier: "mid",
    currency: "CAD",
    countries: CA_US,
    urls: {
      jacket: "https://www.nordstrom.ca/browse/men/clothing/coats-jackets",
      top: "https://www.nordstrom.ca/browse/men/clothing/sweaters",
      trousers: "https://www.nordstrom.ca/browse/men/clothing/pants",
      shoes: "https://www.nordstrom.ca/browse/men/shoes",
      bag: "https://www.nordstrom.ca/browse/men/accessories/bags",
      accessory: "https://www.nordstrom.ca/browse/men/accessories",
    },
    rows: [
      ["Quilted Liner Field Jacket", "jacket", "dark olive", 229, 2, "utility casual textured"],
      ["Wool-Cashmere Topcoat", "jacket", "charcoal", 395, 5, "tailored formal monochrome"],
      ["Nordstrom Signature Cashmere V-Neck", "top", "heather navy", 189, 3, "refined soft classic"],
      ["Trim Fit Non-Iron Dress Shirt", "top", "white", 89, 5, "formal crisp classic"],
      ["Pima Cotton Long-Sleeve Henley", "top", "olive heather", 69, 2, "casual soft textured"],
      ["Merino Half-Zip Pullover", "top", "black", 129, 3, "smart minimal monochrome"],
      ["Slim-Fit Performance Dress Trousers", "trousers", "navy", 129, 5, "formal tailored classic"],
      ["Athletic Slim Stretch Jeans", "trousers", "dark rinse", 110, 2, "denim modern clean"],
      ["Cap-Toe Leather Oxford", "shoes", "black", 199, 5, "formal classic monochrome"],
      ["Suede Chukka Boot", "shoes", "sand suede", 179, 3, "casual textured warm"],
      ["Wool Flannel Trouser", "trousers", "light grey", 145, 4, "tailored soft classic"],
      ["Minimalist Leather Sneaker", "shoes", "white", 150, 2, "clean minimal modern"],
      ["Washed Linen Camp-Collar Shirt", "top", "terracotta", 95, 2, "relaxed summer warm"],
      ["Leather Briefcase", "bag", "brown", 295, 4, "classic professional warm"],
      ["Reversible Leather Dress Belt", "accessory", "black/brown", 79, 5, "formal classic versatile"],
    ],
  },
  {
    retailer: "ASOS",
    tier: "mid",
    currency: "CAD",
    countries: GLOBAL,
    urls: {
      jacket: "https://www.asos.com/men/jackets-coats/",
      top: "https://www.asos.com/men/t-shirts-vests/",
      trousers: "https://www.asos.com/men/trousers-chinos/",
      shoes: "https://www.asos.com/men/shoes-boots-trainers/",
      bag: "https://www.asos.com/men/bags/",
      accessory: "https://www.asos.com/men/accessories/",
    },
    rows: [
      ["ASOS Design Oversized Wool-Mix Overcoat", "jacket", "dark grey", 135, 3, "relaxed modern monochrome"],
      ["ASOS Design Faux-Suede Trucker Jacket", "jacket", "tan", 95, 2, "retro casual textured"],
      ["ASOS Design Boxy Leather-Look Jacket", "jacket", "black", 120, 2, "streetwear bold monochrome"],
      ["ASOS Design Regular Sateen Shirt", "top", "ecru", 55, 3, "modern soft neutral"],
      ["ASOS Design Relaxed Heavyweight T-Shirt", "top", "washed black", 32, 1, "streetwear relaxed monochrome"],
      ["ASOS Design Chunky Ribbed Sweater", "top", "rust", 58, 2, "textured warm casual"],
      ["ASOS Design Knitted Polo Shirt", "top", "black", 45, 3, "retro smart monochrome"],
      ["ASOS Design Smart Tapered Trousers", "trousers", "charcoal check", 64, 4, "tailored patterned smart"],
      ["ASOS Design Baggy Jeans", "trousers", "mid-wash blue", 70, 1, "denim streetwear relaxed"],
      ["ASOS Design Wide Pleated Trousers", "trousers", "stone", 68, 3, "relaxed modern neutral"],
      ["ASOS Design Chunky Derby Shoe", "shoes", "black", 85, 3, "bold modern monochrome"],
      ["ASOS Design Minimal Court Sneaker", "shoes", "white", 60, 2, "minimal clean casual"],
      ["ASOS Design Chelsea Boot", "shoes", "dark brown", 78, 3, "sleek casual warm"],
      ["ASOS Design Slim Suit Trousers", "trousers", "black", 62, 5, "formal tailored monochrome"],
      ["ASOS Design Oversized Sweatshirt", "top", "grey marl", 40, 1, "streetwear relaxed casual"],
      ["ASOS Design Nylon Weekend Bag", "bag", "black", 55, 1, "utility casual monochrome"],
      ["ASOS Design Slim Woven Tie", "accessory", "deep green", 22, 5, "formal classic refined"],
    ],
  },
  {
    retailer: "Aldo",
    tier: "mid",
    currency: "CAD",
    countries: CA_US,
    urls: {
      shoes: "https://www.aldoshoes.com/ca/en_CA/men/shoes",
      bag: "https://www.aldoshoes.com/ca/en_CA/men/bags",
      accessory: "https://www.aldoshoes.com/ca/en_CA/men/wallets",
    },
    rows: [
      ["Miraylle Leather Derby Shoe", "shoes", "dark brown", 150, 4, "classic smart warm"],
      ["Clean Cupsole Leather Sneaker", "shoes", "white", 120, 2, "minimal clean modern"],
      ["Gwiralian Chelsea Boot", "shoes", "black leather", 170, 4, "sleek classic monochrome"],
      ["Retro Runner Suede Sneaker", "shoes", "grey/navy", 110, 1, "retro casual textured"],
      ["Legaon Leather Loafer", "shoes", "cognac", 140, 4, "classic refined warm"],
      ["Vaneli Lace-Up Boot", "shoes", "chocolate suede", 160, 3, "rugged textured warm"],
      ["Structured Nylon Backpack", "bag", "black", 90, 1, "utility casual monochrome"],
      ["Saffiano Leather Card Holder", "accessory", "black", 45, 3, "minimal refined monochrome"],
      ["Textured Leather Belt", "accessory", "dark brown", 55, 3, "classic textured warm"],
    ],
  },
  {
    retailer: "Mr Porter",
    tier: "premium",
    currency: "CAD",
    countries: GLOBAL,
    urls: {
      jacket: "https://www.mrporter.com/en-ca/mens/clothing/coats-and-jackets",
      top: "https://www.mrporter.com/en-ca/mens/clothing/knitwear",
      trousers: "https://www.mrporter.com/en-ca/mens/clothing/trousers",
      shoes: "https://www.mrporter.com/en-ca/mens/shoes",
      bag: "https://www.mrporter.com/en-ca/mens/bags",
      accessory: "https://www.mrporter.com/en-ca/mens/accessories",
    },
    rows: [
      ["Officine Générale Wool-Flannel Chore Jacket", "jacket", "anthracite", 620, 3, "refined textured minimal"],
      ["NN07 Wool-Blend Double-Breasted Coat", "jacket", "dark navy", 780, 4, "tailored classic refined"],
      ["Brunello Cucinelli Suede Bomber", "jacket", "taupe", 1450, 3, "luxe soft refined"],
      ["Sunspel Merino Wool Crew Sweater", "top", "charcoal melange", 340, 3, "minimal luxe soft"],
      ["Drake's Cotton-Oxford Button-Down Shirt", "top", "pale blue", 295, 4, "classic crisp refined"],
      ["Sunspel Riviera Supima Cotton T-Shirt", "top", "white", 135, 2, "minimal luxe essential"],
      ["John Smedley Sea Island Cotton Polo", "top", "black", 390, 4, "refined minimal monochrome"],
      ["Incotex Slim Wool-Flannel Trousers", "trousers", "mid grey", 480, 5, "formal tailored refined"],
      ["Orslow 107 Slim Selvedge Jeans", "trousers", "one-wash indigo", 385, 2, "denim heritage refined"],
      ["Common Projects Achilles Low Sneaker", "shoes", "white leather", 570, 3, "minimal luxe clean"],
      ["Edward Green Chelsea Cap-Toe Oxford", "shoes", "dark oak", 1650, 5, "formal heritage luxe"],
      ["Officine Générale Pleated Wool Trouser", "trousers", "ink", 420, 4, "tailored refined monochrome"],
      ["Grenson Suede Chukka Boot", "shoes", "tobacco", 520, 3, "heritage textured warm"],
      ["Bleu de Chauffe Leather Satchel", "bag", "natural leather", 690, 3, "heritage refined warm"],
      ["Anderson's Suede Belt", "accessory", "chocolate suede", 210, 3, "refined textured warm"],
      ["Drake's Wool-Silk Pocket Square", "accessory", "navy paisley", 115, 5, "formal patterned refined"],
    ],
  },
  {
    retailer: "Beams",
    tier: "premium",
    currency: "CAD",
    countries: ["JP", "CA", "US", "GB"],
    urls: {
      jacket: "https://www.beams.co.jp/global/",
      top: "https://www.beams.co.jp/global/",
      trousers: "https://www.beams.co.jp/global/",
      shoes: "https://www.beams.co.jp/global/",
      bag: "https://www.beams.co.jp/global/",
      accessory: "https://www.beams.co.jp/global/",
    },
    rows: [
      ["Beams Plus 3B Wool Blazer", "jacket", "navy", 540, 4, "ivy tailored heritage"],
      ["Beams Plus Cotton Chore Coat", "jacket", "ecru", 380, 2, "workwear textured neutral"],
      ["Beams Plus Shaggy Dog Shetland Sweater", "top", "moss green", 260, 2, "ivy textured heritage"],
      ["Beams Plus Oxford Pullover Shirt", "top", "university stripe", 195, 3, "ivy classic patterned"],
      ["Beams Plus Ivy Chino Trousers", "trousers", "khaki", 230, 3, "ivy heritage neutral"],
      ["Beams Plus 5-Pocket Selvedge Denim", "trousers", "dark indigo", 285, 2, "denim heritage refined"],
      ["Beams Plus Paraboot Michael Derby", "shoes", "café brown", 640, 3, "heritage rugged refined"],
      ["Beams Plus Canvas Rucksack", "bag", "olive", 240, 1, "utility heritage casual"],
      ["Beams Plus Regimental Stripe Tie", "accessory", "navy/gold stripe", 160, 5, "formal ivy patterned"],
    ],
  },
  {
    retailer: "United Arrows",
    tier: "premium",
    currency: "CAD",
    countries: ["JP", "CA", "US"],
    urls: {
      jacket: "https://store.united-arrows.co.jp/",
      top: "https://store.united-arrows.co.jp/",
      trousers: "https://store.united-arrows.co.jp/",
      shoes: "https://store.united-arrows.co.jp/",
      bag: "https://store.united-arrows.co.jp/",
      accessory: "https://store.united-arrows.co.jp/",
    },
    rows: [
      ["United Arrows Balmacaan Coat", "jacket", "greige", 720, 4, "refined minimal neutral"],
      ["United Arrows Soft Tailored Jacket", "jacket", "charcoal", 650, 4, "tailored refined monochrome"],
      ["United Arrows Semi-Wide Collar Shirt", "top", "white", 220, 5, "formal crisp refined"],
      ["United Arrows 12G Silk-Cotton Cardigan", "top", "midnight", 280, 4, "refined soft monochrome"],
      ["United Arrows Heavy Jersey Pocket Tee", "top", "slate", 120, 2, "minimal refined monochrome"],
      ["United Arrows Pleated Wool Slacks", "trousers", "dark charcoal", 310, 5, "formal tailored monochrome"],
      ["United Arrows Tapered Cotton Trousers", "trousers", "ink navy", 260, 3, "refined minimal versatile"],
      ["United Arrows Plain-Toe Leather Derby", "shoes", "black", 480, 5, "formal minimal monochrome"],
      ["United Arrows Leather Tote", "bag", "black", 420, 4, "minimal refined monochrome"],
      ["United Arrows Silk Knit Tie", "accessory", "burgundy", 145, 5, "formal textured refined"],
    ],
  },
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);

const products = BLOCKS.flatMap((block) =>
  block.rows.map(([name, category, color, price, formality, tags]) => ({
    id: `${slug(block.retailer)}-${slug(name)}`,
    retailer: block.retailer,
    name,
    category,
    color,
    styleTags: tags.split(" "),
    formality,
    price,
    currency: block.currency,
    imageUrl: `/catalog/${category}.svg`,
    productUrl: block.urls[category] ?? Object.values(block.urls)[0]!,
    countries: block.countries,
    sizes: SIZES[category],
    lastChecked: "2026-08-10",
    tier: block.tier,
  })),
);

const out = resolve(process.cwd(), "src/data/catalog.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  JSON.stringify(
    {
      _comment:
        "PLACEHOLDER CATALOG — realistic but invented products attributed to real retailers; productUrl points at each retailer's real category page, not a specific item. Replace with a real sourced list, or swap the whole data layer for a live affiliate feed (Rakuten / Awin / Skimlinks) — see src/lib/catalog/source.ts. Regenerate with `npx tsx supabase/buildCatalog.ts`, or just edit this file directly.",
      generatedAt: new Date().toISOString().slice(0, 10),
      count: products.length,
      products,
    },
    null,
    2,
  ),
);

const byCat = products.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});
console.log(`Wrote ${products.length} products to ${out}`);
console.log("By category:", byCat);
