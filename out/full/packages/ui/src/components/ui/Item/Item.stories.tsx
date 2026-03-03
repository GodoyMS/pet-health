import type { Meta, StoryObj } from "@storybook/react";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from "./Item";
import { Icon } from "../Icon/Icon";
import { Button } from "../Button/Button";
import * as React from "react"

// Sample data for stories
const userData = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Administrator",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Editor",
    status: "Inactive",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    lastActive: "1 week ago",
  },
  {
    id: 3,
    name: "Carol Williams",
    email: "carol@example.com",
    role: "Viewer",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    lastActive: "5 minutes ago",
  },
];

const productData = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
    price: "$299.99",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop",
    inStock: true,
  },
  {
    id: 2,
    name: "Smart Watch",
    description: "Advanced fitness tracking and health monitoring smartwatch.",
    price: "$399.99",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop",
    inStock: false,
  },
  {
    id: 3,
    name: "Laptop Stand",
    description: "Ergonomic aluminum laptop stand for better posture and cooling.",
    price: "$79.99",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop",
    inStock: true,
  },
];

const meta: Meta<typeof Item> = {
  title: "Components/Item",
  component: Item,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible and composable item component for displaying content in lists, cards, or other collections. Supports various layouts, media types, actions, and styling variants.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline", "muted"],
      description: "Visual style variant of the item.",
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm"],
      description: "Size variant of the item.",
    },
    asChild: {
      control: "boolean",
      description: "Render as a child component using Radix Slot.",
    },
  },
  args: {
    variant: "default",
    size: "default",
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic item with title and description
export const Default: Story = {
  args: {},
  render: (args) => (
    <Item {...args}>
      <ItemContent>
        <ItemTitle>Sample Item</ItemTitle>
        <ItemDescription>
          This is a basic item with a title and description. It demonstrates the default layout and styling.
        </ItemDescription>
      </ItemContent>

    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic item component with title and description.",
      },
    },
  },
};

//Item with vertical and horizontal

// Item with icon media
export const WithIcon: Story = {
  args: {},
  render: (args) => (
    <Item {...args}>
      <ItemMedia variant="icon">
        <Icon name="person" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>User Profile</ItemTitle>
        <ItemDescription>
          Manage your personal information, preferences, and account settings.
        </ItemDescription>
      </ItemContent>
    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Item with an icon as media content.",
      },
    },
  },
};

// Item with image media
export const WithImage: Story = {
  args: {},
  render: (args) => (
    <Item {...args}>
      <ItemMedia variant="image">
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="User avatar" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>John Doe</ItemTitle>
        <ItemDescription>
          Software Engineer at Tech Corp. Passionate about React and TypeScript.
        </ItemDescription>
      </ItemContent>
    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Item with an image as media content.",
      },
    },
  },
};

// Item with actions
export const WithActions: Story = {
  args: {},
  render: (args) => (
    <Item {...args}>
      <ItemMedia variant="icon">
        <Icon name="settings" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-sm ">System Settings</ItemTitle>
        <ItemDescription>
          Configure system preferences and application settings.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="sm">
          <Icon name="edit" />
        </Button>
        <Button variant="ghost" size="sm">
          <Icon name="delete" />
        </Button>
      </ItemActions>
    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Item with action buttons for editing and deleting.",
      },
    },
  },
};

// Different variants
export const Variants: Story = {
  render: (args) => (
    <div className="space-y-4 w-[400px]">
      <Item {...args} variant="default">
        <ItemContent>
          <ItemTitle>Default Variant</ItemTitle>
          <ItemDescription>Standard item styling with transparent background.</ItemDescription>
        </ItemContent>
      </Item>
      <Item {...args} variant="outline">
        <ItemContent>
          <ItemTitle>Outline Variant</ItemTitle>
          <ItemDescription>Item with border outline for better definition.</ItemDescription>
        </ItemContent>
      </Item>
      <Item {...args} variant="muted">
        <ItemContent>
          <ItemTitle>Muted Variant</ItemTitle>
          <ItemDescription>Subtle background color for less prominent items.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all available item variants.",
      },
    },
  },
};

// Different sizes
export const Sizes: Story = {
  render: (args) => (
    <div className="space-y-4 w-[400px]">
      <Item {...args} variant="outline" size="default">
        <ItemContent>
          <ItemTitle>Default Size</ItemTitle>
          <ItemDescription>Larger padding and spacing for comfortable reading.</ItemDescription>
        </ItemContent>
         <ItemActions>
          <span className="text-xs text-muted-foreground">3 hours ago</span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </ItemActions>
      </Item>
      <Item {...args} variant="outline"  size="sm">
        <ItemContent>
          <ItemTitle>Small Size</ItemTitle>
          <ItemDescription>Compact layout with reduced padding for dense lists.</ItemDescription>
        </ItemContent>
         <ItemActions>
          <span className="text-xs text-muted-foreground">3 hours ago</span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different item sizes.",
      },
    },
  },
};

