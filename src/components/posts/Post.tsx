import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";

import PostComments from "@/components/posts/PostComments";

type PostProps = {
  id: number;
  title: string;
  content: string | null;
  numComments: number;
};

export default function Post({ id, title, content, numComments }: PostProps) {
  return (
    <Grid item sx={{ width: "50rem" }}>
      <Card variant="outlined">
        <CardHeader title={title} />
        <CardContent>
          <Typography variant="body1">{content}</Typography>
        </CardContent>
        <PostComments postId={id} numComments={numComments} />
      </Card>
    </Grid>
  );
}
