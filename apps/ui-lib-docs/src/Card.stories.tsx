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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Widad Contact</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
            <span
              style={{
                marginRight: 6,
                padding: "2px 10px",
                borderRadius: 999,
                background: "#e0e7ff",
                border: "1px solid #6366f1",
              }}
            >
              Friends
            </span>
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 999,
                background: "#fce7f3",
                border: "1px solid #db2777",
              }}
            >
              Family
            </span>
          </div>
        </div>
        <button type="button" style={{ fontSize: 13 }}>
          Edit
        </button>
      </div>
    </Card>
  ),
};