// Grouped items
export const GroupedItems: Story = {
  args: {},
  render: (args) => (
    <ItemGroup className="w-[400px]">
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="folder" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Documents</ItemTitle>
          <ItemDescription>Important documents and files.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="image" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Images</ItemTitle>
          <ItemDescription>Photos and graphics collection.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="video_call" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Videos</ItemTitle>
          <ItemDescription>Video files and recordings.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Items grouped together with separators for better organization.",
      },
    },
  },
};

// Item with header and footer
export const WithHeaderFooter: Story = {
  args: {},
  render: (args) => (
    <Item {...args} className="w-[400px]">
      <ItemHeader>
        <ItemTitle>Project Status</ItemTitle>
        <span className="text-xs text-muted-foreground">Updated 2 hours ago</span>
      </ItemHeader>
      <ItemContent>
        <ItemDescription>
          This project is currently in development phase with 75% completion.
          The team is working on final testing and documentation.
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <span className="text-xs text-muted-foreground">3 team members</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">View Details</Button>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      </ItemFooter>
    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Item with header and footer sections for additional context and actions.",
      },
    },
  },
};

// User list example
export const UserList: Story = {
  args: {},
  render: (args) => (
    <ItemGroup className="w-[500px]">
      {userData.map((user, index) => (
        <React.Fragment key={user.id}>
          <Item {...args}>
            <ItemMedia variant="image">
              <img src={user.avatar} alt={`${user.name} avatar`} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{user.name}</ItemTitle>
              <ItemDescription>
                {user.email} • {user.role}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status}
              </span>
              <Button variant="ghost" size="sm">
                <Icon name="more_vert" />
              </Button>
            </ItemActions>
          </Item>
          {index < userData.length - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ItemGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world example of a user list using the Item components.",
      },
    },
  },
};

// Product catalog example
export const ProductCatalog: Story = {
  args: {},
  render: (args) => (
    <ItemGroup className="w-[600px]">
      {productData.map((product, index) => (
        <React.Fragment key={product.id}>
          <Item {...args}>
            <ItemMedia variant="image">
              <img src={product.image} alt={product.name} />
            </ItemMedia>
            <ItemContent>
              <ItemHeader>
                <ItemTitle>{product.name}</ItemTitle>
                <span className="font-semibold text-primary">{product.price}</span>
              </ItemHeader>
              <ItemDescription>{product.description}</ItemDescription>
              <ItemFooter>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.inStock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!product.inStock}>
                    Add to Cart
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icon name="favorite_border" />
                  </Button>
                </div>
              </ItemFooter>
            </ItemContent>
          </Item>
          {index < productData.length - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ItemGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Product catalog example showcasing items with images, pricing, and multiple actions.",
      },
    },
  },
};

// Notification list example
export const NotificationList: Story = {
  args: {},
  render: (args) => (
    <ItemGroup className="w-[500px]">
      <Item {...args} variant="muted">
        <ItemMedia variant="icon">
          <Icon name="notifications" className="text-blue-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>New message received</ItemTitle>
          <ItemDescription>
            You have received a new message from John Doe regarding the project timeline.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <span className="text-xs text-muted-foreground">2 min ago</span>
          <Button variant="ghost" size="sm">
            <Icon name="close" />
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="warning" className="text-yellow-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>System maintenance scheduled</ItemTitle>
          <ItemDescription>
            The system will be undergoing maintenance from 2 AM to 4 AM EST.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <span className="text-xs text-muted-foreground">1 hour ago</span>
          <Button variant="ghost" size="sm">
            Dismiss
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="check_circle" className="text-green-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Task completed successfully</ItemTitle>
          <ItemDescription>
            The database backup has been completed without any errors.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <span className="text-xs text-muted-foreground">3 hours ago</span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Notification list example with different types of notifications and appropriate icons.",
      },
    },
  },
};

// File browser example
export const FileBrowser: Story = {
  args: {},
  render: (args) => (
    <ItemGroup className="w-[500px]">
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="folder" className="text-blue-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Documents</ItemTitle>
          <ItemDescription>12 files • Last modified: Today</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="sm">
            <Icon name="more_vert" />
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="description" className="text-gray-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Annual Report 2023.pdf</ItemTitle>
          <ItemDescription>PDF • 2.4 MB • Modified: 2 days ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="sm">
            <Icon name="download" />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="share" />
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="image" className="text-green-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Vacation Photos</ItemTitle>
          <ItemDescription>Folder • 45 items • Modified: 1 week ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="sm">
            <Icon name="more_vert" />
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item {...args}>
        <ItemMedia variant="icon">
          <Icon name="video_call" className="text-red-500" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Team Meeting.mp4</ItemTitle>
          <ItemDescription>Video • 156 MB • Modified: 3 hours ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="sm">
            <Icon name="play_arrow" />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="download" />
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "File browser example showing different file types with appropriate icons and actions.",
      },
    },
  },
};

