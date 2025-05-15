import { Card, CardContent, Typography } from "@mui/material";

type CommentProps = {
  id: number;
  content: string;
};

export default function Comment({ id, content }: CommentProps) {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Typography variant="body2">{content}</Typography>
      </CardContent>
    </Card>
  );
}
