import type { Meta, StoryObj } from "@storybook/react";


import {Spinner} from "./Spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className:"",
  },
};


// Showcase all sizes
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2 items-start">
      <Spinner {...args} className="text-xs" />
      <Spinner {...args} className="text-sm" />
      <Spinner {...args} className="text-base" />
      <Spinner {...args} className="text-lg" />
      <Spinner {...args} className="text-xl" />
      <Spinner {...args} className="text-2xl" />
      <Spinner {...args} className="text-3xl" />
      <Spinner {...args} className="text-4xl" />

    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available spinner sizes.",
      },
    },
  },
};


// Showcase all sizes
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2 items-start">
      <Spinner {...args} className="text-primary" />
      <Spinner {...args} className="text-destructive" />
      <Spinner {...args} className="text-foreground" />
      <Spinner {...args} className="text-success" />
      <Spinner {...args} className="text-warning" />
      <Spinner {...args} className="text-info" />
      <Spinner {...args} className="text-error" />


    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates colors for spinner.",
      },
    },
  },
};