// Interactive item with click handler
export const Interactive: Story = {
  args: {},
  render: (args) => (
    <Item
      {...args}
      asChild
      onClick={() => alert('Item clicked!')}
      className="cursor-pointer"
    >
      <button>
        <ItemMedia variant="icon">
          <Icon name="settings" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Clickable Item</ItemTitle>
          <ItemDescription>
            This item is rendered as a button and responds to click events.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Icon name="keyboard_arrow_right" />
        </ItemActions>
      </button>
    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Interactive item rendered as a button with click handling using asChild prop.",
      },
    },
  },
};

// ItemContent orientation variants
export const ContentOrientation: Story = {
  render: (args) => (
    <div className="space-y-4 w-[500px]">
      <Item  {...args} variant="outline" >

        <ItemContent justify="between" align="center" orientation="horizontal">
           <ItemTitle >Horizontal Layout</ItemTitle>
          <ItemDescription className="w-40">
            This is a description for horizontal between layout justify
          </ItemDescription>
        </ItemContent>

      </Item>
      <Item {...args} variant="outline">

        <ItemContent orientation="vertical">
          <ItemTitle>Vertical Layout</ItemTitle>
          <ItemDescription>
            Content stacks vertically with title and description below the media.
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates horizontal and vertical content orientations.",
      },
    },
  },
};

// ItemContent justification variants
export const ContentJustification: Story = {
  render: (args) => (
    <div className="space-y-8">
        <div className="space-y-4 w-[600px]">
            <h3 className="text-lg px-4  font-semibold mb-3">Vertical Orientation (Default) </h3>

            <div className=" rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Justify Start (Default)</h4>
                <Item {...args} variant="outline">
                <ItemContent  orientation="vertical" className="bg-muted/30 p-2 rounded">
                    <ItemTitle>Start </ItemTitle>
                    <ItemDescription>Content is justified </ItemDescription>    
                </ItemContent>
                </Item>
            </div>
            <div className=" p-4">
                <h4 className="text-sm font-medium mb-3">Justify Center</h4>
                <Item {...args} variant="outline">
                <ItemContent align="center" orientation="vertical" className="bg-muted/30 p-2 rounded">
                    <ItemTitle>Center </ItemTitle>
                    <ItemDescription>Content is justified </ItemDescription>
                </ItemContent>
                </Item>
            </div>
            <div className=" rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Justify End </h4>
                <Item {...args} variant="outline">
                <ItemContent align="end" orientation="vertical" className="bg-muted/30 p-2 rounded">
                    <ItemTitle>End </ItemTitle>
                    <ItemDescription>Content is justified </ItemDescription>    
                </ItemContent>
                </Item>
            </div>
        </div>
       <div className="space-y-4 w-[600px]">
             <h3 className="text-lg px-4  font-semibold mb-3">Horizontal Orientation </h3>

            <div className=" rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Justify Start (Default)</h4>
                <Item {...args} variant="outline">
                <ItemContent orientation="horizontal" className="bg-muted/30 p-2 rounded">
                    <ItemTitle>Start </ItemTitle>
                    <ItemDescription>Content is justified </ItemDescription>    
                </ItemContent>
                </Item>
            </div>
            <div className=" p-4">
                <h4 className="text-sm font-medium mb-3">Justify Center</h4>
                <Item {...args} variant="outline">
                <ItemContent justify="center" orientation="horizontal" className="bg-muted/30 p-2 rounded">
                    <ItemTitle>Center </ItemTitle>
                    <ItemDescription>Content is justified </ItemDescription>
                </ItemContent>
                </Item>
            </div>
            <div className=" rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Justify End </h4>
                <Item {...args} variant="outline">
                <ItemContent justify="end" orientation="horizontal" className="bg-muted/30 p-2 rounded">
                    <ItemTitle>End </ItemTitle>
                    <ItemDescription>Content is justified </ItemDescription>    
                </ItemContent>
                </Item>
            </div>
            </div>
        
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different content justification options within the item.",
      },
    },
  },
};

