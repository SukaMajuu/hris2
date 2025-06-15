export function exportToCSV<T extends Record<string, unknown>>(
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

	let csvContent = "";

	if (columns) {
		const headers = columns.map((col) => col.header).join(",");
		csvContent = headers + "\n";

		data.forEach((row) => {
			const values = columns.map((col) => {
				const value = row[col.key];
				const transformedValue = col.transform
					? col.transform(value)
					: value;
				const stringValue = String(transformedValue || "");
				if (
					stringValue.includes(",") ||
					stringValue.includes('"') ||
					stringValue.includes("\n")
				) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			});
			csvContent += values.join(",") + "\n";
		});
	} else {
		const firstRow = data[0];
		if (!firstRow) {
			return;
		}

		const headers = Object.keys(firstRow).join(",");
		csvContent = headers + "\n";

		data.forEach((row) => {
			const values = Object.values(row).map((value) => {
				const stringValue = String(value || "");
				if (
					stringValue.includes(",") ||
					stringValue.includes('"') ||
					stringValue.includes("\n")
				) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			});
			csvContent += values.join(",") + "\n";
		});
	}

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");

	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}
