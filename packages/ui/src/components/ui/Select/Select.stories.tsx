import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup } from "./Select";
import { Icon } from "../Icon/Icon";

// Sample data for stories
const basicOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

const optionsWithIcons = [
  { value: "option1", label: "Option 1", icon: <Icon name="home" className="w-4 h-4" /> },
  { value: "option2", label: "Option 2", icon: <Icon name="search" className="w-4 h-4" /> },
  { value: "option3", label: "Option 3", icon: <Icon name="settings" className="w-4 h-4" /> },
];

const optionsWithDescriptions = [
  { value: "option1", label: "Option 1", description: "This is the first option" },
  { value: "option2", label: "Option 2", description: "This is the second option" },
  { value: "option3", label: "Option 3", description: "This is the third option" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile select component with multiple variants, sizes, and states. Supports icons, descriptions, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant of the select.",
    },
    disabled: {
      control: "boolean",
      description: "Disable the select.",
    },
    onValueChange: {
      action: "onValueChange",
      description: "Callback when value changes.",
    },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic default select
export const Default: Story = {
  args: {},
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {basicOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic select with default settings.",
      },
    },
  },
};

// Select with icons
export const WithIcons: Story = {
  args: {},
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select with icons" />
      </SelectTrigger>
      <SelectContent>
        {optionsWithIcons.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: "Select with icons for each option.",
      },
    },
  },
};

// Showcase all variants
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Select {...args}>
        <SelectTrigger variant="default" className="w-[200px]">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          {basicOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select {...args}>
        <SelectTrigger variant="outline" className="w-[200px]">
          <SelectValue placeholder="Outline" />
        </SelectTrigger>
        <SelectContent>
          {basicOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select {...args}>
        <SelectTrigger variant="filled" className="w-[200px]">
          <SelectValue placeholder="Filled" />
        </SelectTrigger>
        <SelectContent>
          {basicOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select {...args}>
        <SelectTrigger variant="ghost" className="w-[200px]">
          <SelectValue placeholder="Ghost" />
        </SelectTrigger>
        <SelectContent>
          {basicOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available select variants.",
      },
    },
  },
};

// Showcase all sizes
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Select {...args} size="sm">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Small" />
        </SelectTrigger>
        <SelectContent>
          {basicOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select {...args} size="md">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Medium" />
        </SelectTrigger>
        <SelectContent>
          {basicOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select {...args} size="lg">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Large" />
        </SelectTrigger>
        <SelectContent>
          {basicOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available select sizes.",
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        {basicOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: "Select in disabled state, preventing interaction.",
      },
    },
  },
};



// Select with groups and separators
export const WithGroups: Story = {
  args: {},
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select with groups" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Group 1</SelectLabel>
          <SelectItem value="group1-option1">Option 1</SelectItem>
          <SelectItem value="group1-option2">Option 2</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Group 2</SelectLabel>
          <SelectItem value="group2-option1">Option 3</SelectItem>
          <SelectItem value="group2-option2">Option 4</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: "Select with grouped options and separators.",
      },
    },
  },
};

