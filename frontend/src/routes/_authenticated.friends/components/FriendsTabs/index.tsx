import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shadcn-ui/components/ui/tabs";
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { useListFriends } from "../../../../api/friends/listFriends/useListFriends";
import { useListSentFriendRequests } from "../../../../api/friends/listSentFriendRequests/useListSentFriendRequests";
import { useListReceivedFriendRequests } from "../../../../api/friends/listReceivedFriendRequests/useListReceivedFriendRequests";
import { useAcceptOrDeclineFriendRequest } from "../../../../api/friends/acceptOrDeclineFriendRequest/useAcceptOrDeclineFriendRequest";
import { useDeleteFriendRequest } from "../../../../api/friends/deleteFriendRequest/useDeleteFriendRequest";
import { ReceivedRequestsTab } from "./components/ReceivedRequestsTab";
import { FriendsTab } from "./components/FriendsTab";
import { SentRequestsTab } from "./components/SentRequestsTab";

export const FriendsTabs = () => {
  const { toast } = useToast();
  const { data: friends } = useListFriends();
  const { data: receivedFriendRequests } = useListReceivedFriendRequests();
  const { data: sentFriendRequests } = useListSentFriendRequests();
  const { mutate: acceptOrDeclineFriendRequest } =
    useAcceptOrDeclineFriendRequest();
  const { mutate: deleteFriendRequest } = useDeleteFriendRequest();

  const onError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message,
    });
  };

  return (
    <Tabs defaultValue="friends">
      <TabsList className="w-full h-fit flex flex-col mg:flex-row ">
        <TabsTrigger className="w-full" value="friends">
          Friends {friends && `(${friends.length})`}
        </TabsTrigger>
        <TabsTrigger className="w-full" value="received">
          Received Requests{" "}
          {receivedFriendRequests && `(${receivedFriendRequests.length})`}
        </TabsTrigger>
        <TabsTrigger className="w-full" value="sent">
          Sent Requests {sentFriendRequests && `(${sentFriendRequests.length})`}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="friends">
        <FriendsTab friends={friends ?? []} />
      </TabsContent>
      <TabsContent value="received">
        <ReceivedRequestsTab
          receivedFriendRequests={receivedFriendRequests ?? []}
          acceptOrDeclineFriendRequest={({ requestId, status }) => {
            acceptOrDeclineFriendRequest({ requestId, status }, { onError });
          }}
        />
      </TabsContent>
      <TabsContent value="sent">
        <SentRequestsTab
          sentFriendRequests={sentFriendRequests ?? []}
          deleteFriendRequest={({ requestId }) => {
            deleteFriendRequest({ requestId }, { onError });
          }}
        />
      </TabsContent>
    </Tabs>
  );
};
