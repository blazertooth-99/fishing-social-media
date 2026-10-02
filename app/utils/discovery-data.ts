import { StaticImageData } from "next/image";
import Fish1 from "@/assets/image/explore/fish-1.jpg";
import Fish2 from "@/assets/image/explore/fish-2.jpg";



export interface ExplorePost {
  id: number;
  user: string;
  username: string;
  time: string;
  avatar: string | StaticImageData;
  content: string;
  image: string | StaticImageData;
  location: string;
  likes: number;
  comments: number;
}

export const explorePosts: ExplorePost[] = [
  {
    id: 1,
    user: "Jokowi",
    username: "@jokowi",
    time: "1h",
    avatar: "/images/avatar-1.jpg",
    content: "Akhirnya strike juga setelah hampir 3 jam nunggu 😭🎣",
    image: Fish1,
    location: "Waduk Jatiluhur",
    likes: 1240,
    comments: 87,
  },
  {
    id: 2,
    user: "Andi Angler",
    username: "@andiangler",
    time: "3h",
    avatar: "/images/avatar-2.jpg",
    content: "Kalau datang pagi-pagi, spot ini memang beda banget.",
    image: Fish2,
    location: "Situ Patenggang",
    likes: 892,
    comments: 54,
  },
  {
    id: 3,
    user: "Fishing Bro",
    username: "@fishingbro",
    time: "5h",
    avatar: "/images/avatar-3.jpg",
    content: "Teknik casting yang paling efektif buat kondisi air keruh.",
    image: Fish1,
    location: "Sungai Serayu",
    likes: 721,
    comments: 41,
  },
];

export const fishingSpots = [
  {
    id: 1,
    name: "Waduk Jatiluhur",
    location: "Purwakarta, Jawa Barat",
    distance: "12 km",
    rating: 4.8,
    anglers: 342,
    fish: ["Patin", "Nila", "Gabus"],
    image: Fish2,
    description:
      "Salah satu spot favorit untuk freshwater fishing dengan area yang cukup luas.",
    recommended: true,
  },
  {
    id: 2,
    name: "Situ Patenggang",
    location: "Ciwidey, Jawa Barat",
    distance: "27 km",
    rating: 4.6,
    anglers: 186,
    fish: ["Nila", "Mas"],
    image: Fish1,
    description:
      "Spot dengan suasana tenang dan pemandangan yang cocok untuk weekend fishing.",
    recommended: true,
  },
  {
    id: 3,
    name: "Sungai Serayu",
    location: "Banyumas, Jawa Tengah",
    distance: "41 km",
    rating: 4.7,
    anglers: 214,
    fish: ["Baung", "Gabus", "Bawal"],
    image: Fish2,
    description: "Spot sungai dengan berbagai teknik yang bisa digunakan.",
    recommended: false,
  },
  {
    id: 4,
    name: "Waduk Jatiluhur",
    location: "Purwakarta, Jawa Barat",
    distance: "12 km",
    rating: 4.8,
    anglers: 342,
    fish: ["Patin", "Nila", "Gabus"],
    image: Fish2,
    description:
      "Salah satu spot favorit untuk freshwater fishing dengan area yang cukup luas.",
    recommended: true,
  },
  {
    id: 5,
    name: "Waduk Jatiluhur",
    location: "Purwakarta, Jawa Barat",
    distance: "12 km",
    rating: 4.8,
    anglers: 342,
    fish: ["Patin", "Nila", "Gabus"],
    image: Fish2,
    description:
      "Salah satu spot favorit untuk freshwater fishing dengan area yang cukup luas.",
    recommended: true,
  },
  {
    id: 6,
    name: "Waduk Jatiluhur",
    location: "Purwakarta, Jawa Barat",
    distance: "12 km",
    rating: 4.8,
    anglers: 342,
    fish: ["Patin", "Nila", "Gabus"],
    image: Fish2,
    description:
      "Salah satu spot favorit untuk freshwater fishing dengan area yang cukup luas.",
    recommended: true,
  },
];


