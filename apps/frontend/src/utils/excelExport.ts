export function exportToExcel<T extends Record<string, unknown>>(
	data: T[],
	filename: string,
	columns?: Array<{
		key: keyof T;
		header: string;
		transform?: (value: unknown) => string;
	}>
) {
	if (!data || data.length === 0) {
		return;
	}

	import("xlsx")
		.then((XLSX) => {
			let worksheetData: unknown[][] = [];

			if (columns) {
				const headers = columns.map((col) => col.header);
				worksheetData.push(headers);

				data.forEach((row) => {
					const values = columns.map((col) => {
						const value = row[col.key];
						const transformedValue = col.transform
							? col.transform(value)
							: value;
						return transformedValue || "";
					});
					worksheetData.push(values);
				});
			} else {
				const firstRow = data[0];
				if (!firstRow) {
					return;
				}

				const headers = Object.keys(firstRow);
				worksheetData.push(headers);

				data.forEach((row) => {
					const values = Object.values(row).map(
						(value) => value || ""
					);
					worksheetData.push(values);
				});
			}

			const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

			if (worksheetData.length > 0 && worksheetData[0]) {
				const colWidths = worksheetData[0].map((_, colIndex) => {
					const columnValues = worksheetData.map((row) =>
						String(row[colIndex] || "")
					);
					const maxLength = Math.max(
						...columnValues.map((val) => val.length)
					);
					return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
				});
				worksheet["!cols"] = colWidths;
			}

			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

			XLSX.writeFile(workbook, filename);
		})
		.catch((error) => {
			console.error("Failed to load xlsx library:", error);
			alert(
				"Excel export failed. Please make sure the xlsx library is installed."
			);
		});
}
