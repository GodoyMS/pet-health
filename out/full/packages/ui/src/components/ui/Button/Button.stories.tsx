import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "./Button";
import { Icon } from "../Icon/Icon";

// Sample content for stories
const buttonText = "Button";
const buttonWithIcon = (
  <>
    <Icon name="add" className="w-4 h-4" />
    Add Item
  </>
);

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile button component with multiple variants, sizes, and states. Supports icons, loading states, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "outline", "ghost", "flat", "destructive"],
      description: "Visual style variant of the button.",
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
      description: "Size variant of the button.",
    },
    disabled: {
      control: "boolean",
      description: "Disable the button.",
    },
    asChild: {
      control: "boolean",
      description: "Render as a child component (e.g., link).",
    },
    children: {
      control: "text",
      description: "Content to display inside the button.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling.",
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic default button
export const Default: Story = {
  args: {
    variant: "default",
    children: buttonText,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic button with default styling.",
      },
    },
  },
};

// Button with icon
export const WithIcon: Story = {
  args: {
    variant: "default",
    children: buttonWithIcon,
  },
  parameters: {
    docs: {
      description: {
        story: "Button with an icon and text.",
      },
    },
  },
};

// Showcase all variants
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="flat">Flat</Button>
      <Button {...args} variant="destructive">Destructive</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available button variants.",
      },
    },
  },
};

// Showcase all sizes
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2 items-start">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="default">Default</Button>
      <Button {...args} size="lg">Large</Button>
      <Button {...args} size="icon">
        <Icon name="add" className="w-4 h-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available button sizes.",
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    variant: "default",
    children: "Disabled",
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Button in disabled state, preventing interaction.",
      },
    },
  },
};

// Button as link
export const AsLink: Story = {
  args: {
    variant: "link",
    children: "Link Button",
    asChild: true,
  },
  render: (args) => (
    <Button {...args}>
      <a href="#" className="no-underline">
        Link Button
      </a>
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Button rendered as a link using asChild prop.",
      },
    },
  },
};

// Loading state (simulated)
export const Loading: Story = {
  args: {
    variant: "default",
    children: (
      <>
        <Icon name="refresh" className="w-4 h-4 animate-spin mr-2" />
        Loading...
      </>
    ),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Button in loading state with spinner icon.",
      },
    },
  },
};

// Custom styled button
export const CustomStyled: Story = {
  args: {
    variant: "default",
    children: buttonText,
    className: "bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg hover:shadow-xl",
  },
  parameters: {
    docs: {
      description: {
        story: "Button with custom styling via className.",
      },
    },
  },
};

// Action buttons
export const Actions: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default">
        <Icon name="save" className="w-4 h-4 mr-2" />
        Save
      </Button>
      <Button variant="secondary">
        <Icon name="edit" className="w-4 h-4 mr-2" />
        Edit
      </Button>
      <Button variant="destructive">
        <Icon name="delete" className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Common action buttons with icons.",
      },
    },
  },
};
