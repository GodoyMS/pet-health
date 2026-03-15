import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./Accordion";
import { Icon } from "../Icon/Icon";
import { Badge } from "../Badge/Badge";
import {useState} from "react";
// Sample data for stories
const faqItems = [
  {
    id: "item-1",
    trigger: "What is the Accordion component?",
    content: "The Accordion component is a collapsible interface element that allows users to expand and collapse sections of content. It's commonly used for FAQs, settings panels, and organizing large amounts of information.",
  },
  {
    id: "item-2",
    trigger: "How does it support accessibility?",
    content: "The Accordion uses ARIA attributes and keyboard navigation. Users can navigate with arrow keys, expand/collapse with Enter or Space, and screen readers announce the state changes.",
  },
  {
    id: "item-3",
    trigger: "Can it be controlled programmatically?",
    content: "Yes, the Accordion supports controlled state management. You can pass 'value' and 'onValueChange' props to control which items are open, enabling integration with form libraries or complex state management.",
  },
];

const settingsItems = [
  {
    id: "notifications",
    trigger: (
      <div className="flex items-center w-full">
        <Icon name="notifications" className="mr-2" />
        Notification Settings
        <Badge variant="secondary" className="ml-auto">
          3
        </Badge>
      </div>
    ),
    content: "Configure how and when you receive notifications. Choose from email, push notifications, and in-app alerts.",
  },
  {
    id: "privacy",
    trigger: (
      <div className="flex items-center justify-start w-full">
        <Icon name="security" className="mr-2" />
        Privacy & Security
      </div>
    ),
    content: "Manage your privacy settings, including data sharing preferences, two-factor authentication, and account security options.",
  },
  {
    id: "appearance",
    trigger: (
      <div className="flex items-center justify-start w-full">
        <Icon name="palette" className="mr-2" />
        Appearance
      </div>
    ),
    content: "Customize the look and feel of your interface. Choose themes, fonts, and layout preferences.",
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible accordion component for organizing and displaying collapsible content sections. Supports single and multiple selection modes, custom triggers, and full accessibility compliance.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["single", "multiple"],
      description: "Whether multiple items can be open simultaneously.",
    },
    collapsible: {
      control: "boolean",
      description: "Whether all items can be collapsed (only applies to single type).",
    },
    disabled: {
      control: "boolean",
      description: "Disable the entire accordion.",
    },
    value: {
      control: "text",
      description: "Controlled value for open items.",
    },
    defaultValue: {
      control: "text",
      description: "Default value for uncontrolled accordion.",
    },
    onValueChange: {
      action: "onValueChange",
      description: "Callback when value changes.",
    },
    iconPosition: {
      control: { type: "select" },
      options: ["left", "right"],
      description: "Position of the chevron icon (left or right).",
    },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic single accordion
export const Default: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <div className="w-[500px]">
        <Accordion
      {...args}
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Information</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            Our flagship product combines cutting-edge technology with sleek
            design. Built with premium materials, it offers unparalleled
            performance and reliability.
          </p>
          <p>
            Key features include advanced processing capabilities, and an
            intuitive user interface designed for both beginners and experts.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Details</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic accordion with single selection and collapsible items.",
      },
    },
  },
};

// Multiple selection accordion
export const Multiple: Story = {
  args: {
    type: "multiple",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content for item 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content for item 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Item 3</AccordionTrigger>
          <AccordionContent>Content for item 3</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordion allowing multiple items to be open simultaneously.",
      },
    },
  },
};

// Accordion with icons and badges
export const WithIcons: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} className="w-full">
        {settingsItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger >
              {item.trigger}
            </AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordion items with custom icons and badges in triggers.",
      },
    },
  },
};

// FAQ-style accordion
export const FAQ: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} className="w-full">
        {faqItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left">
              {item.trigger}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "FAQ-style accordion with longer content and left-aligned triggers.",
      },
    },
  },
};

// Controlled accordion
export const Controlled: Story = {
  args: {
    type: "single",
    value: "item-1",
  },
  render: (args) => {
    const [value, setValue] = useState("item-1");
    return (
      <div className="w-[500px] space-y-4">
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-primary text-primary-foreground rounded"
            onClick={() => setValue("item-1")}
          >
            Open Item 1
          </button>
          <button
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded"
            onClick={() => setValue("item-2")}
          >
            Open Item 2
          </button>
        </div>
        <Accordion {...args} value={value} onValueChange={setValue} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Controlled Item 1</AccordionTrigger>
            <AccordionContent>This item is controlled externally.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Controlled Item 2</AccordionTrigger>
            <AccordionContent>This item is also controlled externally.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Controlled accordion with external state management.",
      },
    },
  },
};

// Disabled accordion
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Disabled Item 1</AccordionTrigger>
          <AccordionContent>This accordion is disabled.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Disabled Item 2</AccordionTrigger>
          <AccordionContent>Cannot be interacted with.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Disabled accordion preventing all interactions.",
      },
    },
  },
};

// Custom styled accordion
export const CustomStyled: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} className="w-full border rounded-lg p-2 bg-card">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="hover:bg-accent rounded px-3">
            Custom Styled Item 1
          </AccordionTrigger>
          <AccordionContent className="px-3 text-muted-foreground">
            This accordion has custom styling applied.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-none">
          <AccordionTrigger className="hover:bg-accent rounded px-3">
            Custom Styled Item 2
          </AccordionTrigger>
          <AccordionContent className="px-3 text-muted-foreground">
            Custom background and border styles.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordion with custom styling via className props.",
      },
    },
  },
};

// Nested accordions
export const Nested: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} className="w-full">
        <AccordionItem value="parent-1">
          <AccordionTrigger>Parent Item 1</AccordionTrigger>
          <AccordionContent>
            <Accordion type="single" className="mt-4 w-full">
              <AccordionItem value="child-1">
                <AccordionTrigger className="text-sm">Child Item 1</AccordionTrigger>
                <AccordionContent className="text-sm">
                  Nested content here.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="child-2">
                <AccordionTrigger className="text-sm">Child Item 2</AccordionTrigger>
                <AccordionContent className="text-sm">
                  More nested content.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="parent-2">
          <AccordionTrigger>Parent Item 2</AccordionTrigger>
          <AccordionContent>Regular content for parent 2.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordion with nested accordions for hierarchical content.",
      },
    },
  },
};

// Icon on left
export const IconLeft: Story = {
  args: {
    type: "single",
    collapsible: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger iconPosition="left">Item with Left Icon</AccordionTrigger>
          <AccordionContent>
            This accordion item has the chevron icon positioned on the left side.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger iconPosition="left">Another Item</AccordionTrigger>
          <AccordionContent>
            The icon rotates 180 degrees when expanded.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordion with chevron icon positioned on the left side of the trigger.",
      },
    },
  },
};
