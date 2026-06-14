import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 6 test Cairo users, each listing their own dogs for adoption
const cairoPets = [
  // ── Sarah | Maadi (Segment A) ──────────────────────────────────────────────
  {
    id: "cairo-rex",
    name: "Rex", species: "dog", breed: "German Shepherd Mix", ageMonths: 28,
    gender: "male", size: "large", energyLevel: "high",
    goodWithKids: true, goodWithPets: false,
    description: "Rex is a loyal, intelligent shepherd mix who was rescued from the streets of Maadi two years ago. He's been fully vaccinated, neutered, and trained by Sarah. He needs an experienced owner with a villa or garden.",
    photoUrl: "/dogs/dog-1.jpg",
    shelterName: "Sarah — Maadi Resident", shelterEmail: "sarah.maadi@gmail.com",
    location: "Maadi, Cairo", latitude: 29.9602, longitude: 31.2569,
  },
  {
    id: "cairo-coco",
    name: "Coco", species: "dog", breed: "Mixed Breed", ageMonths: 10,
    gender: "female", size: "small", energyLevel: "high",
    goodWithKids: true, goodWithPets: true,
    description: "Coco is a playful, tiny puppy Sarah found under a car in Maadi. She's been vet-checked, dewormed, and is ready for her forever home. She's a fast learner and loves cuddles. Perfect for a flat.",
    photoUrl: "/dogs/dog-5.jpg",
    shelterName: "Sarah — Maadi Resident", shelterEmail: "sarah.maadi@gmail.com",
    location: "Maadi, Cairo", latitude: 29.9602, longitude: 31.2569,
  },

  // ── Khaled | Zamalek (Segment A) ──────────────────────────────────────────
  {
    id: "cairo-simba",
    name: "Simba", species: "dog", breed: "Husky Mix", ageMonths: 18,
    gender: "male", size: "large", energyLevel: "high",
    goodWithKids: true, goodWithPets: true,
    description: "Simba arrived as a stray in Zamalek but quickly stole Khaled's heart. With his striking blue eyes and fluffy coat, he turns heads on every walk along the Nile. He needs AC year-round and active owners.",
    photoUrl: "/dogs/dog-2.jpg",
    shelterName: "Khaled — Zamalek Resident", shelterEmail: "khaled.zamalek@gmail.com",
    location: "Zamalek, Cairo", latitude: 30.0611, longitude: 31.2234,
  },
  {
    id: "cairo-lucky",
    name: "Lucky", species: "dog", breed: "Mixed Breed", ageMonths: 36,
    gender: "male", size: "medium", energyLevel: "medium",
    goodWithKids: true, goodWithPets: true,
    description: "Lucky has been with Khaled for three years but is being rehomed as the family is relocating abroad. He's well-trained, calm, and excellent with children and other dogs. A true family dog.",
    photoUrl: "/dogs/dog-6.jpg",
    shelterName: "Khaled — Zamalek Resident", shelterEmail: "khaled.zamalek@gmail.com",
    location: "Zamalek, Cairo", latitude: 30.0611, longitude: 31.2234,
  },

  // ── Amira | New Cairo (Segment A) ─────────────────────────────────────────
  {
    id: "cairo-mocha",
    name: "Mocha", species: "dog", breed: "Cocker Spaniel Mix", ageMonths: 14,
    gender: "female", size: "medium", energyLevel: "medium",
    goodWithKids: true, goodWithPets: true,
    description: "Mocha is a silky-eared sweetheart rescued from a compound in New Cairo. She was abandoned when her previous owners moved overseas. She's gentle, house-trained, and absolutely adores children.",
    photoUrl: "/dogs/dog-3.jpg",
    shelterName: "Amira — New Cairo Resident", shelterEmail: "amira.newcairo@gmail.com",
    location: "New Cairo, Cairo", latitude: 30.0263, longitude: 31.4836,
  },
  {
    id: "cairo-biscuit",
    name: "Biscuit", species: "dog", breed: "Mixed Breed", ageMonths: 7,
    gender: "male", size: "small", energyLevel: "high",
    goodWithKids: true, goodWithPets: true,
    description: "Biscuit is a golden fluffy puppy Amira bottle-fed after finding him alone at 3 weeks old. He's now fully weaned, vaccinated, and overflowing with personality. First to greet everyone at the door.",
    photoUrl: "/dogs/dog-11.jpg",
    shelterName: "Amira — New Cairo Resident", shelterEmail: "amira.newcairo@gmail.com",
    location: "New Cairo, Cairo", latitude: 30.0263, longitude: 31.4836,
  },
  {
    id: "cairo-storm",
    name: "Storm", species: "dog", breed: "Saluki Mix", ageMonths: 24,
    gender: "female", size: "large", energyLevel: "high",
    goodWithKids: false, goodWithPets: false,
    description: "Storm is a graceful Saluki mix — an ancient Egyptian breed — with lightning speed and gentle manners. She needs open space, a leash at all times outdoors, and an experienced owner who can match her elegant energy.",
    photoUrl: "/dogs/dog-4.jpg",
    shelterName: "Amira — New Cairo Resident", shelterEmail: "amira.newcairo@gmail.com",
    location: "New Cairo, Cairo", latitude: 30.0263, longitude: 31.4836,
  },

  // ── Hassan | Nasr City (Segment B) ────────────────────────────────────────
  {
    id: "cairo-balto",
    name: "Balto", species: "dog", breed: "Mixed Breed", ageMonths: 30,
    gender: "male", size: "medium", energyLevel: "medium",
    goodWithKids: true, goodWithPets: true,
    description: "Balto lived as a street dog in Nasr City until Hassan started feeding him. After months of patience and trust-building, Balto became the world's most loyal companion. He's calm, quiet, and perfectly house-trained.",
    photoUrl: "/dogs/dog-7.jpg",
    shelterName: "Hassan — Nasr City Resident", shelterEmail: "hassan.nasrcity@gmail.com",
    location: "Nasr City, Cairo", latitude: 30.0682, longitude: 31.3427,
  },
  {
    id: "cairo-zara",
    name: "Zara", species: "dog", breed: "Mixed Breed", ageMonths: 12,
    gender: "female", size: "small", energyLevel: "medium",
    goodWithKids: true, goodWithPets: true,
    description: "Zara is a sweet, calm young girl rescued from a busy street in Nasr City. She gets along with everyone — cats, dogs, children — and has never once barked unnecessarily. A perfect apartment companion.",
    photoUrl: "/dogs/dog-9.jpg",
    shelterName: "Hassan — Nasr City Resident", shelterEmail: "hassan.nasrcity@gmail.com",
    location: "Nasr City, Cairo", latitude: 30.0682, longitude: 31.3427,
  },

  // ── Fatma | Mohandiseen (Segment B) ───────────────────────────────────────
  {
    id: "cairo-toby",
    name: "Toby", species: "dog", breed: "Mixed Breed", ageMonths: 48,
    gender: "male", size: "medium", energyLevel: "low",
    goodWithKids: true, goodWithPets: true,
    description: "Toby is a calm, senior-ish rescue who has been with Fatma for four years. She's relocating for work and heartbrokenly needs to find him a new loving home. He's trained, vaccinated, microchipped, and pure gold.",
    photoUrl: "/dogs/dog-10.jpg",
    shelterName: "Fatma — Mohandiseen Resident", shelterEmail: "fatma.mohandeseen@gmail.com",
    location: "Mohandiseen, Giza", latitude: 30.0574, longitude: 31.2060,
  },
  {
    id: "cairo-luna",
    name: "لونا (Luna)", species: "dog", breed: "Mixed Breed", ageMonths: 16,
    gender: "female", size: "small", energyLevel: "medium",
    goodWithKids: true, goodWithPets: true,
    description: "لونا كانت قطة الشارع في المهندسين قبل ما فاطمة تنقذها. دلوقتي بقت كلبة دلوعة بتحب الجلوس جنب صاحبتها. تحب الأطفال وبتتعلم بسرعة. Luna is a gentle soul looking for her forever Giza home.",
    photoUrl: "/dogs/dog-8.jpg",
    shelterName: "Fatma — Mohandiseen Resident", shelterEmail: "fatma.mohandeseen@gmail.com",
    location: "Mohandiseen, Giza", latitude: 30.0574, longitude: 31.2060,
  },

  // ── Youssef | Heliopolis (Segment B) ──────────────────────────────────────
  {
    id: "cairo-rocky",
    name: "Rocky", species: "dog", breed: "Labrador Mix", ageMonths: 20,
    gender: "male", size: "large", energyLevel: "high",
    goodWithKids: true, goodWithPets: true,
    description: "Rocky is a classic Labrador mix with all the love and zero chill. He was born in Heliopolis and raised by Youssef's family. Fully vaccinated and neutered. He needs space to run and a family to love.",
    photoUrl: "/dogs/dog-12.jpg",
    shelterName: "Youssef — Heliopolis Resident", shelterEmail: "youssef.heliopolis@gmail.com",
    location: "Heliopolis, Cairo", latitude: 30.0911, longitude: 31.3194,
  },
  {
    id: "cairo-penny",
    name: "Penny", species: "dog", breed: "Mixed Breed", ageMonths: 8,
    gender: "female", size: "small", energyLevel: "high",
    goodWithKids: true, goodWithPets: true,
    description: "Penny is a chestnut-brown puppy Youssef's kids found and convinced him to keep — then convinced him to find a better home after the chaos. She's playful, learns fast, and is currently learning sit, stay, and paw.",
    photoUrl: "/dogs/dog-13.jpg",
    shelterName: "Youssef — Heliopolis Resident", shelterEmail: "youssef.heliopolis@gmail.com",
    location: "Heliopolis, Cairo", latitude: 30.0911, longitude: 31.3194,
  },
  {
    id: "cairo-diesel",
    name: "Diesel", species: "dog", breed: "Mixed Breed", ageMonths: 60,
    gender: "male", size: "large", energyLevel: "low",
    goodWithKids: false, goodWithPets: true,
    description: "Diesel is a big, old soul who has seen a lot of life. He's calm, quiet, and asks for very little — a walk, a meal, and a spot near you. He's not great with small children but is a perfect companion for adults.",
    photoUrl: "/dogs/dog-14.jpg",
    shelterName: "Youssef — Heliopolis Resident", shelterEmail: "youssef.heliopolis@gmail.com",
    location: "Heliopolis, Cairo", latitude: 30.0911, longitude: 31.3194,
  },
  {
    id: "cairo-daisy",
    name: "Daisy", species: "dog", breed: "Mixed Breed", ageMonths: 22,
    gender: "female", size: "medium", energyLevel: "medium",
    goodWithKids: true, goodWithPets: true,
    description: "Daisy is a gentle, doe-eyed girl from Heliopolis who is as sweet as her name. She walks beautifully on leash, loves car rides, and greets every person as a potential best friend. Absolute family dog.",
    photoUrl: "/dogs/dog-15.jpg",
    shelterName: "Youssef — Heliopolis Resident", shelterEmail: "youssef.heliopolis@gmail.com",
    location: "Heliopolis, Cairo", latitude: 30.0911, longitude: 31.3194,
  },
];

async function main() {
  console.log("Seeding Cairo test user pets...");
  let count = 0;
  for (const pet of cairoPets) {
    await prisma.pet.upsert({
      where: { id: pet.id },
      update: { latitude: pet.latitude, longitude: pet.longitude },
      create: { ...pet },
    });
    count++;
  }
  console.log(`Seeded ${count} Cairo pets from 6 test users.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
