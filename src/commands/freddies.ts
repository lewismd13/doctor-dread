import { handlingChoice, myClass, print, runChoice, visitUrl } from "kolmafia";

import { Command } from "../command";
import { dreadKilled, dreadNoncombatsUsed, dreadZones } from "../dungeon/raidlog";
import { propertyManager, withWineglass } from "../lib";
import { $item } from "libram";

export default new Command(
  "freddies",
  "dr freddies: Collect freddies from any available noncombats.",
  () => {
    withWineglass(() => {
      const used = dreadNoncombatsUsed();
      for (const zone of dreadZones) {
        const [, killed] = dreadKilled().find(([killedZone]) => killedZone === zone) ?? [zone, 0];
        if (killed >= 1000) continue;
        for (const noncombat of zone.noncombats) {
          if (used.includes(noncombat.name)) continue;

          for (const [subIndex, subnoncombat] of noncombat.choices) {
            if (subnoncombat.isLocked()) continue;
            if (subnoncombat.classes && !subnoncombat.classes.includes(myClass())) continue;

            for (const [choiceIndex, choice] of subnoncombat.choices) {
              if (choice.item !== $item`Freddy Kruegerand`) continue;
              if (choice.maximum && choice.count() >= choice.maximum) continue;
              if (choice.classes && !choice.classes.includes(myClass())) continue;

              propertyManager.setChoices({
                [noncombat.id]: subIndex,
                [subnoncombat.id]: choiceIndex,
              });
              visitUrl(`clan_dreadsylvania.php?action=forceloc&loc=${noncombat.index}`);
              runChoice(-1);
              if (handlingChoice()) throw "Stuck in choice adventure!";
              print();
            }
          }
        }
      }
    });
  }
);
