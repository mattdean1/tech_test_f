import { Stack, Typography, Button } from "@mui/material";

import { trpcReact } from "@/trpc/trpcReact";
import Post from "@/components/posts/Post";

export default function Posts() {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpcReact.getPosts.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) return <Typography>Loading posts...</Typography>;
  if (error && posts.length === 0)
    return <Typography color="error">Error loading posts</Typography>;

  return (
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      {posts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          title={post.title}
          content={post.content}
          numComments={post._count.comments}
        />
      ))}
      {error ? (
        <Typography color="error">Error loading more posts</Typography>
      ) : (
        hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outlined"
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </Button>
        )
      )}
    </Stack>
  );
}
