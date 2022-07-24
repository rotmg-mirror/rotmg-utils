import { Data } from "../../../../asset/normal/Serializable";
import { Activate } from "./Activate";
import { XMLActivate } from "./ActivateParser";

@XMLActivate()
export class SpawnCreep implements Activate {
    @Data("@_objectId")
	objectId: string = "";
	@Data("@_maxSpawnDistance")
	maxSpawnDistance: number = 0;

	getName(): string {
		return "SpawnCreep";
	}
}