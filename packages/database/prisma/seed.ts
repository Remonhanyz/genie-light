import { PrismaClient, Role, OrderStatus, PaymentMethod } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("🌱 Seeding Genie Light Database...");

  // 1. Seed Users (Admin, Data Entry Specialist, Customer)
  const adminPasswordHash = hashPassword("Admin@Genie2026!");
  const dataEntryPasswordHash = hashPassword("Data@Genie2026!");

  const admin = await prisma.user.upsert({
    where: { email: "admin@genielight-co.com" },
    update: {},
    create: {
      email: "admin@genielight-co.com",
      name: "Eng. Ahmed Mostafa",
      passwordHash: adminPasswordHash,
      phone: "+20 101 479 4281",
      company: "Genie Light",
      role: Role.ADMIN,
    },
  });

  const dataEntry = await prisma.user.upsert({
    where: { email: "dataentry@genielight-co.com" },
    update: {},
    create: {
      email: "dataentry@genielight-co.com",
      name: "Catalog Specialist",
      passwordHash: dataEntryPasswordHash,
      phone: "+20 102 453 8960",
      company: "Genie Light Operations",
      role: Role.DATA_ENTRY,
    },
  });

  console.log(`✅ Users created: Admin (${admin.email}), Data Entry (${dataEntry.email})`);

  // 2. Seed Official Partner Brands
  const brandsData = [
    {
      name: "Philips",
      slug: "philips",
      description: "Global leader in professional, architectural, and smart connected LED lighting.",
      isOfficial: true,
      logoUrl: "/images/brands/philips.svg",
    },
    {
      name: "Schneider Electric",
      slug: "schneider-electric",
      description: "Digital automation and energy management solutions, switches, and industrial controls.",
      isOfficial: true,
      logoUrl: "/images/brands/schneider.svg",
    },
    {
      name: "OSRAM",
      slug: "osram",
      description: "Pioneering optical solutions, high-performance LED chips, and commercial luminaires.",
      isOfficial: true,
      logoUrl: "/images/brands/osram.svg",
    },
    {
      name: "Ledvance",
      slug: "ledvance",
      description: "General lighting solutions for professional lighting contractors and commercial facilities.",
      isOfficial: true,
      logoUrl: "/images/brands/ledvance.svg",
    },
    {
      name: "Tridonic",
      slug: "tridonic",
      description: "World-class intelligent drivers, emergency inverters, and lighting components.",
      isOfficial: true,
      logoUrl: "/images/brands/tridonic.svg",
    },
    {
      name: "Fumagalli",
      slug: "fumagalli",
      description: "Italian resin outdoor lighting, rust and corrosion-free lifetime guaranteed poles.",
      isOfficial: true,
      logoUrl: "/images/brands/fumagalli.svg",
    },
    {
      name: "Elsewedy Engineering",
      slug: "elsewedy",
      description: "Heavy-duty industrial cables, fixtures, and national infrastructure electrical equipment.",
      isOfficial: true,
      logoUrl: "/images/brands/elsewedy.svg",
    },
    {
      name: "Olympia Electronics",
      slug: "olympia-electronics",
      description: "European certified safety and emergency lighting, exit signs, and fire detection.",
      isOfficial: true,
      logoUrl: "/images/brands/olympia.svg",
    },
  ];

  const brandMap = new Map<string, string>();
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    brandMap.set(b.slug, brand.id);
  }
  console.log(`✅ ${brandsData.length} Partner Brands seeded.`);

  // 3. Seed Hierarchical Categories
  const categoriesData = [
    {
      name: "Indoor Lighting",
      slug: "indoor-lighting",
      description: "Commercial, office, and architectural interior lighting fixtures.",
      subcategories: [
        { name: "Recessed Downlights", slug: "recessed-downlights", description: "Architectural glare-free ceiling downlights" },
        { name: "Linear Profiles", slug: "linear-profiles", description: "Continuous architectural surface and pendant linear systems" },
        { name: "Track Lighting", slug: "track-lighting", description: "Flexible 3-phase magnetic and spotlight systems for retail & galleries" },
        { name: "LED Panel Lights", slug: "led-panel-lights", description: "UGR<19 high-efficiency office ceiling panels" },
      ],
    },
    {
      name: "Outdoor Lighting",
      slug: "outdoor-lighting",
      description: "Weatherproof facade, architectural floodlighting, and public pathway systems.",
      subcategories: [
        { name: "LED Floodlights", slug: "led-floodlights", description: "High-output architectural and area floodlights" },
        { name: "Street & Highway Lighting", slug: "street-lighting", description: "Certified road and urban arterial luminaires" },
        { name: "Architectural Bollards", slug: "architectural-bollards", description: "Pedestrian pathway and landscape fixtures" },
        { name: "Facade Wall Washers", slug: "facade-wall-washers", description: "Narrow and asymmetric wall grazing lighting" },
      ],
    },
    {
      name: "Industrial & Specialized",
      slug: "industrial-lighting",
      description: "Heavy-duty, vibration-resistant, and explosion-proof luminaires.",
      subcategories: [
        { name: "UFO High Bays", slug: "ufo-high-bays", description: "High-ceiling warehouse and industrial hall illumination" },
        { name: "Waterproof Battens (IP65/IP66)", slug: "waterproof-battens", description: "Moisture and dust-proof linear fittings" },
        { name: "ATEX Explosion-Proof", slug: "explosion-proof", description: "Hazardous zone petroleum and chemical certified lighting" },
      ],
    },
    {
      name: "Emergency & Safety",
      slug: "emergency-safety",
      description: "Compliant emergency escape route luminaires and illuminated exit indicators.",
      subcategories: [
        { name: "Illuminated Exit Signs", slug: "illuminated-exit-signs", description: "Self-testing LED illuminated directional exit signs" },
        { name: "Emergency Battery Inverters", slug: "emergency-inverters", description: "3-hour autonomous emergency power kits for LED fixtures" },
      ],
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    categoryMap.set(cat.slug, parent.id);

    for (const sub of cat.subcategories) {
      const child = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, description: sub.description, parentId: parent.id },
        create: { name: sub.name, slug: sub.slug, description: sub.description, parentId: parent.id },
      });
      categoryMap.set(sub.slug, child.id);
    }
  }
  console.log(`✅ Hierarchical Categories & Subcategories seeded.`);

  // 4. Seed Egyptian Delivery Zones & Dynamic Fees
  const deliveryZones = [
    { governorate: "Cairo", deliveryFee: 60, estimatedDays: "1-2 Business Days" },
    { governorate: "Giza", deliveryFee: 60, estimatedDays: "1-2 Business Days" },
    { governorate: "Alexandria", deliveryFee: 90, estimatedDays: "2-3 Business Days" },
    { governorate: "Qalyubia", deliveryFee: 80, estimatedDays: "2-3 Business Days" },
    { governorate: "Sharqia", deliveryFee: 90, estimatedDays: "2-3 Business Days" },
    { governorate: "Dakahlia", deliveryFee: 90, estimatedDays: "2-3 Business Days" },
    { governorate: "Gharbia", deliveryFee: 90, estimatedDays: "2-3 Business Days" },
    { governorate: "Monufia", deliveryFee: 90, estimatedDays: "2-3 Business Days" },
    { governorate: "Beheira", deliveryFee: 90, estimatedDays: "2-3 Business Days" },
    { governorate: "Kafr El Sheikh", deliveryFee: 95, estimatedDays: "2-3 Business Days" },
    { governorate: "Damietta", deliveryFee: 95, estimatedDays: "2-3 Business Days" },
    { governorate: "Port Said", deliveryFee: 100, estimatedDays: "2-4 Business Days" },
    { governorate: "Ismailia", deliveryFee: 100, estimatedDays: "2-4 Business Days" },
    { governorate: "Suez", deliveryFee: 100, estimatedDays: "2-4 Business Days" },
    { governorate: "Fayoum", deliveryFee: 120, estimatedDays: "3-4 Business Days" },
    { governorate: "Beni Suef", deliveryFee: 120, estimatedDays: "3-4 Business Days" },
    { governorate: "Minya", deliveryFee: 140, estimatedDays: "3-5 Business Days" },
    { governorate: "Assiut", deliveryFee: 140, estimatedDays: "3-5 Business Days" },
    { governorate: "Sohag", deliveryFee: 140, estimatedDays: "3-5 Business Days" },
    { governorate: "Qena", deliveryFee: 150, estimatedDays: "3-5 Business Days" },
    { governorate: "Luxor", deliveryFee: 150, estimatedDays: "4-5 Business Days" },
    { governorate: "Aswan", deliveryFee: 160, estimatedDays: "4-6 Business Days" },
    { governorate: "Red Sea", deliveryFee: 160, estimatedDays: "4-6 Business Days" },
    { governorate: "South Sinai", deliveryFee: 170, estimatedDays: "4-6 Business Days" },
    { governorate: "North Sinai", deliveryFee: 170, estimatedDays: "4-6 Business Days" },
    { governorate: "Matrouh", deliveryFee: 160, estimatedDays: "4-6 Business Days" },
    { governorate: "New Valley", deliveryFee: 180, estimatedDays: "5-7 Business Days" },
  ];

  for (const zone of deliveryZones) {
    await prisma.deliveryZone.upsert({
      where: { governorate: zone.governorate },
      update: { deliveryFee: zone.deliveryFee, estimatedDays: zone.estimatedDays },
      create: { governorate: zone.governorate, deliveryFee: zone.deliveryFee, estimatedDays: zone.estimatedDays },
    });
  }
  console.log(`✅ ${deliveryZones.length} Egyptian Governorate Delivery Zones configured.`);

  // 5. Seed Real Project Case Studies (Section 10)
  const caseStudies = [
    {
      title: "Cairo International Airport Apron & Terminal High-Mast Lighting",
      slug: "cairo-international-airport",
      client: "Cairo Airport Travel / Egyptian Airports Company",
      sector: "Aviation Infrastructure",
      location: "Cairo, Egypt",
      summary: "Comprehensive apron floodlighting and terminal modernization meeting strict ICAO uniformity thresholds.",
      challenges: "Inconsistent lux levels and poor uniformity ratios in aircraft movement areas; low CRI obscuring critical markings and ground signals; severe glare rating (UGR) causing pilot fatigue; extreme thermal stress on LED drivers under Egyptian summer heat.",
      solutions: "High-mast apron floodlighting with calibrated CCT (4000K–5000K) and CRI >80; maintained uniformity ratio >0.5 exceeding ICAO standards; deployed IP66-rated fixtures with IK08 impact resistance; integrated smart DALI dimming adapting to flight schedules; LM80 & TM21 certified LED modules backed by a 5-year warranty with zero failures recorded.",
      standards: "ICAO Aerodrome Annex 14, LM80, TM21, UGR<19, IP66, IK08",
      featured: true,
    },
    {
      title: "Port Said Tunnels Continuous Sub-Sea Illumination",
      slug: "port-said-tunnels",
      client: "National Infrastructure Authority",
      sector: "Transportation & Tunnels",
      location: "Port Said, Egypt",
      summary: "High-efficiency, corrosive-resistant tunnel illumination with dynamic daylight adaptation at ingress zones.",
      challenges: "Severe visual contrast between daylight tunnel entrances and interior zones; corrosive humidity and saline dust; limited fixture access causing high maintenance downtime; strict 24/7 continuous operation mandates.",
      solutions: "High-efficiency tunnel luminaires with adaptive entrance luminance controls; heat- and moisture-resistant anti-corrosive housing (IP66); easy-access fixture mounting brackets to minimize lane closure times; fully integrated emergency battery backup ensuring instant activation during grid failure.",
      standards: "CIE 88 Tunnel Lighting Standard, IP66, 3-Hour Battery Autonomy",
      featured: true,
    },
    {
      title: "Cairo Metro Line 3 Transit Illumination",
      slug: "cairo-metro-line-3",
      client: "National Authority for Tunnels (NAT)",
      sector: "Urban Public Transit",
      location: "Cairo, Egypt",
      summary: "Vibration-proof, glare-free luminaire network across stations, platform edges, and passenger concourses.",
      challenges: "24/7 continuous transit operation; extreme vibration and metal-dust from rail movement; zero-glare requirements for passenger safety on platforms and ticket halls.",
      solutions: "Glare-free luminaires with CRI ≥80 and uniform distribution (≥0.8); IP66-rated vibration-proof housings; DALI smart control integrated with station energy automation; certified emergency egress illumination across platforms, stairs, and concourses.",
      standards: "EN 12464-1 Railway Lighting, IP66, DALI Integration",
      featured: true,
    },
    {
      title: "Petrojet Industrial Petroleum Refineries & Processing Facilities",
      slug: "petrojet-refinery-complex",
      client: "Petrojet",
      sector: "Oil & Gas / Heavy Industrial",
      location: "Suez & Alexandria, Egypt",
      summary: "Heavy-duty explosion-proof ATEX & IECEx luminaires engineered for volatile hydrocarbon gas environments.",
      challenges: "Explosive environments with flammable gases and chemical vapors; extreme ambient heat and airborne dust; strict compliance requirements with international explosion-proof standards (ATEX & IECEx).",
      solutions: "Heavy-duty hazardous-location luminaires certified under ATEX/IECEx Zone 1 and Zone 2; L90 rated lifespan exceeding 50,000 hours; 5-year comprehensive operational warranty with zero reported defects.",
      standards: "ATEX II 2 G Ex db eb IIC T6 Gb, IECEx, IP66/IP67",
      featured: true,
    },
    {
      title: "New Alamein University (AIU) Architectural Campus Lighting",
      slug: "new-alamein-university",
      client: "New Alamein University",
      sector: "Higher Education & Research",
      location: "New Alamein, Egypt",
      summary: "Human-centric, high-CRI lighting across lecture auditoriums, scientific laboratories, and campus grounds.",
      challenges: "High visual comfort required for long study hours; energy optimization across extensive campus buildings; diverse lighting needs spanning auditoriums, laboratories, and outdoor pathways.",
      solutions: "High-CRI LED lighting (CRI ≥90) for lecture halls and libraries; classroom illumination calibrated to 300–500 lux; neutral white CCT (4000K–5000K) supporting cognitive concentration; DALI automated daylight harvesting sensors.",
      standards: "WELL Building Standard Lighting Feature, UGR<16, CRI≥90",
      featured: true,
    },
  ];

  for (const cs of caseStudies) {
    await prisma.projectCaseStudy.upsert({
      where: { slug: cs.slug },
      update: cs,
      create: cs,
    });
  }
  console.log(`✅ ${caseStudies.length} Real Project Case Studies seeded.`);

  // 6. Seed Sample Parent Product & Child Variant Matrix
  const philipsId = brandMap.get("philips")!;
  const floodlightCatId = categoryMap.get("led-floodlights")!;

  const philipsFloodlight = await prisma.product.upsert({
    where: { slug: "philips-smartbright-g3-led-floodlight" },
    update: {},
    create: {
      name: "Philips SmartBright G3 LED Floodlight",
      slug: "philips-smartbright-g3-led-floodlight",
      shortDesc: "High-efficacy IP65 architectural and security floodlight with die-cast aluminum housing.",
      description: "Philips SmartBright G3 LED Floodlight delivers significant energy savings compared to conventional halogen and metal halide floodlights. Engineered with robust die-cast aluminum housing, tempered glass diffuser, and integrated surge protection (up to 4kV). Suitable for architectural facade accents, sports grounds, perimeter security, and outdoor industrial facilities.",
      brandId: philipsId,
      categoryId: floodlightCatId,
      featured: true,
      active: true,
      createdById: admin.id,
      images: {
        create: [
          { url: "/images/products/philips-bvp150-front.jpg", alt: "Philips SmartBright G3 Floodlight Front View", order: 0 },
          { url: "/images/products/philips-bvp150-bracket.jpg", alt: "Philips SmartBright G3 Mounting Bracket Schematic", order: 1 },
        ],
      },
    },
  });

  // Seed Sub-Product Variants for Philips SmartBright Floodlight
  const floodlightVariants = [
    {
      sku: "PH-BVP150-10W-3000K-IP65",
      modelNumber: "BVP150 LED10/WW 10W",
      price: 420.0,
      stockQuantity: 150,
      wattage: 10,
      luminousFlux: 950,
      colorTemperature: 3000,
      cri: 80,
      beamAngle: "110°",
      ipRating: "IP65",
      inputVoltage: "220-240V 50/60Hz",
      dimensions: "115 x 90 x 28 mm",
      otherDetails: "Die-cast aluminum, 1kV/2kV surge protection, 30,000h L70B50, 3-year warranty.",
      datasheetUrl: "/datasheets/philips-smartbright-bvp150-10w.pdf",
    },
    {
      sku: "PH-BVP150-50W-4000K-IP65",
      modelNumber: "BVP150 LED50/NW 50W",
      price: 1150.0,
      discountPrice: 1050.0,
      stockQuantity: 80,
      wattage: 50,
      luminousFlux: 4750,
      colorTemperature: 4000,
      cri: 80,
      beamAngle: "110°",
      ipRating: "IP65",
      inputVoltage: "220-240V 50/60Hz",
      dimensions: "200 x 145 x 35 mm",
      otherDetails: "Die-cast aluminum, 2kV/4kV surge protection, 30,000h L70B50, 3-year warranty.",
      datasheetUrl: "/datasheets/philips-smartbright-bvp150-50w.pdf",
    },
    {
      sku: "PH-BVP150-100W-6500K-IP65",
      modelNumber: "BVP150 LED100/CW 100W",
      price: 2100.0,
      stockQuantity: 45,
      wattage: 100,
      luminousFlux: 9500,
      colorTemperature: 6500,
      cri: 80,
      beamAngle: "110°",
      ipRating: "IP65",
      inputVoltage: "220-240V 50/60Hz",
      dimensions: "290 x 210 x 42 mm",
      otherDetails: "High-output area floodlight, 4kV surge protection, 50,000h lifespan, 3-year warranty.",
      datasheetUrl: "/datasheets/philips-smartbright-bvp150-100w.pdf",
    },
  ];

  for (const variant of floodlightVariants) {
    await prisma.subProduct.upsert({
      where: { sku: variant.sku },
      update: variant,
      create: {
        ...variant,
        productId: philipsFloodlight.id,
        createdById: admin.id,
      },
    });
  }

  console.log(`✅ Sample Product (Philips SmartBright) with 3 Sub-Product variants seeded.`);
  console.log("🌟 Genie Light Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
