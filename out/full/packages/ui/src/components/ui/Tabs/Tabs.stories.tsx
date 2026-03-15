import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent  } from "./Tabs";
import { Icon } from "../Icon/Icon";
import { useState } from "react";
// Sample content for tabs
const tabContent = {
  account: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Account Settings</h3>
      <p className="text-sm text-muted-foreground">
        Manage your account settings and preferences here. You can update your profile information,
        change your password, and configure notification settings.
      </p>
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="user@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="John Doe" />
        </div>
      </div>
    </div>
  ),
  security: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Security Settings</h3>
      <p className="text-sm text-muted-foreground">
        Configure your security preferences, including two-factor authentication,
        password policies, and session management.
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Enable
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Change Password</h4>
            <p className="text-xs text-muted-foreground">Update your password regularly</p>
          </div>
          <button className="px-4 py-2 border rounded-md text-sm">Change</button>
        </div>
      </div>
    </div>
  ),
  notifications: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Preferences</h3>
      <p className="text-sm text-muted-foreground">
        Choose how you want to be notified about important updates, messages, and activities.
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Email Notifications</h4>
            <p className="text-xs text-muted-foreground">Receive updates via email</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Push Notifications</h4>
            <p className="text-xs text-muted-foreground">Get instant notifications</p>
          </div>
          <input type="checkbox" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">SMS Notifications</h4>
            <p className="text-xs text-muted-foreground">Receive text messages</p>
          </div>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  ),
  billing: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Billing & Payments</h3>
      <p className="text-sm text-muted-foreground">
        Manage your subscription, payment methods, and billing history.
      </p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Pro Plan</h4>
              <p className="text-sm text-muted-foreground">$29/month</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Active
            </span>
          </div>
        </div>
        <button className="w-full px-4 py-2 border rounded-md text-sm">
          Update Payment Method
        </button>
        <button className="w-full px-4 py-2 border rounded-md text-sm">
          View Billing History
        </button>
      </div>
    </div>
  ),
};

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible and accessible tabs component built on Radix UI primitives. Supports horizontal and vertical orientations, icons, disabled states, and comprehensive keyboard navigation.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "The default active tab value for uncontrolled tabs.",
    },
    value: {
      control: "text",
      description: "The controlled active tab value.",
    },
    onValueChange: {
      action: "onValueChange",
      description: "Callback fired when the active tab changes.",
    },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
      description: "The orientation of the tabs.",
    },
    dir: {
      control: { type: "select" },
      options: ["ltr", "rtl"],
      description: "The text direction.",
    },
    activationMode: {
      control: { type: "select" },
      options: ["automatic", "manual"],
      description: "How tabs are activated.",
    },
  },
  args: {
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic tabs with simple content
export const Default: Story = {
  args: {
    defaultValue: "account",
  },
  render: (args) => (
    <Tabs {...args} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Account</h3>
          <p className="text-sm text-muted-foreground">
            Make changes to your account here. Click save when you're done.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="security">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Security</h3>
          <p className="text-sm text-muted-foreground">
            Manage your security settings and preferences.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Configure how you receive notifications.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic tabs component with three tabs and simple content.",
      },
    },
  },
};

// Tabs with icons
export const WithIcons: Story = {
  args: {
    defaultValue: "account",
  },
  render: (args) => (
    <Tabs {...args} className="w-[500px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="account">
          <Icon name="person" className="w-4 h-4 mr-2" />
          Account
        </TabsTrigger>
        <TabsTrigger value="security">
          <Icon name="security" className="w-4 h-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Icon name="notifications" className="w-4 h-4 mr-2" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="billing">
          <Icon name="credit_card" className="w-4 h-4 mr-2" />
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">{tabContent.account}</TabsContent>
      <TabsContent value="security">{tabContent.security}</TabsContent>
      <TabsContent value="notifications">{tabContent.notifications}</TabsContent>
      <TabsContent value="billing">{tabContent.billing}</TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs with icons for better visual hierarchy and user experience.",
      },
    },
  },
};

// Vertical tabs
export const Vertical: Story = {
  args: {
    defaultValue: "account",
    orientation: "vertical",
  },
  render: (args) => (
    <Tabs {...args} className="flex-row w-[600px] h-[200px]">
      <TabsList className="flex-col h-full w-[200px] mr-4">
        <TabsTrigger value="account" className="w-full justify-start">
          <Icon name="person" className="w-4 h-4 mr-2" />
          Account
        </TabsTrigger>
        <TabsTrigger value="security" className="w-full justify-start">
          <Icon name="security" className="w-4 h-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications" className="w-full justify-start">
          <Icon name="notifications" className="w-4 h-4 mr-2" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="billing" className="w-full justify-start">
          <Icon name="credit_card" className="w-4 h-4 mr-2" />
          Billing
        </TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="account">{tabContent.account}</TabsContent>
        <TabsContent value="security">{tabContent.security}</TabsContent>
        <TabsContent value="notifications">{tabContent.notifications}</TabsContent>
        <TabsContent value="billing">{tabContent.billing}</TabsContent>
      </div>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Vertical tabs layout, useful for navigation sidebars or settings panels.",
      },
    },
  },
};

