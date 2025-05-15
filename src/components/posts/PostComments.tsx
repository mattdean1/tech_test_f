import {
  CardActionArea,
  CardContent,
  Collapse,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { trpcReact } from "@/trpc/trpcReact";

import Comment from "@/components/posts/Comment";
import AddComment from "@/components/posts/AddComment";
import { pluralise } from "@/lib/format";

type PostCommentsProps = {
  postId: number;
  numComments: number;
};

export default function PostComments({
  postId,
  numComments,
}: PostCommentsProps) {
  const [showComments, setShowComments] = useState(false);
  const utils = trpcReact.useUtils();

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpcReact.getComments.useInfiniteQuery(
    {
      postId,
    },
    {
      enabled: showComments,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const comments = data?.pages.flatMap((page) => page.comments) ?? [];
  const dynamicNumComments =
    comments.length === 0 ? numComments : comments.length;

  const handleShowComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentAdded = () => {
    utils.getComments.invalidate({ postId });
  };

  // wont split comments loading into a separate component in case content is unmounted when hidden
  return (
    <>
      <CardActionArea sx={{ p: 1 }} onClick={handleShowComments}>
        <Typography variant="body2" color="text.secondary">
          {dynamicNumComments === 0
            ? "No comments yet - add your take"
            : `${dynamicNumComments} ${pluralise(
                "Comment",
                dynamicNumComments
              )}`}
        </Typography>
      </CardActionArea>
      <Collapse in={showComments}>
        <CardContent>
          <AddComment postId={postId} onSuccess={handleCommentAdded} />
          {isLoading ? (
            <Typography>Loading comments...</Typography>
          ) : error ? (
            <Typography color="error">
              Failed to load comments. Please try again later.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  id={comment.id}
                  content={comment.content}
                />
              ))}
              {hasNextPage && (
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  size="small"
                  sx={{ alignSelf: "center" }}
                >
                  {isFetchingNextPage
                    ? "Loading more..."
                    : "Load More Comments"}
                </Button>
              )}
            </Stack>
          )}
        </CardContent>
      </Collapse>
    </>
  );
}
