import { StaticImageData } from "next/image";
import Fish1 from "@/assets/image/explore/fish-1.jpg";
import Fish2 from "@/assets/image/explore/fish-2.jpg";

//communites assets
import CommImg1 from "@/assets/image/community/mania-mantap.jpg";
import CommImg2 from "@/assets/image/community/mania-sedih.jpg";
import CommImg3 from "@/assets/image/community/mantap-mania.jpg";

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
];

export interface Communities {
  id: number;
  name: string;
  members: number;
  privacy: string;
  category: string;
  image: string | StaticImageData;
  description: string;
  active: boolean;
  latestPost: {
    user: string;
    content: string;
    time: string;
    comments: number;
  };
}

export const communities: Communities[] = [
  {
    id: 1,
    name: "Fishing Indonesia",
    members: 12800,
    privacy: "Public",
    category: "Fishing Community",
    image: CommImg1,
    description:
      "Tempat berbagi pengalaman, tips, teknik dan hasil tangkapan pemancing Indonesia.",
    active: true,
    latestPost: {
      user: "Rizky",
      content: "Ada yang pernah mancing di sekitar Waduk Jatiluhur minggu ini?",
      time: "15 min ago",
      comments: 32,
    },
  },
  {
    id: 2,
    name: "Casting Mania Indonesia",
    members: 8420,
    privacy: "Public",
    category: "Casting",
    image: CommImg2,
    description: "Komunitas untuk penggemar casting freshwater.",
    active: true,
    latestPost: {
      user: "Budi",
      content: "Sharing setup casting budget 1 jutaan untuk pemula.",
      time: "42 min ago",
      comments: 18,
    },
  },
  {
    id: 3,
    name: "Mancing Mania Jawa Tengah",
    members: 5240,
    privacy: "Public",
    category: "Regional",
    image: CommImg3,
    description:
      "Komunitas pemancing Jawa Tengah untuk berbagi spot dan pengalaman.",
    active: true,
    latestPost: {
      user: "Dimas",
      content: "Besok pagi ada yang mau mancing bareng?",
      time: "1 hour ago",
      comments: 27,
    },
  },
];
