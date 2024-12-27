interface HealthMetadataEntry {
	key: string;
	value: string;
}

export interface HealthRecord {
	id: string;
	type: string;
	sourceName: string;
	sourceVersion: string;
	device?: string;
	unit: string;
	value: number;
	creationDate: string;
	startDate: string;
	endDate: string;
	metadata?: HealthMetadataEntry[];
}

export class StreamingXMLParser {
	private buffer = "";
	private currentRecord: Partial<HealthRecord> | null = null;
	private currentMetadata: HealthMetadataEntry[] = [];
	private isInRecord = false;
	public totalCount = 0;

	processChunk(chunk: string): HealthRecord[] {
		const records: HealthRecord[] = [];

		const text = this.buffer + chunk;
		const lines = text.split("\n");

		this.buffer = lines.pop() || "";

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			if (trimmed.startsWith("<Record ")) {
				this.isInRecord = true;
				this.currentRecord = this.parseRecordAttributes(trimmed);

				if (trimmed.endsWith("/>")) {
					if (this.currentRecord) {
						records.push(this.currentRecord as HealthRecord);

						this.totalCount++;
					}
					this.resetState();
				}
			} else if (trimmed.startsWith("</Record>")) {
				if (this.currentRecord) {
					if (this.currentMetadata.length > 0) {
						this.currentRecord.metadata = this.currentMetadata;
					}
					records.push(this.currentRecord as HealthRecord);
					this.totalCount++;
				}
				this.resetState();
			} else if (trimmed.startsWith("<MetadataEntry ")) {
				if (this.isInRecord) {
					this.currentMetadata.push(this.parseMetadataAttributes(trimmed));
				}
			}
		}

		return records;
	}

	private parseRecordAttributes(line: string): Partial<HealthRecord> | null {
		const attrs = this.extractAttributes(line);

		return {
			id: this.generateRecordId(attrs),
			type: attrs.type,
			sourceName: attrs.sourceName,
			sourceVersion: attrs.sourceVersion,
			device:
				"device" in attrs ? this.sanitizeHTMLEntities(attrs.device) : undefined,
			unit: attrs.unit,
			value: Number(attrs.value),
			creationDate: this.sanitizeDate(attrs.creationDate),
			startDate: this.sanitizeDate(attrs.startDate),
			endDate: this.sanitizeDate(attrs.endDate),
		};
	}

	private parseMetadataAttributes(line: string): HealthMetadataEntry {
		const attrs = this.extractAttributes(line);
		return {
			key: attrs.key,
			value: attrs.value,
		};
	}

	private sanitizeHTMLEntities(htmlString: string) {
		const entities = {
			"&lt;": "<",
			"&gt;": ">",
			"&amp;": "&",
			"&quot;": '"',
			"&#39;": "'",
		};

		return htmlString.replace(
			/&lt;|&gt;|&amp;|&quot;|&#39;/g,
			// @ts-expect-error the regex should only match the given characters
			(match) => entities?.[match],
		);
	}

	private extractAttributes(tag: string): Record<string, string> {
		const attrs: Record<string, string> = {};

		const matches = tag.matchAll(/(\w+)="([^"]+)"/g);

		for (const match of matches) {
			attrs[match[1]] = match[2];
		}

		return attrs;
	}

	private resetState() {
		this.currentRecord = null;
		this.currentMetadata = [];
		this.isInRecord = false;
	}

	private sanitizeDate(dateString: string) {
		return dateString.replace(/\s{1}(\+\d{2})(\d{2})$/, "$1:$2");
	}

	private generateRecordId(attributes: Record<string, string>): string {
		const uniqueString = JSON.stringify(attributes);

		let hash = 0;
		for (let i = 0; i < uniqueString.length; i++) {
			const char = uniqueString.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}

		const timestamp = new Date(
			this.sanitizeDate(attributes.creationDate),
		).getTime();
		return `${Math.abs(hash).toString(16)}-${timestamp.toString(16)}`;
	}
}
