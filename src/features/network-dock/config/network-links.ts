export type NetworkId = "github" | "discord" | "x";

export type NetworkLink = {
  id: NetworkId;
  label: string;
  href: string;
};

const DEFAULT_LINKS: NetworkLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: process.env.NEXT_PUBLIC_NETWORK_GITHUB_URL ?? "https://github.com",
  },
  {
    id: "discord",
    label: "Discord",
    href: process.env.NEXT_PUBLIC_NETWORK_DISCORD_URL ?? "",
  },
  {
    id: "x",
    label: "X",
    href: process.env.NEXT_PUBLIC_NETWORK_X_URL ?? "",
  },
];

export function getNetworkLinks(): NetworkLink[] {
  return DEFAULT_LINKS;
}
