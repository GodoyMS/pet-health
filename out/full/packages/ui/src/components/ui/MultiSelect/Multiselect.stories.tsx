import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect, type MultiSelectProps, type MultiSelectOption, type MultiSelectGroup } from "./Multiselect";

// Sample data for stories
const basicOptions: MultiSelectOption[] = [
  { value: "next.js", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "ember", label: "Ember.js" },
];

const optionsWithIcons: MultiSelectOption[] = [
  { value: "next.js", label: "Next.js", icon: ({ className }) => <span className={className}>🚀</span> },
  { value: "react", label: "React", icon: ({ className }) => <span className={className}>⚛️</span> },
  { value: "vue", label: "Vue.js", icon: ({ className }) => <span className={className}>💚</span> },
  { value: "angular", label: "Angular", icon: ({ className }) => <span className={className}>🅰️</span> },
];

const groupedOptions: MultiSelectGroup[] = [
  {
    heading: "Frontend Frameworks",
    options: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue.js" },
      { value: "angular", label: "Angular" },
    ],
  },
  {
    heading: "Backend Frameworks",
    options: [
      { value: "express", label: "Express.js" },
      { value: "nestjs", label: "NestJS" },
      { value: "django", label: "Django" },
    ],
  },
];

const meta: Meta<MultiSelectProps> = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile multi-select component with search, grouping, icons, animations, and accessibility features. Supports various variants and responsive behavior.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline", "filled"],
      description: "Visual style variant of the multi-select.",
    },
    variantBadge: {
      control: { type: "select" },
      options: ["bounce", "pulse", "wiggle", "fade", "slide", "none"],
      description: "Animation style for badges.",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when no options are selected.",
    },
    searchable: {
      control: "boolean",
      description: "Enable search functionality in the dropdown.",
    },
    hideSelectAll: {
      control: "boolean",
      description: "Hide the 'Select All' option.",
    },
    maxCount: {
      control: { type: "number", min: 1, max: 10 },
      description: "Maximum number of badges to display before summarizing.",
    },
    disabled: {
      control: "boolean",
      description: "Disable the entire component.",
    },
    animation: {
      control: { type: "number", min: 0, max: 2, step: 0.1 },
      description: "Animation duration in seconds for badge effects.",
    },
    responsive: {
      control: "boolean",
      description: "Enable responsive behavior for different screen sizes.",
    },
    closeOnSelect: {
      control: "boolean",
      description: "Close the dropdown after selecting an option.",
    },
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic default story
export const Default: Story = {
  args: {
    options: basicOptions,
    searchable: false,
    hideSelectAll: true,
    placeholder: "Choose frameworks...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic multi-select with default settings. No search or select-all options.",
      },
    },
  },
};

// Story with search functionality
export const WithSearch: Story = {
  args: {
    options: basicOptions,
    searchable: true,
    hideSelectAll: false,
    placeholder: "Search and select frameworks...",
    searchBarLabel: "Buscar opciones...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multi-select with search input and 'Select All' option enabled.",
      },
    },
  },
};

// Story with icons
export const WithIcons: Story = {
  args: {
    options: optionsWithIcons,
    searchable: true,
    placeholder: "Select with icons...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multi-select with custom icons for each option.",
      },
    },
  },
};

// Story with grouped options
export const WithGroups: Story = {
  args: {
    options: groupedOptions,
    searchable: true,
    placeholder: "Select from groups...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multi-select with options organized into groups.",
      },
    },
  },
};

// Story showcasing variants
export const Variants: Story = {
  args: {
    options: basicOptions,
    searchable: true,
    placeholder: "Choose variant...",
  },
  render: (args) => (
    <div className="space-y-4 w-[400px]">
      <div>
        <label className="block text-sm font-medium mb-2">Default Variant</label>
        <MultiSelect {...args} variant="default" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Outline Variant</label>
        <MultiSelect {...args} variant="outline" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Filled Variant</label>
        <MultiSelect {...args} variant="filled" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different visual variants: default, outline, and filled.",
      },
    },
  },
};

// Story with animations
export const WithAnimations: Story = {
  args: {
    options: basicOptions,
    searchable: true,
    animation: 0.5,
    animationConfig: { badgeAnimation: "bounce" },
    placeholder: "Animated selection...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multi-select with badge animations and hover effects.",
      },
    },
  },
};

// Story with max count and overflow
export const WithMaxCount: Story = {
  args: {
    options: basicOptions,
    maxCount: 2,
    defaultValue: ["next.js", "react", "vue", "angular"],
    placeholder: "Limited badges...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Limits visible badges to 2, showing a summary for extras.",
      },
    },
  },
};

// Disabled state story
export const Disabled: Story = {
  args: {
    options: basicOptions,
    disabled: true,
    defaultValue: ["next.js"],
    placeholder: "Disabled component...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multi-select in disabled state, preventing interaction.",
      },
    },
  },
};

// Responsive story
export const Responsive: Story = {
  args: {
    options: basicOptions,
    responsive: true,
    searchable: true,
    placeholder: "Responsive behavior...",
  },
  render: (args) => (
    <div className="w-full max-w-[600px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Multi-select with responsive settings for mobile, tablet, and desktop.",
      },
    },
  },
};

// Story with single line badges
export const SingleLine: Story = {
  args: {
    options: basicOptions,
    singleLine: true,
    defaultValue: ["next.js", "react", "vue"],
    placeholder: "Single line badges...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges displayed in a single horizontal line with scroll.",
      },
    },
  },
};

// Story with close on select
export const CloseOnSelect: Story = {
  args: {
    options: basicOptions,
    closeOnSelect: true,
    searchable: true,
    placeholder: "Closes after selection...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Dropdown closes automatically after selecting an option.",
      },
    },
  },
};