// ItemContent alignment variants
export const ContentAlignment: Story = {
  render: (args) => (
    <div className="space-y-8">
        <div className="space-y-4 w-[600px]">
       <h3 className="text-lg px-4  font-semibold mb-3">Vertical Orientation (Default) </h3>
      <div className=" rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Align Start (Default)</h4>
        <Item {...args} variant="muted">
          <ItemContent justify="start" className=" p-2 rounded min-h-[100px]">
            <ItemTitle>Top Aligned Content</ItemTitle>
            <ItemDescription>Content is aligned to the start (top) of the container.</ItemDescription>
          </ItemContent>
        </Item>
      </div>
      <div className=" rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Align Center</h4>
        <Item {...args} variant="muted">
          <ItemContent justify="center" className=" p-2 rounded min-h-[100px]">
            <ItemTitle>Center Aligned Content</ItemTitle>
            <ItemDescription>Content is aligned to the center of the container.</ItemDescription>
          </ItemContent>
        </Item>
      </div>
      <div className=" rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Align End</h4>
        <Item {...args} variant="muted">
          <ItemContent justify="end" className=" p-2 rounded min-h-[100px]">
            <ItemTitle>Bottom Aligned Content</ItemTitle>
            <ItemDescription>Content is aligned to the end (bottom) of the container.</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </div>

    <div className="space-y-4 w-[600px]">
       <h3 className="text-lg px-4  font-semibold mb-3">Horizontal orientation </h3>
      <div className=" rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Align Start (Default)</h4>
        <Item {...args} variant="muted">
          <ItemContent orientation="horizontal" align="start" className=" p-2 rounded min-h-[100px]">
            <ItemTitle>Top </ItemTitle>
            <ItemDescription>Content </ItemDescription>
          </ItemContent>
        </Item>
      </div>
      <div className=" rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Align Center</h4>
        <Item {...args} variant="muted">
          <ItemContent orientation="horizontal" align="center" className=" p-2 rounded min-h-[100px]">
            <ItemTitle>Center Aligned </ItemTitle>
            <ItemDescription>Content </ItemDescription>
          </ItemContent>
        </Item>
      </div>
      <div className=" rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Align End</h4>
        <Item {...args} variant="muted">
          <ItemContent orientation="horizontal" align="end" className=" p-2 rounded min-h-[100px]">
            <ItemTitle>Bottom Aligned </ItemTitle>
            <ItemDescription>Content </ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </div>

    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different content alignment options within the item.",
      },
    },
  },
};

// Complex layout with vertical content and center alignment
export const VerticalCenteredLayout: Story = {
  args: {},
  render: (args) => (
    <Item {...args} className="w-[300px]">
      <ItemMedia variant="image">
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="Profile" />
      </ItemMedia>
      <ItemContent orientation="vertical" justify="center" align="center" className="text-center">
        <ItemTitle>Centered Vertical Layout</ItemTitle>
        <ItemDescription>
          This content is vertically oriented and centered both horizontally and vertically within its container.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="sm">
          <Icon name="edit" />
        </Button>
      </ItemActions>
    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complex layout example with vertical content orientation, center justification, and center alignment.",
      },
    },
  },
};

// Card-like layout with horizontal content and end alignment
export const CardLayout: Story = {
  args: {},
  render: (args) => (
    <Item {...args} variant="outline" className="w-[400px]">
      <ItemContent orientation="horizontal" justify="start" align="start" className="flex-1">
        <div>
          <ItemTitle>Project Dashboard</ItemTitle>
          <ItemDescription>
            Monitor project progress, team activity, and key metrics in real-time.
          </ItemDescription>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Active</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">On Track</span>
          </div>
        </div>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="sm">
          <Icon name="visibility" />
        </Button>
        <Button variant="ghost" size="sm">
          <Icon name="settings" />
        </Button>
      </ItemActions>
    </Item>
  ),
  parameters: {
    docs: {
      description: {
        story: "Card-like layout using horizontal content orientation with start alignment and additional metadata.",
      },
    },
  },
};

// Responsive layout example
export const ResponsiveLayout: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-4">
      <div className="w-[600px]">
        <h4 className="text-sm font-medium mb-3">Wide Layout (Horizontal)</h4>
        <Item {...args}>
          <ItemMedia variant="icon">
            <Icon name="dashboard" />
          </ItemMedia>
          <ItemContent orientation="horizontal">
            <div>
              <ItemTitle>Analytics Dashboard</ItemTitle>
              <ItemDescription>
                Comprehensive analytics and reporting tools for data-driven insights.
              </ItemDescription>
            </div>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">View</Button>
            <Button variant="ghost" size="sm">Edit</Button>
          </ItemActions>
        </Item>
      </div>
      <div className="w-[300px]">
        <h4 className="text-sm font-medium mb-3">Narrow Layout (Vertical)</h4>
        <Item {...args}>
          <ItemMedia variant="icon">
            <Icon name="dashboard" />
          </ItemMedia>
          <ItemContent orientation="vertical" align="center">
            <ItemTitle>Analytics Dashboard</ItemTitle>
            <ItemDescription className="text-center">
              Comprehensive analytics and reporting tools.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">View</Button>
          </ItemActions>
        </Item>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Responsive layout examples showing how content orientation adapts to different container widths.",
      },
    },
  },
};