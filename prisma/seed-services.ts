import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Cairo service providers & services...");

  // ─── Providers ─────────────────────────────────────────────────────────────
  const providers = await Promise.all([
    prisma.serviceProvider.upsert({
      where: { id: "omar-walks" },
      update: {},
      create: {
        id: "omar-walks",
        name: "Omar Walks",
        avatarEmoji: "🦮",
        bio: "Certified dog trainer with 5+ years walking dogs across Cairo. GPS updates on every walk.",
        location: "Cairo", neighborhood: "Maadi",
        latitude: 29.9602, longitude: 31.2569,
        rating: 4.9, reviewCount: 132, isVerified: true,
        whatsapp: "201012345678",
        email: "omar@omarwalks.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "laila-sits" },
      update: {},
      create: {
        id: "laila-sits",
        name: "Laila Sits",
        avatarEmoji: "🏠",
        bio: "Professional pet sitter offering in-home boarding with daily photo updates. Giza-based, covering New Cairo.",
        location: "Giza", neighborhood: "Sheikh Zayed",
        latitude: 30.0626, longitude: 30.9996,
        rating: 4.8, reviewCount: 87, isVerified: true,
        whatsapp: "201098765432",
        email: "laila@lailasits.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "dr-nour-vet" },
      update: {},
      create: {
        id: "dr-nour-vet",
        name: "Dr. Nour Vet Clinic",
        avatarEmoji: "🩺",
        bio: "Licensed veterinarian with 12 years in small animal medicine. English & Arabic. Home visits available.",
        location: "Cairo", neighborhood: "New Cairo",
        latitude: 30.0263, longitude: 31.4836,
        rating: 4.7, reviewCount: 210, isVerified: true,
        whatsapp: "201155551234",
        email: "clinic@drnour.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "pawfect-groom" },
      update: {},
      create: {
        id: "pawfect-groom",
        name: "Pawfect Grooming",
        avatarEmoji: "✂️",
        bio: "Mobile grooming studio coming to your door. Specialising in dogs and cats with organic products.",
        location: "Cairo", neighborhood: "Heliopolis",
        latitude: 30.0911, longitude: 31.3194,
        rating: 4.8, reviewCount: 64, isVerified: true,
        whatsapp: "201234567890",
        email: "book@pawfect.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "cairo-pet-hotel" },
      update: {},
      create: {
        id: "cairo-pet-hotel",
        name: "Cairo Pet Hotel",
        avatarEmoji: "🏨",
        bio: "Premium pet boarding facility with AC suites, outdoor play areas, CCTV, and 24/7 staff. New Cairo.",
        location: "Cairo", neighborhood: "New Cairo",
        latitude: 30.0263, longitude: 31.4836,
        rating: 4.9, reviewCount: 45, isVerified: true,
        whatsapp: "201500000001",
        email: "stay@cairopethotel.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "swift-pet-taxi" },
      update: {},
      create: {
        id: "swift-pet-taxi",
        name: "Swift Pet Taxi",
        avatarEmoji: "🚗",
        bio: "Safe, air-conditioned pet transport across Cairo & Giza. Airport pickups, vet trips, grooming runs.",
        location: "Cairo", neighborhood: "Nasr City",
        latitude: 30.0682, longitude: 31.3427,
        rating: 4.6, reviewCount: 38, isVerified: true,
        whatsapp: "201122334455",
        email: "ride@swiftpet.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "dr-sara-emergency" },
      update: {},
      create: {
        id: "dr-sara-emergency",
        name: "Dr. Sara Emergency Vet",
        avatarEmoji: "🚨",
        bio: "24/7 emergency vet. Home visits across Cairo. Critical care specialist. WhatsApp first for fastest response.",
        location: "Cairo", neighborhood: "Zamalek",
        latitude: 30.0611, longitude: 31.2234,
        rating: 4.9, reviewCount: 29, isVerified: true,
        whatsapp: "201099988877",
        email: "emergency@drsara.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "hana-nasr-sitter" },
      update: {},
      create: {
        id: "hana-nasr-sitter",
        name: "Hana Pet Sitter",
        avatarEmoji: "🏠",
        bio: "Experienced cat & dog sitter in Nasr City. Your pet stays home, I come to you. Twice-daily visits.",
        location: "Cairo", neighborhood: "Nasr City",
        latitude: 30.0682, longitude: 31.3427,
        rating: 4.7, reviewCount: 53, isVerified: false,
        whatsapp: "201033445566",
        email: "hana@hanasits.eg",
      },
    }),
    prisma.serviceProvider.upsert({
      where: { id: "green-paws-mohandeseen" },
      update: {},
      create: {
        id: "green-paws-mohandeseen",
        name: "Green Paws",
        avatarEmoji: "✂️",
        bio: "In-salon and mobile grooming in Mohandiseen. Speciality: breed-specific cuts and spa treatments.",
        location: "Giza", neighborhood: "Mohandiseen",
        latitude: 30.0574, longitude: 31.2060,
        rating: 4.7, reviewCount: 91, isVerified: true,
        whatsapp: "201044556677",
        email: "grooming@greenpaws.eg",
      },
    }),
  ]);

  const [omar, laila, drNour, pawfect, cairoHotel, swiftTaxi, drSara, hana, greenPaws] = providers;

  // ─── Services ──────────────────────────────────────────────────────────────
  const services = [
    // WALKS – Omar
    { id: "walk-30", providerId: omar.id, category: "walks", title: "30-min Dog Walk", description: "Neighbourhood walk with GPS tracking & photo updates sent to you in real time.", priceEGP: 150, durationMins: 30, atHomeOnly: false, species: "dog", segment: "B" },
    { id: "walk-60", providerId: omar.id, category: "walks", title: "60-min Adventure Walk", description: "Park visit, off-leash play in a safe zone, and a post-walk report card.", priceEGP: 250, durationMins: 60, atHomeOnly: false, species: "dog", segment: "B" },
    { id: "walk-group", providerId: omar.id, category: "walks", title: "Group Walk (3–5 dogs)", description: "Socialisation walk with a small group of friendly dogs. Great value, great fun.", priceEGP: 100, durationMins: 45, atHomeOnly: false, species: "dog", segment: "B" },

    // SITTING – Laila
    { id: "sit-overnight", providerId: laila.id, category: "sitting", title: "Overnight Boarding", description: "Your pet stays in Laila's loving home. Daily photo and video updates included.", priceEGP: 500, durationMins: null, atHomeOnly: false, species: "all", segment: "B" },
    { id: "sit-weekly", providerId: laila.id, category: "sitting", title: "Weekly Boarding (per night)", description: "Best rate for extended stays. AC suite, outdoor garden, home-cooked meals.", priceEGP: 450, durationMins: null, atHomeOnly: false, species: "all", segment: "A" },
    { id: "sit-homevisit", providerId: hana.id, category: "sitting", title: "At-Home Visit (Nasr City)", description: "I come to your home twice a day to feed, play, and give your pet attention.", priceEGP: 200, durationMins: 60, atHomeOnly: true, species: "all", segment: "B" },

    // VETS – Dr. Nour
    { id: "vet-checkup", providerId: drNour.id, category: "vets", title: "General Checkup", description: "Full physical exam, consultation, and written health report. Home visits available.", priceEGP: 400, durationMins: 40, atHomeOnly: false, species: "all", segment: "B" },
    { id: "vet-vaccine", providerId: drNour.id, category: "vets", title: "Vaccination Visit", description: "Core vaccines with digital health record. Reminder SMS sent when next dose is due.", priceEGP: 350, durationMins: 30, atHomeOnly: false, species: "all", segment: "B" },
    { id: "vet-dental", providerId: drNour.id, category: "vets", title: "Dental Cleaning", description: "Professional ultrasonic dental scaling under sedation. Includes post-care instructions.", priceEGP: 700, durationMins: 90, atHomeOnly: false, species: "all", segment: "A" },
    { id: "vet-telehealth", providerId: drNour.id, category: "vets", title: "Telehealth WhatsApp Consult", description: "Video or voice call with Dr. Nour. Perfect for minor concerns, diet advice, or follow-ups.", priceEGP: 150, durationMins: 20, atHomeOnly: true, species: "all", segment: "B" },
    { id: "vet-homevisit", providerId: drNour.id, category: "vets", title: "Vet Home Visit", description: "Dr. Nour comes to you. Ideal for anxious pets or post-op recovery checks.", priceEGP: 600, durationMins: 45, atHomeOnly: true, species: "all", segment: "A" },

    // GROOMING – Pawfect (mobile)
    { id: "groom-bath", providerId: pawfect.id, category: "grooming", title: "Bath & Brush", description: "Professional shampoo, blow-dry, brush-out, and ear cleaning at your door.", priceEGP: 200, durationMins: 60, atHomeOnly: true, species: "dog", segment: "B" },
    { id: "groom-full", providerId: pawfect.id, category: "grooming", title: "Full Groom", description: "Bath, cut, blowdry, nail trim, ear cleaning, and bandana. Breed-specific styling.", priceEGP: 400, durationMins: 120, atHomeOnly: true, species: "dog", segment: "B" },
    { id: "groom-nails", providerId: pawfect.id, category: "grooming", title: "Nail Trim Only", description: "Quick, stress-free nail trim with grinding. Done at your door in under 15 minutes.", priceEGP: 80, durationMins: 15, atHomeOnly: true, species: "all", segment: "B" },
    { id: "groom-spa", providerId: pawfect.id, category: "grooming", title: "Spa Package", description: "Premium grooming: oatmeal bath, deep conditioning, paw balm, cologne, and bow tie.", priceEGP: 550, durationMins: 150, atHomeOnly: true, species: "dog", segment: "A" },
    // Green Paws salon
    { id: "groom-salon-mohandeseen", providerId: greenPaws.id, category: "grooming", title: "Salon Full Groom (Mohandiseen)", description: "In-salon groom with breed-specific cut. Drop off & collect. Cat grooming available.", priceEGP: 350, durationMins: 120, atHomeOnly: false, species: "all", segment: "B" },

    // PET HOTEL
    { id: "hotel-daycare", providerId: cairoHotel.id, category: "hotel", title: "Day Care (7am–7pm)", description: "Supervised play, feeding, and rest in our AC facility. CCTV access for owners.", priceEGP: 300, durationMins: 720, atHomeOnly: false, species: "dog", segment: "B" },
    { id: "hotel-overnight", providerId: cairoHotel.id, category: "hotel", title: "Overnight Suite", description: "Private AC suite with raised bed. Morning walk, playtime, and video report each evening.", priceEGP: 700, durationMins: null, atHomeOnly: false, species: "all", segment: "A" },
    { id: "hotel-weekly", providerId: cairoHotel.id, category: "hotel", title: "Weekly Package (7 nights)", description: "Best rate for holiday boarding. Includes all meals, play, and a spa bath on checkout day.", priceEGP: 4000, durationMins: null, atHomeOnly: false, species: "all", segment: "A" },

    // PET TAXI
    { id: "taxi-vet", providerId: swiftTaxi.id, category: "taxi", title: "Vet / Groomer Trip", description: "Safe, air-conditioned transport to your vet or groomer and back. Door-to-door.", priceEGP: 250, durationMins: 60, atHomeOnly: false, species: "all", segment: "B" },
    { id: "taxi-airport", providerId: swiftTaxi.id, category: "taxi", title: "Airport Transfer", description: "Specialised crate-compliant transport to Cairo International Airport. Pet + owner welcome.", priceEGP: 450, durationMins: 90, atHomeOnly: false, species: "all", segment: "A" },
    { id: "taxi-emergency", providerId: swiftTaxi.id, category: "taxi", title: "Emergency Transport (24/7)", description: "Rush transport to nearest emergency vet clinic. Available any time, any night.", priceEGP: 600, durationMins: 30, atHomeOnly: false, species: "all", segment: "A" },

    // EMERGENCY VET
    { id: "emergency-home", providerId: drSara.id, category: "emergency", title: "24/7 Emergency Home Visit", description: "Dr. Sara responds within 30–60 min across Cairo. Critical care, trauma, toxin ingestion.", priceEGP: 900, durationMins: 60, atHomeOnly: true, species: "all", segment: "A" },
    { id: "emergency-call", providerId: drSara.id, category: "emergency", title: "Emergency Phone Triage (Anytime)", description: "Call or WhatsApp Dr. Sara immediately. She'll assess severity and guide next steps live.", priceEGP: 200, durationMins: 20, atHomeOnly: true, species: "all", segment: "B" },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { id: svc.id },
      update: { priceEGP: svc.priceEGP },
      create: svc,
    });
  }

  console.log(`Seeded ${providers.length} providers and ${services.length} services.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
