export type NetworkId = "github" | "discord" | "x";

export type NetworkLink = {
  id: NetworkId;
  label: string;
  href: string;
};

export const NETWORK_LINKS: NetworkLink[] = [
  { id: "github", label: "GitHub", href: "https://github.com/thedev-world" },
  { id: "discord", label: "Discord", href: "" },
  { id: "x", label: "X", href: "" },
];
