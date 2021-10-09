import { familiarWeight, haveEffect, myFamiliar, weightAdjustment } from "kolmafia";
import { $effect, $familiar, $familiars, $item, $items, get, have } from "libram";
import { argmax, saleValue } from "./lib";

const MPA = get("valueOfAdventure");

export function fairyFamiliar(): Familiar {
  return (
    $familiars`Mechanical Songbird, Reagnimated Gnome, Jumpsuited Hound Dog`.find((familiar) =>
      have(familiar)
    ) ?? $familiar`Baby Gravy Fairy`
  );
}

function myFamiliarWeight(familiar: Familiar | null = null) {
  if (familiar === null) familiar = myFamiliar();
  return familiarWeight(familiar) + weightAdjustment();
}

// 5, 10, 15, 20, 25 +5/turn: 5.29, 4.52, 3.91, 3.42, 3.03
const rotatingFamiliars: { [index: string]: { expected: number[]; drop: Item; pref: string } } = {
  "Fist Turkey": {
    expected: [3.91, 4.52, 4.52, 5.29, 5.29],
    drop: $item`Ambitious Turkey`,
    pref: "_turkeyBooze",
  },
  "Llama Lama": {
    expected: [3.42, 3.91, 4.52, 5.29, 5.29],
    drop: $item`llama lama gong`,
    pref: "_gongDrops",
  },
  "Astral Badger": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`astral mushroom`,
    pref: "_astralDrops",
  },
  "Li'l Xenomorph": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`transporter transponder`,
    pref: "_transponderDrops",
  },
  "Rogue Program": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`Game Grid token`,
    pref: "_tokenDrops",
  },
  "Bloovian Groose": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`groose grease`,
    pref: "_grooseDrops",
  },
  "Baby Sandworm": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`agua de vida`,
    pref: "_aguaDrops",
  },
  "Green Pixie": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`tiny bottle of absinthe`,
    pref: "_absintheDrops",
  },
  "Blavious Kloop": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`devilish folio`,
    pref: "_kloopDrops",
  },
  "Galloping Grill": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`hot ashes`,
    pref: "_hotAshesDrops",
  },
  "Grim Brother": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`grim fairy tale`,
    pref: "_grimFairyTaleDrops",
  },
  "Golden Monkey": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`powdered gold`,
    pref: "_powderedGoldDrops",
  },
  "Unconscious Collective": {
    expected: [3.03, 3.42, 3.91, 4.52, 5.29],
    drop: $item`Unconscious Collective Dream Jar`,
    pref: "_dreamJarDrops",
  },
  "Ms. Puck Man": {
    expected: Array($familiar`Ms. Puck Man`.dropsLimit).fill(12.85),
    drop: $item`power pill`,
    pref: "_powerPillDrops",
  },
  "Puck Man": {
    expected: Array($familiar`Puck Man`.dropsLimit).fill(12.85),
    drop: $item`power pill`,
    pref: "_powerPillDrops",
  },
  "Adventurous Spelunker": {
    expected: [7.0],
    drop: $item`Tales of Spelunking`,
    pref: "_spelunkingTalesDrops",
  },
  "Angry Jung Man": {
    expected: [30.0],
    drop: $item`psychoanalytic jar`,
    pref: "_jungDrops",
  },
  "Grimstone Golem": {
    expected: [45.0],
    drop: $item`grimstone mask`,
    pref: "_grimstoneMaskDrops",
  },
};

let savedMimicDropValue: number | null = null;
function mimicDropValue() {
  return (
    savedMimicDropValue ??
    (savedMimicDropValue =
      saleValue(...$items`Polka Pop, BitterSweetTarts, Piddles`) / (6.29 * 0.95 + 1 * 0.05))
  );
}

export function freeFightFamiliar(): Familiar {
  const familiarValue: [Familiar, number][] = [];

  if (
    have($familiar`Pocket Professor`) &&
    $familiar`Pocket Professor`.experience < 400 &&
    !get("_thesisDelivered")
  ) {
    // Estimate based on value to charge thesis.
    familiarValue.push([$familiar`Pocket Professor`, 3000]);
  }

  for (const familiarName of Object.keys(rotatingFamiliars)) {
    const familiar: Familiar = Familiar.get(familiarName);
    if (have(familiar)) {
      const { expected, drop, pref } = rotatingFamiliars[familiarName];
      const dropsAlready = get<number>(pref);
      if (dropsAlready >= expected.length) continue;
      const value = saleValue(drop) / expected[dropsAlready];
      familiarValue.push([familiar, value]);
    }
  }

  if (have($familiar`Stocking Mimic`)) {
    const mimicWeight = myFamiliarWeight($familiar`Stocking Mimic`);
    const actionPercentage = 1 / 3 + (haveEffect($effect`Jingle Jangle Jingle`) ? 0.1 : 0);
    const mimicValue = mimicDropValue() + ((mimicWeight * actionPercentage * 1) / 4) * 10 * 4 * 1.2;
    familiarValue.push([$familiar`Stocking Mimic`, mimicValue]);
  }

  if (have($familiar`Robortender`)) familiarValue.push([$familiar`Robortender`, 200]);

  if (have($familiar`Cat Burglar`)) {
    const heistsCharged = Math.floor(Math.log2(1 + get("_catBurglarCharge") / 10));
    const nextHeistTurns = 10 * 2 ** heistsCharged;
    familiarValue.push([$familiar`Cat Burglar`, MPA / nextHeistTurns]);
  }

  if (have($familiar`Reagnimated Gnome`)) {
    familiarValue.push([
      $familiar`Reagnimated Gnome`,
      MPA / (1 - myFamiliarWeight($familiar`Reagnimated Gnome`) * 0.001),
    ]);
  }

  for (const familiar of $familiars`Hobo Monkey, Urchin Urchin, Leprechaun`) {
    if (have(familiar)) familiarValue.push([familiar, 1]);
  }

  familiarValue.push([$familiar`none`, 0]);

  return argmax(familiarValue);
}
