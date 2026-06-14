import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const DEFAULT_SCHEDULE = {
  mon:{on:true,from:"08:00",to:"20:00"},
  tue:{on:true,from:"08:00",to:"20:00"},
  wed:{on:true,from:"08:00",to:"20:00"},
  thu:{on:true,from:"08:00",to:"20:00"},
  fri:{on:false,from:"08:00",to:"20:00"},
  sat:{on:true,from:"10:00",to:"16:00"},
  sun:{on:false,from:"08:00",to:"20:00"},
  overrides:{},
};

const keys: { id: string; merchantKey: string; schedule: typeof DEFAULT_SCHEDULE }[] = [
  { id:"sp-omar-maadi",       merchantKey:"omar-mk7x",    schedule:{...DEFAULT_SCHEDULE,fri:{on:true,from:"08:00",to:"18:00"}} },
  { id:"sp-laila-maadi",      merchantKey:"laila-9p2q",   schedule:{...DEFAULT_SCHEDULE} },
  { id:"sp-dr-nour-zamalek",  merchantKey:"nour-vet3k",   schedule:{...DEFAULT_SCHEDULE,fri:{on:false,from:"09:00",to:"13:00"},sat:{on:false,from:"09:00",to:"13:00"}} },
  { id:"sp-pawfect-newcairo", merchantKey:"pawfect8nc",   schedule:{...DEFAULT_SCHEDULE,fri:{on:true,from:"10:00",to:"18:00"},sun:{on:true,from:"11:00",to:"17:00"}} },
  { id:"sp-cairo-pet-hotel",  merchantKey:"resort5w2m",   schedule:{...DEFAULT_SCHEDULE,fri:{on:true,from:"08:00",to:"20:00"},sun:{on:true,from:"08:00",to:"20:00"}} },
  { id:"sp-swift-taxi",       merchantKey:"swift4xjp",    schedule:{...DEFAULT_SCHEDULE,fri:{on:true,from:"06:00",to:"23:00"},sun:{on:true,from:"06:00",to:"23:00"}} },
  { id:"sp-dr-sara-emergency",merchantKey:"sara-emg7r",   schedule:{mon:{on:true,from:"00:00",to:"23:59"},tue:{on:true,from:"00:00",to:"23:59"},wed:{on:true,from:"00:00",to:"23:59"},thu:{on:true,from:"00:00",to:"23:59"},fri:{on:true,from:"00:00",to:"23:59"},sat:{on:true,from:"00:00",to:"23:59"},sun:{on:true,from:"00:00",to:"23:59"},overrides:{}} },
  { id:"sp-green-paws-mohan", merchantKey:"green-mn4k",   schedule:{...DEFAULT_SCHEDULE,sat:{on:true,from:"09:00",to:"17:00"},sun:{on:true,from:"11:00",to:"16:00"}} },
  { id:"sp-hana-heliopolis",  merchantKey:"hana-hel2s",   schedule:{...DEFAULT_SCHEDULE} },
  { id:"sp-paws-october",     merchantKey:"paws-oct8f",   schedule:{...DEFAULT_SCHEDULE,fri:{on:true,from:"09:00",to:"18:00"},sun:{on:true,from:"10:00",to:"17:00"}} },
  { id:"sp-dr-walid-dokki",   merchantKey:"walid-dk5n",   schedule:{...DEFAULT_SCHEDULE,fri:{on:false,from:"09:00",to:"17:00"},sat:{on:false,from:"09:00",to:"14:00"}} },
  { id:"sp-mike-compound",    merchantKey:"mike-cmpd3",   schedule:{...DEFAULT_SCHEDULE,fri:{on:true,from:"06:00",to:"10:00"}} },
];

async function main() {
  for (const k of keys) {
    await p.serviceProvider.update({
      where: { id: k.id },
      data: { merchantKey: k.merchantKey, schedule: k.schedule },
    });
    console.log(`✓ ${k.id} → /merchant/${k.merchantKey}`);
  }
  console.log(`\n🔑 All ${keys.length} merchant keys assigned`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
