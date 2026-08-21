import { StaticImageData } from "next/image";

/* feed assets */
import Post1 from "@/assets/image/feed/post1.jpg";
import Post2 from "@/assets/image/feed/post2.jpg";
import Post3 from "@/assets/image/feed/post3.jpg";

export interface NavLink {
  name: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { name: "Home", href: "#home" },
  { name: "Filosofi", href: "#filosofi" },
  { name: "Peralatan", href: "#peralatan" },
  { name: "Spot Terbaik", href: "#destinasi" },
];

export const loadingStatus = [
  "Menghubungkan ke server...",
  "Mengunduh aset visual...",
  "Menyusun tata letak...",
  "Mengoptimalkan performa...",
  "Hampir siap...",
  "Selesai!",
];

export interface FishingPostProps {
  id?: number;
  user: string;
  username: string;
  time: string;
  location: string;
  fish: string;
  technique: string;
  image: string | StaticImageData;
  likes: number;
  comments: number;
  content: string;
}

export type MobileFishingPost = FishingPostProps;

export const fishingPostProps: FishingPostProps[] = [
  {
    id: 1,
    user: "Andi Pratama",
    username: "@andipratama",
    time: "1h",
    location: "Waduk Jatiluhur",
    fish: "Giant Snakehead",
    technique: "Casting",
    image: Post1,
    likes: 28,
    comments: 2,
    content:
      "What an amazing morning on the water! 🎣 Finally landed this beauty after almost an hour of fighting.",
  },
  {
    id: 2,
    user: "Rizky Angler",
    username: "@rizkyangler",
    time: "3h",
    location: "Pantai Baron",
    fish: "Giant Trevally",
    technique: "Popping",
    image: Post2,
    likes: 67,
    comments: 33,
    content: "Another great day out on the water! 🎣",
  },
  {
    id: 3,
    user: "Bima Fishing",
    username: "@bimafishing",
    time: "5h",
    location: "Sungai Progo",
    fish: "Barramundi",
    technique: "Lure Fishing",
    image: Post3,
    likes: 92,
    comments: 300,
    content: "Woilah cik mantap kali spotnya",
  },
];

export interface FishingPostDataFeed {
  post: FishingPostProps;
  variant?: "desktop" | "mobile";
}

export const profileData = {
  name: "Christian Angler",
  username: "@christianangler",
  bio: "Chasing fish, finding spots, and sharing the stories 🎣",
  followers: 33,
  following: 11,

  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",

  cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
};
