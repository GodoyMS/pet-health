import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Icon, type IconProps } from "./Icon";

// Common Material Symbols for demonstration
const commonIcons = {
  navigation: ["home", "search", "menu", "close", "arrow_back", "arrow_forward"],
  actions: ["edit", "delete", "add", "remove", "check", "clear"],
  communication: ["email", "phone", "message", "send", "call"],
  content: ["text_fields", "image", "video_call", "call", "file_copy", "folder"],
  social: ["person", "group", "share", "favorite", "star"],
  status: ["check_circle", "error", "warning", "info", "help"],
  devices: ["computer", "phone_android", "tablet", "watch"],
};

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible and accessible icon component using Google Material Symbols. Supports multiple variants, weights, grades, and optical sizes for professional applications.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: { type: "text" },
         description: `
Material Symbol icon name.

This component is built on top of **Google Material Symbols**.
You can find the full list of available icon names here:

👉 https://fonts.google.com/icons

Examples:
- \`home\`
- \`search\`
- \`edit\`
- \`arrow_forward\`



`,
    },
    variant: {
      control: { type: "select" },
      options: ["filled", "outline"],
      description: "Icon style variant.",
    },
    fill: {
      control: { type: "select" },
      options: [0, 1],
      description: "Fill level: 0 for outline, 1 for filled.",
    },
    weight: {
      control: { type: "select" },
      options: [100, 200, 300, 400, 500, 600, 700],
      description: "Font weight from 100 to 700.",
    },
    grade: {
      control: { type: "select" },
      options: [-25, 0, 200],
      description: "Grade adjustment: -25 for thinner, 200 for bolder.",
    },
    opticalSize: {
      control: { type: "select" },
      options: [20, 24, 40, 48],
      description: "Optical size for different display contexts.",
    },
    "aria-label": {
      control: { type: "text" },
      description: "Accessible label for screen readers.",
    },
  },
  args: {
    name: "home",
    variant: "outline",
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic icon display
export const Default: Story = {
  args: {
    name: "home",
  },
  parameters: {
    docs: {
      description: {
        story: "Basic icon display with default settings.",
      },
    },
  },
};

// Variants comparison
export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Icon {...args} name="home" variant="outline" />
        <p className="text-sm text-muted-foreground mt-2">Outline</p>
      </div>
      <div className="text-center">
        <Icon {...args} name="home" variant="filled" />
        <p className="text-sm text-muted-foreground mt-2">Filled</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparison of outline and filled variants.",
      },
    },
  },
};

// Different weights
export const Weights: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {[100, 200, 300, 400, 500, 600, 700].map((weight) => (
        <div key={weight} className="text-center">
          <Icon {...args} name="home" weight={weight as IconProps["weight"]} />
          <p className="text-xs text-muted-foreground mt-1">{weight}</p>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different font weights from thin (100) to bold (700).",
      },
    },
  },
};

// Grade variations
export const Grades: Story = {
  render: (args) => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Icon {...args} name="home" grade={-25} />
        <p className="text-sm text-muted-foreground mt-2">Grade -25</p>
      </div>
      <div className="text-center">
        <Icon {...args} name="home"grade={0} />
        <p className="text-sm text-muted-foreground mt-2">Grade 0</p>
      </div>
      <div className="text-center">
        <Icon {...args} name="home" grade={200} />
        <p className="text-sm text-muted-foreground mt-2">Grade 200</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Grade variations for fine-tuning icon appearance.",
      },
    },
  },
};

// Optical sizes
export const OpticalSizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      <div className="text-center">
        <Icon {...args} name="home"  opticalSize={20} />
        <p className="text-xs text-muted-foreground mt-1">20px</p>
      </div>
      <div className="text-center">
        <Icon {...args} name="home" opticalSize={24} />
        <p className="text-xs text-muted-foreground mt-1">24px</p>
      </div>
      <div className="text-center">
        <Icon {...args} name="home" opticalSize={40} />
        <p className="text-xs text-muted-foreground mt-1">40px</p>
      </div>
      <div className="text-center">
        <Icon {...args} name="home" opticalSize={48} />
        <p className="text-xs text-muted-foreground mt-1">48px</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different optical sizes optimized for various display contexts.",
      },
    },
  },
};

// Common icon categories
export const IconCategories: Story = {
  render: (args) => (
    <div className="space-y-8">
      {Object.entries(commonIcons).map(([category, icons]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold capitalize">{category.replace('_', ' ')}</h3>
          <div className="flex flex-wrap gap-4">
            {icons.map((iconName) => (
              <div key={iconName} className="flex flex-col items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50">
                <Icon {...args} name={iconName} />
                <span className="text-xs text-muted-foreground">{iconName}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Commonly used icons organized by category for easy reference.",
      },
    },
  },
};

// Size variations with custom classes
export const CustomSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <Icon {...args}name="home" className="text-lg" />
        <p className="text-sm text-muted-foreground mt-2">text-lg</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-xl" />
        <p className="text-sm text-muted-foreground mt-2">text-xl</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-2xl" />
        <p className="text-sm text-muted-foreground mt-2">text-2xl</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-3xl" />
        <p className="text-sm text-muted-foreground mt-2">text-3xl</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-4xl" />
        <p className="text-sm text-muted-foreground mt-2">text-4xl</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Custom sizing using Tailwind CSS classes for larger icons.",
      },
    },
  },
};

