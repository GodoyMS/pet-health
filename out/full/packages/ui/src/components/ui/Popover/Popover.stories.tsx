import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./Popover";
import { useState } from "react";
import { Input } from "../Input/Input";

const popoverContent = (
  <div className="grid gap-4">
    <div className="space-y-2">
      <h4 className="leading-none font-medium">Dimensions</h4>
      <p className="text-muted-foreground text-sm">
        Set the dimensions for the layer.
      </p>
    </div>
    <div className="grid gap-2 text-xs">
      <div className="grid grid-cols-2 items-center gap-4">
        <label htmlFor="width">Width</label>
        <Input id="width" className=" h-8" />
      </div>
      <div className="grid grid-cols-2 items-center gap-4">
        <label htmlFor="height">Height</label>
        <Input id="height" className=" h-8" />
      </div>
    </div>
  </div>
);

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible popover component for displaying content overlays. Supports various alignments, sides, and modal behavior.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    modal: {
      control: "boolean",
      description: "Whether the popover is modal (blocks interaction with outside elements).",
    },
    open: {
      control: "boolean",
      description: "Controlled open state of the popover.",
    },
    defaultOpen: {
      control: "boolean",
      description: "Default open state for uncontrolled popover.",
    },
    onOpenChange: {
      action: "onOpenChange",
      description: "Callback when open state changes.",
    },
  },
  args: {
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic default popover
export const Default: Story = {
  args: {},
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {popoverContent}
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic popover with default settings.",
      },
    },
  },
};

// Popover with custom content
export const WithCustomContent: Story = {
  args: {},
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <Icon name="info" className="mr-2" />
          Info
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h4 className="font-medium">Information</h4>
          <p className="text-sm text-muted-foreground">
            This is a custom popover with additional content.
          </p>
          <Button size="sm" className="w-full">
            Learn More
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popover with custom content including buttons and icons.",
      },
    },
  },
};

// Showcase different alignments
export const Alignments: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <Popover {...args}>
        <PopoverTrigger asChild>
          <Button variant="outline">Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48">
          <p className="text-sm">Aligned to start</p>
        </PopoverContent>
      </Popover>
      <Popover {...args}>
        <PopoverTrigger asChild>
          <Button variant="outline">Center</Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-48">
          <p className="text-sm">Aligned to center</p>
        </PopoverContent>
      </Popover>
      <Popover {...args}>
        <PopoverTrigger asChild>
          <Button variant="outline">End</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48">
          <p className="text-sm">Aligned to end</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different alignment options: start, center, and end.",
      },
    },
  },
};

// Popover with different sides
export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <Popover {...args}>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-48">
          <p className="text-sm">Appears on top</p>
        </PopoverContent>
      </Popover>
      <div className="flex gap-4">
        <Popover {...args}>
          <PopoverTrigger asChild>
            <Button variant="outline">Left</Button>
          </PopoverTrigger>
          <PopoverContent side="left" className="w-48">
            <p className="text-sm">Appears on left</p>
          </PopoverContent>
        </Popover>
        <Popover {...args}>
          <PopoverTrigger asChild>
            <Button variant="outline">Right</Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-48">
            <p className="text-sm">Appears on right</p>
          </PopoverContent>
        </Popover>
      </div>
      <Popover {...args}>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-48">
          <p className="text-sm">Appears on bottom</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates popover appearing on different sides: top, bottom, left, right.",
      },
    },
  },
};

// Modal popover
export const Modal: Story = {
  args: {
    modal: true,
  },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="destructive">Open Modal Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Modal Popover</h4>
          <p className="text-sm text-muted-foreground">
            This popover blocks interaction with outside elements.
          </p>
          <div className="flex gap-2">
            <Button size="sm">Action</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Modal popover that prevents interaction with background elements.",
      },
    },
  },
};

// Popover with custom side offset
export const CustomOffset: Story = {
  args: {},
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="ghost">Custom Offset</Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={20} className="w-64">
        <p className="text-sm">This popover has a custom side offset of 20px.</p>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popover with a custom side offset for positioning.",
      },
    },
  },
};

// Controlled popover
export const Controlled: Story = {
  args: {
    open: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(!open)}>
          Toggle Popover ({open ? "Open" : "Closed"})
        </Button>
        <Popover {...args} open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">Controlled Trigger</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <p className="text-sm">This popover is controlled externally.</p>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Controlled popover with external state management.",
      },
    },
  },
};
