import { FileAPI } from "../main/preload";

declare global {
	interface Window {
		ipc: FileAPI;
		era: Era;
		data: Era.data;
	}
}
