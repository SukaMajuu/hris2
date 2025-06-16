import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './index';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'destructive', 'outline', 'ghost'],
      control: { type: 'radio' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Click me', variant: 'default' },
};

export const Destructive: Story = {
  args: { children: 'Delete', variant: 'destructive' },
};
