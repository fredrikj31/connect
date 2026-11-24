import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import { Textarea } from "@shadcn-ui/components/ui/textarea";
import { Button } from "@shadcn-ui/components/ui/button";
import { useState } from "react";
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { Post } from "../../components/Post";
import { useCreatePost } from "../../api/posts/createPost/useCreatePost";
import { useListPosts } from "../../api/posts/listPosts/useListPosts";
import { PostSchema } from "../../types/post";

const MAX_POST_CONTENT_LENGTH = 2000;

export const IndexRoute = () => {
  const [content, setContent] = useState<string>("");
  const { toast } = useToast();

  const { data: posts } = useListPosts();
  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();

  const createPostAction = () => {
    const parsed = PostSchema.shape.content.safeParse(content);
    if (!parsed.success) {
      toast({
        title: "Empty post?",
        description: parsed.error.issues[0]?.message ?? "Invalid post",
      });
      return;
    }

    createPost(
      { content: parsed.data },
      {
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Successfully created your post",
            variant: "default",
          });
          setContent("");
        },
      },
    );
  };

  return (
    <div className="flex flex-col mg:gap-7 gap-4">
      {/* Create Post Form */}
      <div className="flex self-center max-w-3xl w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
            <CardDescription>What's currently on your mind?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              maxLength={MAX_POST_CONTENT_LENGTH}
              placeholder="Lorem Ipsum..."
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <span>
              {content.length} of {MAX_POST_CONTENT_LENGTH} characters
            </span>
            <Button onClick={createPostAction} disabled={isCreatingPost}>
              Post
            </Button>
          </CardFooter>
        </Card>
      </div>
      {/* Feed */}
      <div className="flex flex-col self-center max-w-3xl w-full gap-4">
        {posts?.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
