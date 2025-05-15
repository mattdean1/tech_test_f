"use client";

import { Typography } from "@mui/material";

import Posts from "@/components/posts/Posts";

export default function Home() {
  return (
    <main>
      <Typography variant="h4" component={"h1"}>
        Posts
      </Typography>
      <Posts />
    </main>
  );
}
