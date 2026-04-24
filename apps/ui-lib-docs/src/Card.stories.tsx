import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@widados/ui-lib";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Bordered surface used for auth panels, lists, and other grouped UI in the web app.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Card>Contact item container</Card>,
};

export const ContactRow: Story = {
  name: "Contact row example",
  render: () => (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">Widad Contact</div>
          <div className="mt-2 text-[13px] text-muted-foreground">
            <span className="mr-1.5 rounded-full border border-indigo-500 bg-indigo-100 px-2.5 py-0.5">
              Friends
            </span>
            <span className="rounded-full border border-pink-600 bg-pink-100 px-2.5 py-0.5">
              Family
            </span>
          </div>
        </div>
        <button type="button" className="text-[13px]">
          Edit
        </button>
      </div>
    </Card>
  ),
};
