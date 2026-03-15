import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Icon } from "../Icon/Icon";
import { Button } from "../Button/Button";
import { fn } from "@storybook/test";
import {Alert, AlertTitle, AlertDescription, AlertActions} from "./Alert";
// Sample data for complex examples
const notificationExamples = {
  success: {
    title: "Payment Successful",
    description: "Your payment of $299.99 has been processed successfully. You will receive a confirmation email shortly.",
    actions: ["View Receipt", "Download Invoice"]
  },
  error: {
    title: "Connection Failed",
    description: "Unable to connect to the server. Please check your internet connection and try again.",
    actions: ["Retry", "Contact Support"]
  },
  warning: {
    title: "Storage Almost Full",
    description: "You're running low on storage space. 85% of your 100GB limit has been used.",
    actions: ["Upgrade Plan", "Manage Storage"]
  },
  info: {
    title: "New Feature Available",
    description: "We've added a new dashboard feature that provides better insights into your data.",
    actions: ["Learn More", "Try It Now"]
  }
};

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible and accessible alert component for displaying important messages, notifications, and status updates. Supports multiple variants, sizes, dismissible functionality, auto-hide, and comprehensive customization options.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "success", "warning", "info", "error"],
      description: "Visual style variant of the alert.",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant of the alert.",
    },
    elevation: {
      control: { type: "select" },
      options: ["none", "low", "medium", "high"],
      description: "Shadow elevation level.",
    },
    rounded: {
      control: { type: "select" },
      options: ["none", "sm", "md", "lg", "xl", "full"],
      description: "Border radius variant.",
    },
    dismissible: {
      control: "boolean",
      description: "Whether the alert can be dismissed by the user.",
    },
    autoHideDuration: {
      control: "number",
      description: "Auto-hide timeout in milliseconds.",
    },
    icon: {
      control: "boolean",
      description: "Whether to show default icon for the variant.",
    },
    onDismiss: {
      action: "onDismiss",
      description: "Callback fired when the alert is dismissed.",
    },
  },
  args: {
    onDismiss: fn(),
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic alert with title and description
export const Default: Story = {
  args: {},
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>
        This is a default alert with a title and description. It provides neutral information to the user.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic alert component with title and description.",
      },
    },
  },
};


// All variants
export const Variants: Story = {
  render: (args: React.ComponentProps<typeof Alert>) => (
    <div className="space-y-4 ">
      <Alert {...args} variant="default">
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>Neutral information that doesn't require immediate action.</AlertDescription>
      </Alert>
      <Alert {...args} variant="default-flat">
        <AlertTitle>Default Flat Alert</AlertTitle>
        <AlertDescription>Neutral information that doesn't require immediate action.</AlertDescription>
      </Alert>
      <Alert {...args} variant="success">
        <AlertTitle>Success Alert</AlertTitle>
        <AlertDescription>Operation completed successfully.</AlertDescription>
      </Alert>
        <Alert {...args} variant="success-flat">
        <AlertTitle>Success Flat Alert</AlertTitle>
        <AlertDescription>Operation completed successfully.</AlertDescription>
      </Alert>
      <Alert {...args} variant="warning">
        <AlertTitle>Warning Alert</AlertTitle>
        <AlertDescription>Caution: This action may have unintended consequences.</AlertDescription>
      </Alert>
       <Alert {...args} variant="warning-flat">
        <AlertTitle>Warning Alert Flat</AlertTitle>
        <AlertDescription>Caution: This action may have unintended consequences.</AlertDescription>
      </Alert>
      <Alert {...args} variant="info">
        <AlertTitle>Info Alert</AlertTitle>
        <AlertDescription>Here's some additional information you might find useful.</AlertDescription>
      </Alert>
      <Alert {...args} variant="info-flat">
        <AlertTitle>Info Alert</AlertTitle>
        <AlertDescription>Here's some additional information you might find useful.</AlertDescription>
      </Alert>
      <Alert {...args} variant="error">
        <AlertTitle>Error Alert</AlertTitle>
        <AlertDescription>Something went wrong. Please try again or contact support.</AlertDescription>
      </Alert>
      <Alert {...args} variant="error-flat">
        <AlertTitle>Error Alert</AlertTitle>
        <AlertDescription>Something went wrong. Please try again or contact support.</AlertDescription>
      </Alert>
     
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available alert variants for different types of messages.",
      },
    },
  },
};

// Different sizes
export const Sizes: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <Alert {...args} size="sm">
        <AlertTitle>Small Alert</AlertTitle>
        <AlertDescription>Compact alert for subtle notifications.</AlertDescription>
      </Alert>
      <Alert {...args} size="md">
        <AlertTitle>Medium Alert</AlertTitle>
        <AlertDescription>Standard size alert for most use cases.</AlertDescription>
      </Alert>
      <Alert {...args} size="lg">
        <AlertTitle>Large Alert</AlertTitle>
        <AlertDescription>Prominent alert for important messages that need attention.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different alert sizes for various contexts.",
      },
    },
  },
};

