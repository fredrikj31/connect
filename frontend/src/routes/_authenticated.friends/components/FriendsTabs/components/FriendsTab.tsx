import { Input } from "@shadcn-ui/components/ui/input";
import { FriendWithProfile } from "../../../../../api/friends/listFriends/listFriends";

interface FriendsTabProps {
  friends: FriendWithProfile[];
}

export const FriendsTab = ({ friends }: FriendsTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Input placeholder="Search..." />
      {friends.map((friend) => {
        return (
          <div key={friend.id} className="flex flex-row items-center gap-4">
            <div className="size-8 rounded-full bg-zinc-500" />
            <span>
              {friend.friend.firstName} {friend.friend.lastName} (@
              {friend.friend.username})
            </span>
          </div>
        );
      })}
    </div>
  );
};
