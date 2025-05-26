import { WorkType } from "@/const/work";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function WorkTypeBadge({ workType }: { workType: WorkType }) {
	const getBadgeStyle = (type: WorkType) => {
		switch (type) {
			case "WFO":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "WFA":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "WFH":
				return "bg-green-100 text-green-800 border-green-200";
			case "Hybrid":
				return "bg-yellow-100 text-yellow-800 border-green-200";
			default:
				return "";
		}
	};

	return (
		<div className="flex justify-center">
			<Badge variant="outline" className={cn(getBadgeStyle(workType))}>
				{workType}
			</Badge>
		</div>
	);
}

export default WorkTypeBadge;