// Color variations
export const Colors: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <Icon {...args}name="home" className="text-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Default</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Primary</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-destructive" />
        <p className="text-sm text-muted-foreground mt-2">Destructive</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-success" />
        <p className="text-sm text-muted-foreground mt-2">Success</p>
      </div>
      <div className="text-center">
        <Icon {...args} name="home"className="text-warning" />
        <p className="text-sm text-muted-foreground mt-2">Warning</p>
      </div>
      <div className="text-center">
        <Icon {...args}name="home" className="text-info" />
        <p className="text-sm text-muted-foreground mt-2">Info</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Icons with different color themes using design system colors.",
      },
    },
  },
};

// Accessibility examples
export const Accessibility: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Accessible Icons</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon {...args} name="delete" aria-label="Delete item" />
            <span className="text-sm">Delete (with label)</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon {...args} name="edit" aria-label="Edit item" />
            <span className="text-sm">Edit (with label)</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon {...args} name="visibility" aria-label="View details" />
            <span className="text-sm">View (with label)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Decorative Icons</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon {...args} name="star" />
            <span className="text-sm">Star (decorative)</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon {...args} name="favorite" />
            <span className="text-sm">Heart (decorative)</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Decorative icons have aria-hidden="true" by default
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accessibility examples showing proper ARIA labels and decorative icons.",
      },
    },
  },
};

// Interactive button examples
export const InteractiveExamples: Story = {
  render: (args) => {
    const [isFavorited, setIsFavorited] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Interactive Examples</h3>

          {/* Favorite Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              <Icon
                {...args}
                name="favorite"
                className={isFavorited ? "text-red-500" : "text-muted-foreground"}
              />
              <span className="text-sm">
                {isFavorited ? "Favorited" : "Add to Favorites"}
              </span>
            </button>
          </div>

          {/* Expandable Section */}
          <div className="border border-border rounded-lg p-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 w-full text-left"
            >
              <Icon
                {...args}
                name={isExpanded ? "remove" : "add"}
                className="transition-transform duration-200"
                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
              />
              <span className="font-medium">Expandable Section</span>
            </button>
            {isExpanded && (
              <div className="mt-3 p-3 bg-muted/50 rounded">
                <p className="text-sm text-muted-foreground">
                  This content is revealed when expanded. Icons can be used to indicate state changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive examples showing icons in buttons and stateful components.",
      },
    },
  },
};

// Enterprise use cases
export const EnterpriseUseCases: Story = {
  render: (args) => (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Navigation</h3>
        <div className="flex items-center gap-6 p-4 border rounded-lg">
          <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
            <Icon {...args} name="home" />
            <span>Dashboard</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
            <Icon {...args} name="analytics" />
            <span>Analytics</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
            <Icon {...args} name="settings" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Status Indicators</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Icon {...args} name="check_circle" className="text-green-500" />
            <div>
              <p className="font-medium">Task Completed</p>
              <p className="text-sm text-muted-foreground">All requirements met</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Icon {...args} name="warning" className="text-yellow-500" />
            <div>
              <p className="font-medium">Review Required</p>
              <p className="text-sm text-muted-foreground">Pending approval</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Icon {...args} name="error" className="text-red-500" />
            <div>
              <p className="font-medium">Error Detected</p>
              <p className="text-sm text-muted-foreground">Action required</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Icon {...args} name="info" className="text-blue-500" />
            <div>
              <p className="font-medium">Information</p>
              <p className="text-sm text-muted-foreground">Update available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Data Table Actions</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3">Project Alpha</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon {...args} name="check_circle" className="text-green-500 w-4 h-4" />
                    <span className="text-sm">Active</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1 hover:bg-muted rounded">
                      <Icon {...args} name="edit" className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <Icon {...args} name="delete" className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <Icon {...args} name="more_vert" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Enterprise use cases showing icons in navigation, status indicators, and data tables.",
      },
    },
  },
};

// Icon combinations and compositions
export const IconCompositions: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Icon Combinations</h3>
        <div className="flex items-center gap-6">
          {/* Notification Badge */}
          <div className="relative">
            <Icon {...args} name="notifications" className="text-2xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>

          {/* Loading State */}
          <div className="flex items-center gap-2">
            <Icon {...args} name="refresh" className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>

          {/* Stacked Icons */}
          <div className="relative">
            <Icon {...args} name="person" className="text-2xl" />
            <Icon {...args} name="check_circle" className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Button Variations</h3>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
            <Icon {...args} name="add" />
            <span>Create</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            <Icon {...args} name="send" />
            <span>Send</span>
          </button>
          <button className="p-2 border rounded-md hover:bg-muted">
            <Icon {...args} name="more_vert" />
          </button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Advanced icon compositions including badges, loading states, and button combinations.",
      },
    },
  },
};


