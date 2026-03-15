import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { fn } from "@storybook/test";
import { Textarea } from "./Textarea";

// Sample data for complex examples
const sampleTexts = {
  short: "This is a short message.",
  medium: "This is a medium-length message that provides more context and details about the topic being discussed. It contains enough content to demonstrate how the textarea handles moderate amounts of text.",
  long: `This is a comprehensive message that demonstrates how the textarea component handles longer-form content. It includes multiple paragraphs and demonstrates the component's ability to handle various types of text input.

The textarea supports automatic resizing based on content, maintains proper spacing and typography, and provides excellent user experience for form inputs that require more detailed responses.

Key features include:
• Automatic field sizing
• Proper focus management
• Accessibility compliance
• Responsive design
• Validation state support

This makes it ideal for enterprise applications where user input quality and experience are critical.`,
  placeholder: "Enter your feedback, comments, or detailed description here...",
};

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible and accessible textarea component with automatic resizing, validation states, and enterprise-grade styling. Supports all standard textarea attributes plus enhanced features for professional applications.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text displayed when the textarea is empty.",
    },
    disabled: {
      control: "boolean",
      description: "Whether the textarea is disabled.",
    },
    readOnly: {
      control: "boolean",
      description: "Whether the textarea is read-only.",
    },
    required: {
      control: "boolean",
      description: "Whether the textarea is required.",
    },
    rows: {
      control: "number",
      description: "Number of visible text lines.",
    },
    maxLength: {
      control: "number",
      description: "Maximum number of characters allowed.",
    },
    "aria-invalid": {
      control: "boolean",
      description: "Whether the textarea has an invalid state.",
    },
    onChange: {
      action: "onChange",
      description: "Callback fired when the value changes.",
    },
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic textarea with placeholder
export const Default: Story = {
  args: {
    placeholder: sampleTexts.placeholder,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic textarea component with placeholder text.",
      },
    },
  },
};

// Different sizes and content lengths
export const ContentSizes: Story = {
  render: (args) => (
    <div className="space-y-6 w-[600px]">
      <div className="space-y-2">
        <label className="text-sm font-medium">Short Content</label>
        <Textarea {...args} defaultValue={sampleTexts.short} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Medium Content</label>
        <Textarea {...args} defaultValue={sampleTexts.medium} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Long Content</label>
        <Textarea {...args} defaultValue={sampleTexts.long} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates how the textarea handles different content lengths with automatic resizing.",
      },
    },
  },
};

// Controlled textarea with character counter
export const WithCharacterLimit: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(sampleTexts.medium);
    const maxLength = 500;
    const remainingChars = maxLength - value.length;

    return (
      <div className="space-y-2 w-[600px]">
        <label className="text-sm font-medium">Feedback (Max {maxLength} characters)</label>
        <Textarea
          {...args}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          placeholder="Share your detailed feedback..."
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{remainingChars} characters remaining</span>
          <span>{value.length}/{maxLength}</span>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea with character limit and counter for controlled input scenarios.",
      },
    },
  },
};

// Validation states
export const ValidationStates: Story = {
  render: (args) => (
    <div className="space-y-6 w-[600px]">
      <div className="space-y-2">
        <label className="text-sm font-medium">Valid State</label>
        <Textarea {...args} placeholder="Enter valid content..." />
        <p className="text-xs text-green-600">✓ Input is valid</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Invalid State</label>
        <Textarea {...args} aria-invalid="true" placeholder="This field has an error..." />
        <p className="text-xs text-red-600">✗ This field is required</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Warning State</label>
        <Textarea {...args} placeholder="Consider reviewing this content..." />
        <p className="text-xs text-yellow-600">⚠ Please review your input</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different validation states with appropriate styling and messaging.",
      },
    },
  },
};

// Disabled and read-only states
export const States: Story = {
  render: (args) => (
    <div className="space-y-6 w-[600px]">
      <div className="space-y-2">
        <label className="text-sm font-medium">Default State</label>
        <Textarea {...args} placeholder="Editable textarea..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Disabled State</label>
        <Textarea {...args} disabled defaultValue="This textarea is disabled and cannot be edited." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Read-Only State</label>
        <Textarea {...args} readOnly defaultValue="This textarea is read-only. You can select and copy text but cannot edit it." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows different interaction states: default, disabled, and read-only.",
      },
    },
  },
};

