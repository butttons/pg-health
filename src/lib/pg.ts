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
  creation_date text,
  start_date text,
  end_date text
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
		return await this.pg.transaction(async (tx) => {
			const response = {
				records: records.length,
				insertedRecords: 0,
				insertedMetadata: 0,
				recordsDiff: 0,
			};
			if (records.length > 0) {
				const result = await tx.query(
					`
					INSERT INTO records (
						id, type, source_name, source_version, device,
						unit, value, creation_date, start_date, end_date
            ) 
            SELECT * FROM UNNEST (
              $1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
              $6::text[], $7::real[], $8::text[], $9::text[], $10::text[]
              )
              ON CONFLICT (id) DO NOTHING
              `,
					[
						records.map((r) => r.id),
						records.map((r) => r.type),
						records.map((r) => r.sourceName),
						records.map((r) => r.sourceVersion),
						records.map((r) => r.device),
						records.map((r) => r.unit),
						records.map((r) => r.value),
						records.map((r) => r.creationDate),
						records.map((r) => r.startDate),
						records.map((r) => r.endDate),
					],
				);
				const insertedRows = Number(result.affectedRows);
				if (insertedRows !== records.length) {
					const diff = records.length - insertedRows;
					response.recordsDiff = diff;
				}
				response.insertedRecords = insertedRows;
			}

			const metadata = records.flatMap(
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
}

export const database = new Database(pg);
