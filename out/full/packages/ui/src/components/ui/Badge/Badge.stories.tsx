import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Badge } from "./Badge";
import { Icon } from "../Icon/Icon";

// Sample data for stories
const badgeContent = "Badge";
const badgeWithIcon = (
  <>
    <Icon name="check" className="w-3 h-3" />
    Success
  </>
);

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile badge component for displaying status, labels, or counts. Supports various variants, icons, and interactive states.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "destructive", "outline"],
      description: "Visual style variant of the badge.",
    },
    children: {
      control: "text",
      description: "Content to display inside the badge.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling.",
    },
    asChild: {
      control: "boolean",
      description: "Render as a child component (e.g., link).",
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic default badge
export const Default: Story = {
  args: {
    variant: "default",
    children: badgeContent,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic badge with default styling.",
      },
    },
  },
};

// Badge with icon
export const WithIcon: Story = {
  args: {
    variant: "default",
    children: badgeWithIcon,
  },
  parameters: {
    docs: {
      description: {
        story: "Badge with an icon and text.",
      },
    },
  },
};

// Showcase all variants
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Badge {...args} variant="default">Default</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
      <Badge {...args} variant="destructive">Destructive</Badge>
      <Badge {...args} variant="outline">Outline</Badge>
      <Badge {...args} variant="success">Success</Badge>
      <Badge {...args} variant="warning">Warning</Badge>
      <Badge {...args} variant="info">Info</Badge>
      <Badge {...args} variant="error">Error</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available badge variants.",
      },
    },
  },
};

// Clickable badge
export const Clickable: Story = {
  args: {
    variant: "default",
    children: "Clickable",
    onClick: () => alert("Badge clicked!"),
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive badge that responds to clicks.",
      },
    },
  },
};

// Badge as link
export const AsLink: Story = {
  args: {
    variant: "outline",
    children: "Link Badge",
    asChild: true,
  },
  render: (args) => (
    <Badge {...args}>
      <a href="#" className="no-underline">
        Link Badge
      </a>
    </Badge>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badge rendered as a link using asChild prop.",
      },
    },
  },
};

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">
        <Icon name="check_circle" className="text-xs" />
        Active
      </Badge>
      <Badge variant="secondary">
        <Icon name="schedule" className="text-xs" />
        Pending
      </Badge>
      <Badge variant="destructive">
        <Icon name="error" className="text-xs" />
        Error
      </Badge>
      <Badge variant="outline">
        <Icon name="info" className="text-xs" />
        Info
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Status badges with icons for different states.",
      },
    },
  },
};

// Notification badges
export const Notification: Story = {
  args: {
    variant: "destructive",
    children: "99+",
  },
  parameters: {
    docs: {
      description: {
        story: "Badge for displaying notification counts.",
      },
    },
  },
};

// Custom styled badge
export const CustomStyled: Story = {
  args: {
    variant: "outline",
    children: "Custom",
    className:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent",
  },
  parameters: {
    docs: {
      description: {
        story: "Badge with custom styling via className.",
      },
    },
  },
};