// Form integration example
export const FormIntegration: Story = {
  render: (args) => {
    const [formData, setFormData] = React.useState({
      title: "",
      description: "",
      comments: "",
    });

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
      <form className="space-y-6 w-[600px]" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            placeholder="Enter a title..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description *</label>
          <Textarea
            {...args}
            required
            placeholder="Provide a detailed description..."
            value={formData.description}
            onChange={handleChange("description")}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Comments</label>
          <Textarea
            {...args}
            placeholder="Any additional comments or notes..."
            value={formData.comments}
            onChange={handleChange("comments")}
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Submit Form
        </button>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Complete form integration example showing how textarea works with other form elements.",
      },
    },
  },
};

// Auto-resize behavior
export const AutoResize: Story = {
  render: (args) => {
    const [content, setContent] = React.useState("");

    return (
      <div className="space-y-4 w-[600px]">
        <div className="space-y-2">
          <label className="text-sm font-medium">Auto-Resizing Textarea</label>
          <Textarea
            {...args}
            placeholder="Start typing to see the textarea automatically resize..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Characters: {content.length}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            className="px-3 py-2 text-sm border rounded-md hover:bg-muted"
            onClick={() => setContent(sampleTexts.short)}
          >
            Load Short Text
          </button>
          <button
            className="px-3 py-2 text-sm border rounded-md hover:bg-muted"
            onClick={() => setContent(sampleTexts.long)}
          >
            Load Long Text
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates the automatic resizing behavior as content changes.",
      },
    },
  },
};

// Enterprise use cases
export const EnterpriseUseCases: Story = {
  render: (args) => (
    <div className="space-y-8 w-[700px]">
      {/* Code Review Comments */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Code Review Comments</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Review Feedback</label>
          <Textarea
            {...args}
            placeholder="Provide detailed feedback on the code changes..."
            defaultValue="The implementation looks solid. Consider adding error handling for edge cases and improving the documentation comments."
          />
        </div>
      </div>

      {/* Support Ticket */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Support Ticket Description</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Issue Description</label>
          <Textarea
            {...args}
            placeholder="Describe the issue in detail..."
            defaultValue={`Steps to reproduce:
1. Navigate to the dashboard
2. Click on the reports section
3. Attempt to export data

Expected behavior: Data should export successfully
Actual behavior: Export fails with error message "Invalid format"`}

          />
        </div>
      </div>

      {/* Project Documentation */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Project Documentation</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Technical Specifications</label>
          <Textarea
            {...args}
            placeholder="Document technical requirements and specifications..."
            defaultValue={`## API Requirements
### Authentication
- OAuth 2.0 with JWT tokens
- Refresh token rotation
- Multi-factor authentication support

### Rate Limiting
- 1000 requests per hour for standard users
- 10000 requests per hour for premium users
- Burst handling with queue management`}

          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world enterprise use cases demonstrating textarea in professional applications.",
      },
    },
  },
};

// Accessibility features
export const Accessibility: Story = {
  render: (args) => (
    <div className="space-y-6 w-[600px]">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="accessible-textarea-1">
          Accessible Textarea with Proper Labeling
        </label>
        <Textarea
          {...args}
          id="accessible-textarea-1"
          placeholder="This textarea has proper accessibility attributes..."
          aria-describedby="textarea-help"
        />
        <p id="textarea-help" className="text-xs text-muted-foreground">
          Help text that is properly associated with the textarea using aria-describedby
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="accessible-textarea-2">
          Required Field with Error
        </label>
        <Textarea
          {...args}
          id="accessible-textarea-2"
          required
          aria-invalid="true"
          aria-errormessage="error-message"
          placeholder="This required field has an error..."
        />
        <p id="error-message" className="text-xs text-red-600" role="alert">
          This field is required and cannot be empty
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="accessible-textarea-3">
          Textarea with Character Count
        </label>
        <Textarea
          {...args}
          id="accessible-textarea-3"
          maxLength={200}
          placeholder="Limited to 200 characters..."
          aria-describedby="char-count"
        />
        <p id="char-count" className="text-xs text-muted-foreground" aria-live="polite">
          0/200 characters used
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates accessibility features including proper labeling, error states, and screen reader support.",
      },
    },
  },
};

// Responsive behavior
export const Responsive: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="w-full max-w-sm">
        <label className="text-sm font-medium">Small Container</label>
        <Textarea {...args} placeholder="Textarea in a small container..." />
      </div>

      <div className="w-full max-w-md">
        <label className="text-sm font-medium">Medium Container</label>
        <Textarea {...args} placeholder="Textarea in a medium container..." />
      </div>

      <div className="w-full max-w-lg">
        <label className="text-sm font-medium">Large Container</label>
        <Textarea {...args} placeholder="Textarea in a large container..." />
      </div>

      <div className="w-full">
        <label className="text-sm font-medium">Full Width</label>
        <Textarea {...args} placeholder="Textarea that spans full width..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows how the textarea adapts to different container sizes and responsive layouts.",
      },
    },
  },
};