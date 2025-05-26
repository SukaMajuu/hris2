import { useState } from "react";

interface ApprovalItem {
	id: number;
	name: string;
	type: string;
	approved: boolean | null;
	status: string;
}

export function useCheckClockApproval() {
	const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [approvalData, setApprovalData] = useState<ApprovalItem[]>([
		{
			id: 1,
			name: "D'Isiah T. Billings-Clyde",
			type: "WFO",
			approved: null,
			status: "Annual Leave",
		},
		{
			id: 2,
			name: "D'Jasper Probincrux III",
			type: "WFO",
			approved: null,
			status: "Sick Leave",
		},
		{
			id: 3,
			name: "Leoz Maxwell Jilliums",
			type: "WFO",
			approved: null,
			status: "Annual Leave",
		},
		{
			id: 4,
			name: "Javaris Jamar Javarison-Lamar",
			type: "WFO",
			approved: null,
			status: "Annual Leave",
		},
		{
			id: 5,
			name: "Davoin Shower-Handel",
			type: "WFO",
			approved: null,
			status: "Sick Leave",
		},
		{
			id: 6,
			name: "Hingle McCringleberry",
			type: "WFO",
			approved: null,
			status: "Sick Leave",
		},
	]);

	const openApprovalModal = (item: ApprovalItem) => {
		setSelectedItem(item);
		setIsModalOpen(true);
	};

	const handleApprove = () => {
		if (selectedItem) {
			setApprovalData((prev) =>
				prev.map((item) =>
					item.id === selectedItem.id
						? { ...item, approved: true }
						: item
				)
			);
		}
		setIsModalOpen(false);
	};

	const handleReject = () => {
		if (selectedItem) {
			setApprovalData((prev) =>
				prev.map((item) =>
					item.id === selectedItem.id
						? { ...item, approved: false }
						: item
				)
			);
		}
		setIsModalOpen(false);
	};

	return {
		selectedItem,
		isModalOpen,
		setIsModalOpen,
		approvalData,
		openApprovalModal,
		handleApprove,
		handleReject,
	};
}
