import { type HealthRecord, StreamingXMLParser } from "@/lib/xml";

const parser = new StreamingXMLParser();
const decoder = new TextDecoder();

export interface HealthMessage {
	records: HealthRecord[];
	totalCount: number;
	progress: number;
}

self.onmessage = async (e: MessageEvent) => {
	try {
		const text = decoder.decode(e.data.data);
		const parsedNodes = parser.processChunk(text);
		const progress = (e.data.offset / e.data.size) * 100;

		self.postMessage(<HealthMessage>{
			records: parsedNodes,
			progress,
			totalCount: parser.totalCount,
		});
	} catch (error) {
		self.postMessage({ type: "error", error });
	}
};
