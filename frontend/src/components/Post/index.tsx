import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@shadcn-ui/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@shadcn-ui/components/ui/card";
import { Link } from "react-router";
import {
  Heart,
  MessageSquareText,
  ThumbsUp,
  EllipsisVertical,
  Trash2,
} from "lucide-react";
import { formatRelative } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shadcn-ui/components/ui/popover";
import { Button } from "@shadcn-ui/components/ui/button";
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { PostWithProfile } from "../../api/posts/listPosts/listPosts";
import { useDeletePost } from "../../api/posts/deletePost/useDeletePost";
import { useAuth } from "../../providers/auth";
import { config } from "../../config";

interface PostProps {
  post: PostWithProfile;
}

export const Post = ({ post }: PostProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: deletePost } = useDeletePost();

  const initials =
    `${post.user.firstName[0] ?? ""}${post.user.lastName[0] ?? ""}`.toUpperCase();

  const deletePostAction = () => {
    deletePost(
      { postId: post.id },
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
            description: "Successfully deleted your post",
            variant: "default",
          });
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2">
          <Avatar className="size-10">
            <AvatarImage
              className="object-cover"
              src={`${config.assets.baseUrl}/profiles/${post.user.userId}`}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              to={`/profile/${post.user.username}`}
              className="font-semibold text-base hover:text-zinc-300"
            >
              {post.user.firstName} {post.user.lastName} (@{post.user.username})
            </Link>
            <span className="text-sm text-zinc-400">
              {formatRelative(post.createdAt, new Date(), {
                weekStartsOn: 1,
              })}
            </span>
          </div>
        </div>
        {user?.id === post.user.userId && (
          <Popover>
            <PopoverTrigger>
              <EllipsisVertical />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2 w-fit !p-2">
              <Button
                className="size-10"
                variant={"destructive"}
                title="Delete"
                onClick={deletePostAction}
              >
                <Trash2 />
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>{post.content}</p>
        <div className="flex flex-row justify-evenly gap-4 w-full flex-wrap">
          <img
            className="size-full rounded-lg aspect-video flex-[1_0_40%]"
            src="https://placehold.co/250x140"
          />
          <img
            className="size-full rounded-lg aspect-video flex-[1_0_40%]"
            src="https://placehold.co/250x140"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <button className="group">
            <ThumbsUp className="size-6 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
          </button>
          <button className="group">
            <Heart className="size-6 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
          </button>
        </div>
        <Link to={`/post/uggabugga`} className="group flex flex-row gap-2">
          <MessageSquareText className="size-6 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
          <span className="group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            2 comments
          </span>
        </Link>
      </CardFooter>
    </Card>
  );
};
