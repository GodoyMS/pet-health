import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./Combobox";

const countries = [
  { value: "pe", label: "Peru" },
  { value: "co", label: "Colombia" },
  { value: "cl", label: "Chile" },
  { value: "mx", label: "Mexico" },
  { value: "ar", label: "Argentina" },
  { value: "uy", label: "Uruguay" },
];

const meta: Meta<typeof Combobox> = {
  title: "Components/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Searchable Combobox built with @base-ui/react and UI design-system primitives.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;
const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

export const SearchableCountry: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div className="w-[320px]">
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

export const OutlineVariant: Story = {
  render: () => {
    const [value, setValue] = React.useState("pe");
    return (
      <div className="w-[320px]">
        <Combobox
          value={value}
          onValueChange={(nextValue) => setValue(nextValue ?? "")}
        >
          <ComboboxInput placeholder="Select country" showClear />
          <ComboboxContent variant="outline">
            <ComboboxList>
              <ComboboxEmpty>No country found.</ComboboxEmpty>
              <ComboboxGroup>
                {countries.map((option) => (
                  <ComboboxItem key={option.value} value={option.value}>
                    {option.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};

export const WithDisabledItems: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div className="w-[320px]">
        <Combobox
          value={value}
          onValueChange={(nextValue) => setValue(nextValue ?? "")}
        >
          <ComboboxInput placeholder="Search and select..." showClear />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>No results found.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem value="pe">Peru</ComboboxItem>
                <ComboboxItem value="co">Colombia</ComboboxItem>
                <ComboboxItem value="cl" disabled>
                  Chile (disabled)
                </ComboboxItem>
                <ComboboxItem value="mx">Mexico</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },
};
