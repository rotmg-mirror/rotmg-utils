import { Data, DataController, XMLArray } from "../../normal/Serializable";
import { Activate, ActivateData } from "./activate/Activate";
import { IncrementStat } from "./activate/IncrementStat";
import { Equipment } from "./Equipment";
import { Stats } from "./Stats";

export class Setpiece {
	@Data("@_slot")
	slot: number = -1;
	@Data("@_itemtype")
	type: number = -1;
}

export class EquipmentSet {
	@Data("@_type")
	type: number = -1;
	@Data("@_id")
	id: string = "";
	@Data("Setpiece", XMLArray(Setpiece))
	setpieces: Setpiece[] = [];
	@Data("ActivateOnEquip2", ActivateData("ActivateOnEquip2"), {isConstructed: true})
	activateOnEquip2: Activate[] = [];
	@Data("ActivateOnEquip3", ActivateData("ActivateOnEquip3"), {isConstructed: true})
	activateOnEquip3: Activate[] = [];
	@Data("ActivateOnEquipAll", ActivateData("ActivateOnEquipAll"), {isConstructed: true})
	activateOnEquipAll: Activate[] = [];

	getStats(equipment: (Equipment | undefined)[]) {
		let equipCount = 0;
		for (let equip of equipment) {
			if (this.setpieces.findIndex(piece => piece.type === equip.type) !== -1) {
				equipCount++;
			}
		}

		let stats = new Stats();

		if (equipCount > 1) {
			stats = stats.add(this.statsFromActivates(this.activateOnEquip2));
		}

		if (equipCount > 2) {
			stats = stats.add(this.statsFromActivates(this.activateOnEquip3));
		}

		if (equipCount > 3) {
			stats = stats.add(this.statsFromActivates(this.activateOnEquipAll));
		}

		return stats;
	}

	private statsFromActivates(activates: Activate[]) {
		let stats = new Stats();

		for (const activate of activates) {
			if (activate instanceof IncrementStat) {
				stats = stats.add(activate.stats);
			}
		}
		
		return stats;
	}
}