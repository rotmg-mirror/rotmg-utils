import { DataController } from "../../../asset/normal/Serializable";

export type StatType = "MAXHP" | "MAXMP" | "ATT" | "DEF" | "SPD" | "DEX" | "VIT" | "WIS";

export const StatNames: any = {
	"MAXHP": "Max HP",
	"MAXMP": "Max MP"
}

export class Stats {
	hp: number = 0;
	mp: number = 0;
	atk: number = 0;
	dex: number = 0;
	spd: number = 0;
	def: number = 0;
	vit: number = 0;
	wis: number = 0;

	// Relative Stats
	statRelativeToMap: RelativeStatMap = {};

	getAttacksPerSecond() {
		return 1.5 + 6.5 * (this.dex / 75);
	}

	getAttackDamage(damage: number) {
		return Math.floor(damage * (0.5 + this.atk / 50));
	}

	getTilesPerSecond() {
		return 4 + 5.6 * (this.spd / 75);
	}

	getHealthPerSecond() {
		return 1 + 0.24 * this.vit;
	}

	getManaPerSecond() {
		return 0.5 + 0.12 * this.wis;
	}

	getInCombatTime() {
		return 7 - 0.05 * this.vit;
	}

	getDamageReqForCombat() {
		let currDef = 0;

		for (let i = 0; i < this.def; i++) {
			if (i <= 15) {
				currDef += 1;
			} else if (i <= 30) {
				currDef += 0.75
			} else if (i <= 45) {
				currDef += 0.5
			} else {
				currDef += 0.25
			}
		}

		return Math.floor(currDef);
	}

	add(stats: Stats, base?: Stats): Stats {
		const newStats = new Stats();
		newStats.hp = this.relativeAddHelper("MAXHP", stats, base);
		newStats.mp = this.relativeAddHelper("MAXMP", stats, base);
		newStats.atk = this.relativeAddHelper("ATT", stats, base);
		newStats.dex = this.relativeAddHelper("DEX", stats, base);
		newStats.spd = this.relativeAddHelper("SPD", stats, base);
		newStats.def = this.relativeAddHelper("DEF", stats, base);
		newStats.vit = this.relativeAddHelper("VIT", stats, base);
		newStats.wis = this.relativeAddHelper("WIS", stats, base);
		return newStats;
	}

	private relativeAddHelper(statType: StatType, stats: Stats, base?: Stats) {
		const statName = Stats.convertStatName(statType)
		const relativeStatName = stats.statRelativeToMap[statType] ? Stats.convertStatName(stats.statRelativeToMap[statType]) : undefined;
		const result = this[statName] + (relativeStatName && base ? Math.round(stats[statName] / 100 * base[relativeStatName]) : stats[statName]);
		return result;
	}

	// Internal function for use with joining relative statmaps.
	_join(stats: Stats) {
		const newStats = this.add(stats)
		newStats.statRelativeToMap = {...stats.statRelativeToMap, ...newStats.statRelativeToMap, ...this.statRelativeToMap}
		return newStats;
	}

	isZero(): boolean {
		return (
			this.hp === 0 && 
			this.mp === 0 &&
			this.atk === 0 && 
			this.def === 0 &&
			this.spd === 0 &&
			this.dex === 0 &&
			this.vit === 0 &&
			this.wis === 0
		)
	}

	map<T>(mapper: (name: string, value: number) => T): T[] {
		return [
			mapper("HP", this.hp),
			mapper("MP", this.mp),
			mapper("ATT", this.atk),
			mapper("DEF", this.def),
			mapper("SPD", this.spd),
			mapper("DEX", this.dex),
			mapper("VIT", this.vit),
			mapper("WIS", this.wis)
		]
	}

	serialize() {
		function mapToObject(statName: string, stat: number) {
			return stat !== 0 ? {
				"@_stat": statName,
				"@_amount": stat,
				"#text": "IncrementStat"
			} : undefined
		}

		return [
			mapToObject("MAXHP", this.hp),
			mapToObject("MAXMP", this.mp),
			mapToObject("ATT", this.atk),
			mapToObject("DEF", this.def),
			mapToObject("SPD", this.spd),
			mapToObject("DEX", this.dex),
			mapToObject("VIT", this.vit),
			mapToObject("WIS", this.wis)
		].filter((a) => a !== undefined)
	}

	static min(statsA: Stats, statsB: Stats): Stats {
		const newStats = new Stats();

		newStats.hp = Math.min(statsA.hp, statsB.hp);
		newStats.mp = Math.min(statsA.mp, statsB.mp);
		newStats.atk = Math.min(statsA.atk, statsB.atk);
		newStats.def = Math.min(statsA.def, statsB.def);
		newStats.spd = Math.min(statsA.spd, statsB.spd);
		newStats.dex = Math.min(statsA.dex, statsB.dex);
		newStats.vit = Math.min(statsA.vit, statsB.vit);
		newStats.wis = Math.min(statsA.wis, statsB.wis);

		return newStats;
	}
	
	static fromXML(xml: any) {
		const stats = new Stats();
		const stat = xml["@_stat"];
		const increment = xml["#text"] === "IncrementStat" || xml["#text"] === "StatBoostAura";
		const amount = xml["@_amount"] * (increment ? 1 : -1);

		const statRelativeTo = xml["@_statRelativeTo"] as StatType | undefined;
		if (statRelativeTo) stats.statRelativeToMap[stat] = statRelativeTo;

		switch(stat) {
			case "MAXHP":
				stats.hp += amount;
				break;
			case "MAXMP":
				stats.mp += amount;
				break;
			case "ATT":
				stats.atk += amount;
				break;
			case "DEF":
				stats.def += amount;
				break;
			case "SPD":
				stats.spd += amount;
				break;
			case "DEX":
				stats.dex += amount;
				break;
			case "VIT":
				stats.vit += amount;
				break;
			case "WIS":
				stats.wis += amount;
				break;
		}
		return stats;
	}

	static convertStatName(stat: StatType) {
		switch(stat) {
			case "MAXHP":
				return "hp";
			case "MAXMP":
				return "mp"
			case "ATT":
				return "atk"
			case "DEF":
				return "def"
			case "SPD":
				return "spd"
			case "DEX":
				return "dex"
			case "VIT":
				return "vit"
			case "WIS":
				return "wis";
		}
	}
}

export type RelativeStatMap = {
	[k in StatType]?: StatType;
};

const StatsData: DataController<Stats> = {
	serialize: (value: Stats) => value.serialize(),
	deserialize: (value: any) => {
		if (value === undefined) return new Stats();
		const values = Array.isArray(value) ? value : [value];
		let stats = new Stats();
		for (const stat of values) {
			stats = stats._join(Stats.fromXML(stat));
		}
		return stats;
	}
}

export { StatsData };