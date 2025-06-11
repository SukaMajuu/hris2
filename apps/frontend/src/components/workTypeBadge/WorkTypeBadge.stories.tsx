import type { Meta, StoryObj } from "@storybook/react";
import WorkTypeBadge from "./index";
import { WORK_TYPES } from "@/const/work";

const meta: Meta<typeof WorkTypeBadge> = {
	title: "Components/WorkTypeBadge",
	component: WorkTypeBadge,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		workType: {
			control: "select",
			options: Object.values(WORK_TYPES),
			description: "The type of work arrangement",
		},
	},
};

export default meta;
type Story = StoryObj<typeof WorkTypeBadge>;

// Story for WFO (Work From Office)
export const WFO: Story = {
	args: {
		workType: WORK_TYPES.WFO,
	},
};

// Story for WFA (Work From Anywhere)
export const WFA: Story = {
	args: {
		workType: WORK_TYPES.WFA,
	},
};

//story for Hybrid
export const Hybrid: Story = {
	args: {
		workType: WORK_TYPES.Hybrid,
	},
};

// Story showing all badge types together
export const AllTypes: Story = {
	render: () => (
		<div className="flex gap-4">
			<WorkTypeBadge workType={WORK_TYPES.WFO} />
			<WorkTypeBadge workType={WORK_TYPES.WFA} />
			<WorkTypeBadge workType={WORK_TYPES.Hybrid} />
		</div>
	),
};
