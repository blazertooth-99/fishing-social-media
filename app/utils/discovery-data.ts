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

// NOTE: fishing-spot dummy data removed —
// /fishing-spots now loads live data via lib/api/fishing-spots.ts
// (GET /locations/spots, /bounds, /nearby, /discovery/spots).


