import type { Meta, StoryObj } from "@storybook/react";


import {Label} from "./Label";
import { Icon } from "../Icon/Icon";

const meta = {
  title: "Components/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className:"min-w-[450px] ",
    children: "Email Adress",
  },
};

export const WithIcon : Story = {
  args: {
    className:"min-w-[450px]",
    children: "Password",
  },
  render: (args) => (
    <div className="grid w-full items-center gap-3">
      <Label
        {...args}
        htmlFor="email"
      >
        <Icon name="lock"  />
        {args.children}
      </Label>
 </div>)
};

