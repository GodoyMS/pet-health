import type { Meta, StoryObj } from "@storybook/react-vite";


import {Input} from "./Input";
import { Icon } from "../Icon/Icon";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],

} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Email address",
    title: "Write your email",
    className:"min-w-[450px]"
  },
};

export const WithIconLeft: Story = {
  args: {
    placeholder: "Email address",
    title: "Write your email",
    className:"min-w-[450px]",
    iconLeft:<Icon name="search" className="text-blue"/>
  },
};
export const WithIconRight: Story = {
  args: {
    placeholder: "Email address",
    title: "Write your email",
    className:"min-w-[450px]",
    iconRight:<Icon name="search" className="text-blue"/>
  },
};

export const InputPassword: Story = {
  args: {
    placeholder: "Password",
    title: "Write your password",
    className:"min-w-[450px]",
    type:"password",
  },
};


