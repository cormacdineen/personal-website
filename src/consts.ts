interface SocialLink {
  href: string;
  label: string;
}

interface Site {
  website: string;
  author: string;
  profile: string;
  desc: string;
  title: string;
  ogImage: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  scheduledPostMargin: number;
  showArchives: boolean;
  showBackButton: boolean;
  editPost: {
    enabled: boolean;
    text: string;
    url: string;
  };
  dynamicOgImage: boolean;
  lang: string;
  timezone: string;
}

// Site configuration
export const SITE: Site = {
  website: "https://cormacdineen.page/",
  author: "Cormac Dineen",
  profile: "https://cormacdineen.page/about",
  desc: "PhD student. Blog, photos and recommendations.",
  title: "Cormac Dineen",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 10,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: false,
  showBackButton: false,
  editPost: {
    enabled: false,
    text: "Edit on GitHub",
    url: "",
  },
  dynamicOgImage: true,
  lang: "en",
  timezone: "Europe/London",
};

export const SITE_TITLE = SITE.title;
export const SITE_DESCRIPTION = SITE.desc;

// Navigation links
export const NAV_LINKS: SocialLink[] = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/photography", label: "Photography" },
  { href: "/recommendations", label: "Cultural stew" },
  { href: "/about", label: "About" },
];

// Social media links
export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://github.com/cormacdineen",
    label: "GitHub",
  },
  {
    href: "https://orcid.org/0009-0006-5969-2226",
    label: "ORCID",
  },
  {
    href: "https://www.linkedin.com/in/cormac-dineen-262918149/",
    label: "LinkedIn",
  },
  {
    href: "https://open.spotify.com/user/ncwlzlrq8rzt1ifp08ina5u77",
    label: "Spotify",
  },
  {
    href: "/rss.xml",
    label: "RSS",
  },
];

// Icon map for social media
export const ICON_MAP: Record<string, string> = {
  GitHub: "github",
  ORCID: "orcid",
  LinkedIn: "linkedin",
  RSS: "rss",
  Spotify: "spotify",
  Email: "mail",
};

// Social links for footer (Socials component)
export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/cormacdineen",
    linkTitle: `${SITE.title} on Github`,
    icon: "github",
    active: true,
  },
  {
    name: "ORCID",
    href: "https://orcid.org/0009-0006-5969-2226",
    linkTitle: `${SITE.title} on ORCID`,
    icon: "orcid",
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/cormac-dineen-262918149/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: "linkedin",
    active: true,
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/user/ncwlzlrq8rzt1ifp08ina5u77",
    linkTitle: `${SITE.title} on Spotify`,
    icon: "spotify",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:cormac@cormacdineen.page",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: "mail",
    active: true,
  },
] as const;

// Share links for blog posts
export const SHARE_LINKS = [
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: "twitter",
  },
  {
    name: "BlueSky",
    href: "https://bsky.app/intent/compose?text=",
    linkTitle: `Share this post on BlueSky`,
    icon: "bluesky",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=",
    linkTitle: `Share this post on LinkedIn`,
    icon: "linkedin",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: "whatsapp",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: "facebook",
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: "telegram",
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
    icon: "pinterest",
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: "mail",
  },
] as const;
