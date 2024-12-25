import { useLiveQuery } from "@electric-sql/pglite-react";
import React, { useCallback } from "react";
import type { DateRange } from "react-day-picker";

type ChartData = {
	date: string;
	timestamp: string;
	value: number;
	unit: string;
};

type DataSeries = {
	id: string;
	type: string;
	aggregationMethod:
		| "SUM"
		| "AVG"
		| "MIN"
		| "MAX"
		| "COUNT"
		| "STDDEV"
		| "MEDIAN"
		| "MODE"
		| "VARIANCE";
};

export function buildHealthDataQuery(
	type: string,
	aggregationMethod:
		| "SUM"
		| "AVG"
		| "MIN"
		| "MAX"
		| "COUNT"
		| "STDDEV"
		| "MEDIAN"
		| "MODE"
		| "VARIANCE",
	dateUnit: "day" | "month" | "quarter" | "year",
	dateRange?: DateRange,
): string {
	let dateExpression: string;
	let dateFilter = "";

	if (dateRange?.from) {
		dateFilter += ` AND creation_date >= '${dateRange.from.toISOString()}'`;
	}
	if (dateRange?.to) {
		dateFilter += ` AND creation_date <= '${dateRange.to.toISOString()}'`;
	}

	if (dateUnit === "day") {
		dateExpression = "SUBSTR(creation_date, 1, 10)";
	} else if (dateUnit === "month") {
		dateExpression = "SUBSTR(creation_date, 1, 7)";
	} else if (dateUnit === "quarter") {
		dateExpression = `
      SUBSTR(creation_date, 1, 4) || '-Q' || 
      CASE 
        WHEN CAST(SUBSTR(creation_date, 6, 2) AS INTEGER) BETWEEN 1 AND 3 THEN '1'
        WHEN CAST(SUBSTR(creation_date, 6, 2) AS INTEGER) BETWEEN 4 AND 6 THEN '2'
        WHEN CAST(SUBSTR(creation_date, 6, 2) AS INTEGER) BETWEEN 7 AND 9 THEN '3'
        ELSE '4'
      END`;
	} else if (dateUnit === "year") {
		dateExpression = "SUBSTR(creation_date, 1, 4)";
	} else {
		throw new Error("Unsupported date unit");
	}

	const query = `
    SELECT
      ${dateExpression} as date,
      MIN(creation_date) as timestamp,
      ${aggregationMethod}(value) as value,
      MIN(unit) as unit
    FROM records
    WHERE type = '${type}'${dateFilter}
    GROUP BY ${dateExpression}
    ORDER BY date;
  `;

	return query.trim();
}

export function HealthDataQuery({
	series,
	dateUnit,
	dateRange,
	customQuery,
	onData,
}: {
	series: DataSeries;
	dateUnit?: "day" | "month" | "quarter" | "year";
	dateRange?: DateRange;
	customQuery?: string;
	onData: (data: ChartData[]) => void;
}) {
	const query = React.useMemo(
		() =>
			customQuery ??
			buildHealthDataQuery(
				series.type,
				series.aggregationMethod,
				dateUnit ?? "day",
				dateRange,
			),
		[series.type, series.aggregationMethod, dateUnit, dateRange, customQuery],
	);

	const result = useLiveQuery<ChartData>(query);

	const stableOnData = useCallback(onData, []);

	React.useEffect(() => {
		if (result?.rows) {
			stableOnData(result.rows);
		}
	}, [result?.rows, stableOnData]);

	return null;
}