// Controlled tabs
export const Controlled: Story = {
  args: {
    value: "account",
  },
  render: (args) => {
    const [activeTab, setActiveTab] = useState("account");
    return (
      <Tabs {...args} value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Account (Controlled)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Current active tab: {activeTab}
            </p>
            <p className="text-sm text-muted-foreground">
              This tab is controlled by external state. The active tab can be changed programmatically.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Security (Controlled)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Current active tab: {activeTab}
            </p>
            <p className="text-sm text-muted-foreground">
              Security settings and preferences.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications (Controlled)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Current active tab: {activeTab}
            </p>
            <p className="text-sm text-muted-foreground">
              Configure notification preferences.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Controlled tabs where the active tab is managed by external state, allowing programmatic control.",
      },
    },
  },
};

// Tabs with disabled state
export const WithDisabled: Story = {
  args: {
    defaultValue: "account",
  },
  render: (args) => (
    <Tabs {...args} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications" disabled>
          Notifications
        </TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Account</h3>
          <p className="text-sm text-muted-foreground">
            Account settings are available.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="security">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Security</h3>
          <p className="text-sm text-muted-foreground">
            Security settings are available.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            This tab is disabled and cannot be accessed.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="billing">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Billing</h3>
          <p className="text-sm text-muted-foreground">
            This tab is disabled and cannot be accessed.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs with disabled states, preventing interaction with certain tabs.",
      },
    },
  },
};

// Tabs with many items (scrollable)
export const ManyTabs: Story = {
  args: {
    defaultValue: "tab1",
  },
  render: (args) => (
    <Tabs {...args} className="w-[600px]">
      <TabsList className="w-full h-auto p-1">
        {Array.from({ length: 10 }, (_, i) => (
          <TabsTrigger key={`tab${i + 1}`} value={`tab${i + 1}`} className="flex-shrink-0">
            Tab {i + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      {Array.from({ length: 10 }, (_, i) => (
        <TabsContent key={`tab${i + 1}`} value={`tab${i + 1}`}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Tab {i + 1} Content</h3>
            <p className="text-sm text-muted-foreground">
              This is the content for Tab {i + 1}. In a real application, this would contain
              relevant information or forms for this section.
            </p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs with many items, demonstrating scrollable behavior when tabs exceed container width.",
      },
    },
  },
};

// Complex enterprise example
export const EnterpriseDashboard: Story = {
  args: {
    defaultValue: "overview",
  },
  render: (args) => (
    <Tabs {...args} className="w-full max-w-4xl">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">
          <Icon name="dashboard" className="w-4 h-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <Icon name="analytics" className="w-4 h-4 mr-2" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="users">
          <Icon name="group" className="w-4 h-4 mr-2" />
          Users
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Icon name="settings" className="w-4 h-4 mr-2" />
          Settings
        </TabsTrigger>
        <TabsTrigger value="reports">
          <Icon name="description" className="w-4 h-4 mr-2" />
          Reports
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg">Total Users</h4>
              <p className="text-2xl font-bold text-primary">12,345</p>
              <p className="text-sm text-muted-foreground">+12% from last month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg">Revenue</h4>
              <p className="text-2xl font-bold text-primary">$45,678</p>
              <p className="text-sm text-muted-foreground">+8% from last month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg">Active Sessions</h4>
              <p className="text-2xl font-bold text-primary">2,456</p>
              <p className="text-sm text-muted-foreground">+5% from last month</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-4">Recent Activity</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="person" className="w-4 h-4" />
                <span>New user registered</span>
                <span className="text-muted-foreground ml-auto">2 minutes ago</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="shopping_cart" className="w-4 h-4" />
                <span>Order #1234 completed</span>
                <span className="text-muted-foreground ml-auto">5 minutes ago</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="notifications" className="w-4 h-4" />
                <span>System maintenance scheduled</span>
                <span className="text-muted-foreground ml-auto">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Detailed analytics and insights for your application.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Traffic Sources</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Direct</span>
                  <span>45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Search</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Social</span>
                  <span>15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Referral</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Device Types</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Desktop</span>
                  <span>60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile</span>
                  <span>35%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tablet</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="users">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Management</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Manage users, roles, and permissions.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="person" className="w-8 h-8" />
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Active
                </span>
                <button className="px-3 py-1 border rounded text-sm">Edit</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="person" className="w-8 h-8" />
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">jane@example.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Pending
                </span>
                <button className="px-3 py-1 border rounded text-sm">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Settings</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Configure system-wide settings and preferences.
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Name</label>
              <input className="w-full px-3 py-2 border rounded-md" defaultValue="My Application" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Language</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="maintenance" />
              <label htmlFor="maintenance" className="text-sm">Enable maintenance mode</label>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="reports">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reports & Exports</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Generate and download various reports.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">User Activity Report</h4>
                <p className="text-sm text-muted-foreground">Last generated: 2 days ago</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                Generate
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Financial Report</h4>
                <p className="text-sm text-muted-foreground">Last generated: 1 week ago</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                Generate
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">System Performance</h4>
                <p className="text-sm text-muted-foreground">Last generated: 3 hours ago</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                Generate
              </button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comprehensive enterprise dashboard example showcasing tabs in a real-world application context with rich content and interactions.",
      },
    },
  },
};