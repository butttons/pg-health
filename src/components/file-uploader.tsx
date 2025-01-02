import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TypographyInlineCode } from "@/components/ui/typograpghy";
import { createRef, useEffect, useReducer, useState } from "react";
import Dropzone, { type DropzoneRef } from "react-dropzone";

import { importWorker } from "@/workers/import.worker-instance";

import { database } from "@/lib/pg";
import type { HealthRecord } from "@/lib/xml";

type ImportState = {
	importProgress: number;
	parseProgress: number;
	ingestProgress: number;
	totalCount: number;
};

type ImportAction =
	| {
			type: "import-progress";
			progress: number;
	  }
	| {
			type: "import-parse";
			progress: number;
	  }
	| {
			type: "import-ingest";
			progress: number;
			count: number;
	  };

const importReducer = (state: ImportState, action: ImportAction) => {
	switch (action.type) {
		case "import-progress":
			return { ...state, importProgress: action.progress };
		case "import-parse":
			return {
				...state,
				parseProgress: Number.isNaN(action.progress) ? 100 : action.progress,
			};
		case "import-ingest":
			return {
				...state,
				ingestProgress: Number.isNaN(action.progress) ? 100 : action.progress,
				totalCount: action.count + state.totalCount,
			};
	}
};
const dropzoneRef = createRef<DropzoneRef>();

const bytesToMb = (number: number) => {
	return (number / (1000 * 1000)).toFixed(2);
};

const formatProgress = (number: number) => number.toFixed(2);

export function FileUploader() {
	const [file, setFile] = useState<File | null>(null);

	const [importState, dispatch] = useReducer(importReducer, {
		importProgress: 0,
		parseProgress: 0,
		ingestProgress: 0,
		totalCount: 0,
	});

	useEffect(() => {
		importWorker.onmessage = (
			event: MessageEvent<{ records: HealthRecord[]; progress: number }>,
		) => {
			dispatch({
				type: "import-parse",
				progress: event.data.progress,
			});

			database
				.batchInsertRecords(event.data.records)
				.then((response) => {
					dispatch({
						type: "import-ingest",
						progress: event.data.progress,
						count: response?.insertedRecords ?? 0,
					});
				})
				.catch((error) => {
					console.error("insert-records:", error);
				});
		};

		return () => {
			importWorker.onmessage = null;
		};
	}, []);

	// const handleUploadSubmission = async () => {
	// 	if (!file) return;

	// 	await database.init().catch((error) => {
	// 		console.error(error);
	// 	});

	// 	const CHUNK_SIZE = 1024 * 1024;
	// 	let offset = 0;

	// 	function processChunk(file: File) {
	// 		if (offset >= file.size) {
	// 			importWorker.postMessage({ type: "complete" });
	// 			dispatch({ type: "import-progress", progress: 100 });
	// 			return;
	// 		}

	// 		const blob = file.slice(offset, offset + CHUNK_SIZE);
	// 		const reader = new FileReader();

	// 		reader.onload = (event) => {
	// 			const importProgress = (offset / file.size) * 100;

	// 			importWorker.postMessage({
	// 				type: "progress",
	// 				data: event.target?.result,
	// 				offset,
	// 				size: file.size,
	// 			});

	// 			offset += CHUNK_SIZE;
	// 			dispatch({ type: "import-progress", progress: importProgress });
	// 			processChunk(file);
	// 		};

	// 		reader.readAsArrayBuffer(blob);
	// 	}

	// 	importWorker.postMessage({
	// 		type: "init",
	// 		size: file.size,
	// 	});

	// 	processChunk(file);
	// };

	const handleUploadSubmission = async () => {
		if (!file) return;

		await database.init().catch((error) => {
			console.error("database-init:", error);
		});

		const CHUNK_SIZE = 1024 * 1024;
		const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

		for (let i = 0; i < totalChunks; i++) {
			const offset = i * CHUNK_SIZE;
			const blob = file.slice(offset, offset + CHUNK_SIZE);

			const importProgress = ((i + 1) / totalChunks) * 100;

			importWorker.postMessage({
				type: "progress",
				data: await blob.arrayBuffer(),
				offset,
				size: file.size,
			});

			dispatch({ type: "import-progress", progress: importProgress });

			if (i === totalChunks - 1) {
				importWorker.postMessage({ type: "complete" });
			}
		}
	};

	const handleUpload = (files: File[]) => {
		setFile(files[0]);
	};
	const handleReset = () => {
		setFile(null);
	};

	return (
		<>
			<Dropzone ref={dropzoneRef} onDrop={handleUpload}>
				{({ getRootProps, getInputProps }) => (
					<div
						{...getRootProps()}
						className="flex justify-center items-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary"
					>
						<input {...getInputProps()} />
						{file ? (
							<aside>
								<TypographyInlineCode>{file.name}</TypographyInlineCode>(
								{bytesToMb(file.size)} mb)
							</aside>
						) : (
							<p>
								Drag &amp; drop the{" "}
								<TypographyInlineCode>export.xml</TypographyInlineCode> file.
							</p>
						)}
					</div>
				)}
			</Dropzone>
			<div className="flex flex-col gap-4 mt-4 md:items-center md:flex-row">
				<Button
					size="lg"
					disabled={!file || importState.importProgress > 0}
					onClick={handleUploadSubmission}
				>
					Import file
				</Button>
				<Button
					variant="outline"
					size="lg"
					disabled={!file}
					onClick={handleReset}
				>
					Reset
				</Button>
				<span className="px-2 py-1 text-sm rounded-md bg-secondary text-primary">
					Total records added - {importState.totalCount.toLocaleString()}
				</span>
			</div>
			<div className="flex flex-col gap-2 mt-4">
				<div className="flex flex-1 gap-2 items-center">
					<div className="text-nowrap">
						Importing data:{" "}
						<TypographyInlineCode>
							{formatProgress(importState.importProgress)}%
						</TypographyInlineCode>
					</div>
					<Progress value={importState.importProgress} max={100} />
				</div>
				<div className="flex flex-1 gap-2 items-center">
					<div className="text-nowrap">
						Parsing data:{" "}
						<TypographyInlineCode>
							{formatProgress(importState.parseProgress)}%
						</TypographyInlineCode>
					</div>
					<Progress value={importState.parseProgress} max={100} />
				</div>
				<div className="flex flex-1 gap-2 items-center">
					<div className="text-nowrap">
						Ingesting data:{" "}
						<TypographyInlineCode>
							{formatProgress(importState.ingestProgress)}%
						</TypographyInlineCode>
					</div>
					<Progress value={importState.ingestProgress} max={100} />
				</div>
				<div className="text-sm text-stone-500">
					Refresh the page once all progress bars are complete.
				</div>
			</div>
		</>
	);
}
