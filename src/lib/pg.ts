import type { PGliteWorker } from "@electric-sql/pglite/worker";

import type { HealthRecord } from "@/lib/xml";
import { pg } from "@/workers/pglite.worker-instance";

export class Database {
	constructor(public pg: PGliteWorker) {
		this.pg = pg;
	}

	async init() {
		await this.pg.exec(`
CREATE TABLE IF NOT EXISTS records(
  id text PRIMARY KEY,
  type TEXT NOT NULL,
  source_name text,
  source_version text,
  device text,
  unit text,
  value real NOT NULL,
  creation_date timestamp,
  start_date timestamp,
  end_date timestamp
);

CREATE TABLE IF NOT EXISTS record_metadata(
  record_id text REFERENCES records(id),
  key TEXT NOT NULL,
  value text NOT NULL,
  PRIMARY KEY (record_id, key)
);

  CREATE INDEX idx_records_type ON records(type);
 CREATE INDEX idx_records_dates ON records(start_date, end_date);
 CREATE INDEX idx_metadata_key ON record_metadata(key); 
    `);
	}

	async batchInsertRecords(records: HealthRecord[]) {
		// Ensure all records are valid and filter out any invalid entries
		const validRecords = records.filter(
			(r) => r.id && r.type && r.value !== undefined,
		);

		// Check if there are valid records to process
		if (validRecords.length === 0) {
			return {
				records: 0,
				insertedRecords: 0,
				insertedMetadata: 0,
				recordsDiff: 0,
			};
		}

		return await this.pg.transaction(async (tx) => {
			const response = {
				records: validRecords.length,
				insertedRecords: 0,
				insertedMetadata: 0,
				recordsDiff: 0,
			};

			const ids = validRecords.map((r) => r.id);
			const types = validRecords.map((r) => r.type);
			const sourceNames = validRecords.map((r) => r.sourceName);
			const sourceVersions = validRecords.map((r) => r.sourceVersion);
			const devices = validRecords.map((r) => r.device);
			const units = validRecords.map((r) => r.unit);
			const values = validRecords.map((r) => r.value);
			const creationDates = validRecords.map((r) =>
				new Date(r.creationDate).toISOString(),
			);
			const startDates = validRecords.map((r) =>
				new Date(r.startDate).toISOString(),
			);
			const endDates = validRecords.map((r) =>
				new Date(r.endDate).toISOString(),
			);

			// Ensure all arrays have the same length
			if (
				new Set([
					ids.length,
					types.length,
					sourceNames.length,
					sourceVersions.length,
					devices.length,
					units.length,
					values.length,
					creationDates.length,
					startDates.length,
					endDates.length,
				]).size !== 1
			) {
				throw new RangeError("Array lengths do not match.");
			}

			const result = await tx.query(
				`
				INSERT INTO records (
					id, type, source_name, source_version, device,
					unit, value, creation_date, start_date, end_date
				) 
				SELECT * FROM UNNEST (
					$1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
					$6::text[], $7::real[], $8::timestamp[], $9::timestamp[], $10::timestamp[]
				)
				ON CONFLICT (id) DO NOTHING`,
				[
					ids,
					types,
					sourceNames,
					sourceVersions,
					devices,
					units,
					values,
					creationDates,
					startDates,
					endDates,
				],
			);

			const insertedRows = Number(result.affectedRows);
			if (insertedRows !== validRecords.length) {
				const diff = validRecords.length - insertedRows;
				response.recordsDiff = diff;
			}
			response.insertedRecords = insertedRows;

			const metadata = validRecords.flatMap(
				(r) => r.metadata?.map((m) => ({ record_id: r.id, ...m })) ?? [],
			);

			if (metadata.length > 0) {
				const result = await tx.query(
					`
					INSERT INTO record_metadata (record_id, key, value)
					SELECT * FROM UNNEST ($1::text[], $2::text[], $3::text[])
					ON CONFLICT (record_id, key) DO NOTHING
				`,
					[
						metadata.map((m) => m.record_id),
						metadata.map((m) => m.key),
						metadata.map((m) => m.value),
					],
				);
				response.insertedMetadata = Number(result.affectedRows);
			}

			return response;
		});
	}

	async copyInsertRecords(records: HealthRecord[]) {
		const validRecords = records.filter(
			(r) => r.id && r.type && r.value !== undefined,
		);

		if (validRecords.length === 0) {
			return {
				records: 0,
				insertedRecords: 0,
				insertedMetadata: 0,
				recordsDiff: 0,
			};
		}

		// Prepare CSV data for COPY command
		const csvData = validRecords
			.map((r) => {
				return `${r.id},${r.type},${r.sourceName || ""},${r.sourceVersion || ""},${r.device || ""},${r.unit || ""},${r.value},${new Date(r.creationDate).toISOString()},${new Date(r.startDate).toISOString()},${new Date(r.endDate).toISOString()}`;
			})
			.join("\n");

		// Execute the COPY command
		const result = await this.pg.query(
			`
			COPY records (id, type, source_name, source_version, device, unit, value, creation_date, start_date, end_date)
			FROM STDIN WITH CSV $1
		`,
			[csvData],
		);

		return {
			records: validRecords.length,
			insertedRecords: Number(result.affectedRows), // Adjust based on your database's response
			insertedMetadata: 0, // Handle metadata if needed
			recordsDiff: 0, // Calculate if necessary
		};
	}
}

export const database = new Database(pg);
