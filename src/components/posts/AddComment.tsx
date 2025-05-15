import { Button, Stack, TextField } from "@mui/material";
import { trpcReact } from "@/trpc/trpcReact";
import { useState } from "react";

type AddCommentProps = {
  postId: number;
  onSuccess?: () => void;
};

export default function AddComment({ postId, onSuccess }: AddCommentProps) {
  const [content, setContent] = useState("");

  const addComment = trpcReact.addComment.useMutation({
    onSuccess: () => {
      setContent("");
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComment.mutate({ postId, content });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ p: 2 }}>
        <TextField
          label="Comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={addComment.isError}
          disabled={addComment.isLoading}
          required
          multiline
          rows={3}
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={addComment.isLoading}
          size="small"
        >
          {addComment.isLoading ? "Adding..." : "Add Comment"}
        </Button>
      </Stack>
    </form>
  );
}