// With icons
export const WithIcons: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <Alert {...args} variant="success" icon={true}>
        <AlertTitle>Success with Icon</AlertTitle>
        <AlertDescription>Your changes have been saved successfully.</AlertDescription>
      </Alert>
      <Alert {...args} variant="error" icon={true}>
        <AlertTitle>Error with Icon</AlertTitle>
        <AlertDescription>Failed to save changes. Please try again.</AlertDescription>
      </Alert>
      <Alert {...args} variant="warning" icon={true}>
        <AlertTitle>Warning with Icon</AlertTitle>
        <AlertDescription>Unsaved changes will be lost if you leave this page.</AlertDescription>
      </Alert>
      <Alert {...args} variant="info" icon={true}>
        <AlertTitle>Info with Icon</AlertTitle>
        <AlertDescription>New features are available in the latest update.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Alerts with automatic icons based on their variant.",
      },
    },
  },
};

// Custom icons
export const CustomIcons: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <Alert {...args} icon={<Icon name="star" />}>
        <AlertTitle>Favorite Added</AlertTitle>
        <AlertDescription>This item has been added to your favorites.</AlertDescription>
      </Alert>
      <Alert {...args} variant="info" icon={<Icon name="help" />}>
        <AlertTitle>Need Help?</AlertTitle>
        <AlertDescription>Check out our documentation or contact support.</AlertDescription>
      </Alert>
      <Alert {...args} variant="warning" icon={<Icon name="schedule" />}>
        <AlertTitle>Scheduled Maintenance</AlertTitle>
        <AlertDescription>System maintenance is scheduled for tonight at 2 AM.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Alerts with custom icons for specific contexts.",
      },
    },
  },
};

// Dismissible alerts
export const Dismissible: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <Alert {...args} variant="success" dismissible={true}>
        <AlertTitle>Task Completed</AlertTitle>
        <AlertDescription>Your task has been completed successfully.</AlertDescription>
      </Alert>
      <Alert {...args} variant="info" dismissible={true}>
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription>A new version is available for download.</AlertDescription>
      </Alert>
      <Alert {...args} variant="warning" dismissible={true}>
        <AlertTitle>Session Expiring</AlertTitle>
        <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Dismissible alerts that users can close manually.",
      },
    },
  },
};

// Auto-hide alerts
export const AutoHide: Story = {
  render: (args) => {
    const [showAlert, setShowAlert] = React.useState(true);

    return (
      <div className="w-[500px]">
        {!showAlert && (
          <Button onClick={() => setShowAlert(true)} className="mb-4">
            Show Auto-Hide Alert
          </Button>
        )}
        {showAlert && (
          <Alert
            {...args}
            variant="success"
            icon={true}
            autoHideDuration={5000}
            onDismiss={() => setShowAlert(false)}
          >
            <AlertTitle>Auto-Hide Alert</AlertTitle>
            <AlertDescription>
              This alert will automatically disappear after 5 seconds.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Alert that automatically hides after a specified duration.",
      },
    },
  },
};

// With actions
export const WithActions: Story = {
  render: (args) => (
      <Alert {...args} className="max-w-md">
      <AlertTitle>Dark mode is now available</AlertTitle>
      <AlertDescription>
        Enable it under your profile settings to get started.
      </AlertDescription>
      <AlertActions>
        <Button size="xs" variant="default">
          Enable
        </Button>
      </AlertActions>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: "Alerts with action buttons for user interaction.",
      },
    },
  },
};

// Elevation variants
export const Elevation: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <Alert {...args} elevation="none">
        <AlertTitle>No Elevation</AlertTitle>
        <AlertDescription>Alert with no shadow.</AlertDescription>
      </Alert>
      <Alert {...args} elevation="low">
        <AlertTitle>Low Elevation</AlertTitle>
        <AlertDescription>Alert with subtle shadow.</AlertDescription>
      </Alert>
      <Alert {...args} elevation="medium">
        <AlertTitle>Medium Elevation</AlertTitle>
        <AlertDescription>Alert with moderate shadow.</AlertDescription>
      </Alert>
      <Alert {...args} elevation="high">
        <AlertTitle>High Elevation</AlertTitle>
        <AlertDescription>Alert with prominent shadow.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different elevation levels for visual hierarchy.",
      },
    },
  },
};

// Rounded variants
export const Rounded: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <Alert {...args} rounded="none">
        <AlertTitle>No Rounding</AlertTitle>
        <AlertDescription>Square corners for a sharp look.</AlertDescription>
      </Alert>
      <Alert {...args} rounded="sm">
        <AlertTitle>Small Rounding</AlertTitle>
        <AlertDescription>Slightly rounded corners.</AlertDescription>
      </Alert>
      <Alert {...args} rounded="lg">
        <AlertTitle>Large Rounding</AlertTitle>
        <AlertDescription>Default rounded corners.</AlertDescription>
      </Alert>
      <Alert {...args} rounded="full">
        <AlertTitle>Fully Rounded</AlertTitle>
        <AlertDescription>Pill-shaped alert.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different border radius options.",
      },
    },
  },
};

