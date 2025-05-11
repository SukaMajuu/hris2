import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
	label: string;
	value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
	return (
		<Card className="border border-gray-100 dark:border-gray-800">
			<CardHeader className="pb-2">
				<div className="text-sm text-gray-500">{label}</div>
			</CardHeader>
			<CardContent>
				<CardTitle className="text-xl font-bold">{value}</CardTitle>
			</CardContent>
		</Card>
	);
}