// Complex notification example
export const NotificationCenter: Story = {
  render: (args) => (
    <div className="space-y-3 w-[600px]">
      <Alert {...args} variant="success" icon={true} dismissible={true}>
        <AlertTitle>{notificationExamples.success.title}</AlertTitle>
        <AlertDescription>{notificationExamples.success.description}</AlertDescription>
        <AlertActions>
          {notificationExamples.success.actions.map((action) => (
            <Button key={action} variant="ghost" size="sm">
              {action}
            </Button>
          ))}
        </AlertActions>
      </Alert>

      <Alert {...args} variant="error" icon={true} dismissible={true}>
        <AlertTitle>{notificationExamples.error.title}</AlertTitle>
        <AlertDescription>{notificationExamples.error.description}</AlertDescription>
        <AlertActions>
          {notificationExamples.error.actions.map((action) => (
            <Button key={action} variant="ghost" size="sm">
              {action}
            </Button>
          ))}
        </AlertActions>
      </Alert>

      <Alert {...args} variant="warning" icon={true} dismissible={true}>
        <AlertTitle>{notificationExamples.warning.title}</AlertTitle>
        <AlertDescription>{notificationExamples.warning.description}</AlertDescription>
        <AlertActions>
          {notificationExamples.warning.actions.map((action) => (
            <Button key={action} variant="ghost" size="sm">
              {action}
            </Button>
          ))}
        </AlertActions>
      </Alert>

      <Alert {...args} variant="info" icon={true} dismissible={true}>
        <AlertTitle>{notificationExamples.info.title}</AlertTitle>
        <AlertDescription>{notificationExamples.info.description}</AlertDescription>
        <AlertActions>
          {notificationExamples.info.actions.map((action) => (
            <Button key={action} variant="ghost" size="sm">
              {action}
            </Button>
          ))}
        </AlertActions>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complex notification center example with multiple alert types and actions.",
      },
    },
  },
};

// Toast-style alerts
export const ToastStyle: Story = {
  render: (args) => (
    <div className="space-y-2 w-[400px]">
      <Alert {...args} variant="success" size="sm" elevation="medium" rounded="lg" icon={true}>
        <AlertTitle>File uploaded</AlertTitle>
        <AlertDescription>Document.pdf has been uploaded successfully.</AlertDescription>
      </Alert>

      <Alert {...args} variant="error" size="sm" elevation="medium" rounded="lg" icon={true} dismissible={true}>
        <AlertTitle>Upload failed</AlertTitle>
        <AlertDescription>Network error. Please try again.</AlertDescription>
      </Alert>

      <Alert {...args} variant="info" size="sm" elevation="medium" rounded="lg" icon={true} autoHideDuration={4000}>
        <AlertTitle>Saving...</AlertTitle>
        <AlertDescription>Your changes are being saved automatically.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Toast-style alerts optimized for notifications and status updates.",
      },
    },
  },
};

// Form validation alerts
export const FormValidation: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email Address</label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-destructive/20 rounded-md bg-destructive/5"
          placeholder="Enter your email"
        />
        <Alert {...args} variant="error" size="sm" rounded="md">
          <AlertDescription>Please enter a valid email address.</AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-warning/20 rounded-md bg-warning/5"
          placeholder="Enter your password"
        />
        <Alert {...args} variant="warning" size="sm" rounded="md">
          <AlertDescription>Password must be at least 8 characters long.</AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-success/20 rounded-md bg-success/5"
          placeholder="Confirm your password"
        />
        <Alert {...args} variant="success" size="sm" rounded="md">
          <AlertDescription>Passwords match!</AlertDescription>
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Form validation alerts integrated with form fields.",
      },
    },
  },
};

// Status dashboard
export const StatusDashboard: Story = {
  render: (args) => (
    <div className="space-y-4 w-[600px]">
      <Alert {...args} variant="success" icon={true} elevation="low">
        <AlertTitle>System Status: Operational</AlertTitle>
        <AlertDescription>
          All systems are running normally. Last checked: 2 minutes ago.
        </AlertDescription>
        <AlertActions>
          <Button variant="ghost" size="sm">View Details</Button>
          <Button variant="ghost"  size="sm">Refresh</Button>
        </AlertActions>
      </Alert>

      <Alert {...args} variant="warning" icon={true} elevation="low">
        <AlertTitle>High CPU Usage Detected</AlertTitle>
        <AlertDescription>
          Server CPU usage is at 85%. Consider scaling resources or optimizing performance.
        </AlertDescription>
        <AlertActions>
          <Button variant="ghost" size="sm">View Metrics</Button>
          <Button variant="ghost" size="sm">Optimize</Button>
        </AlertActions>
      </Alert>

      <Alert {...args} variant="info" icon={true} elevation="low">
        <AlertTitle>Scheduled Maintenance</AlertTitle>
        <AlertDescription>
          System maintenance is scheduled for this weekend. Expected downtime: 2 hours.
        </AlertDescription>
        <AlertActions>
          <Button variant="ghost" size="sm">Learn More</Button>
          <Button variant="ghost" size="sm">Subscribe to Updates</Button>
        </AlertActions>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Status dashboard with system health alerts and monitoring information.",
      },
    },
  },
};