import { Input } from "@shadcn-ui/components/ui/input";
import { Button } from "@shadcn-ui/components/ui/button";
import { ReceivedFriendRequest } from "../../../../../api/friends/listReceivedFriendRequests/listReceivedFriendRequests";

interface ReceivedRequestsTabProps {
  receivedFriendRequests: ReceivedFriendRequest[];
  acceptOrDeclineFriendRequest: ({
    requestId,
    status,
  }: {
    requestId: string;
    status: "accepted" | "declined";
  }) => void;
}

export const ReceivedRequestsTab = ({
  receivedFriendRequests,
  acceptOrDeclineFriendRequest,
}: ReceivedRequestsTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Input placeholder="Search..." />
      {receivedFriendRequests.map((receivedFriendRequest) => {
        return (
          <div
            key={receivedFriendRequest.id}
            className="flex flex-row justify-between"
          >
            <div className="flex flex-row gap-4 items-center">
              <div className="size-8 rounded-full bg-zinc-500" />
              <span>
                {receivedFriendRequest.sender.firstName}{" "}
                {receivedFriendRequest.sender.lastName} (@
                {receivedFriendRequest.sender.username})
              </span>
            </div>
            <div className="flex flex-row gap-4">
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={() =>
                  acceptOrDeclineFriendRequest({
                    requestId: receivedFriendRequest.id,
                    status: "accepted",
                  })
                }
              >
                Accept
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={() =>
                  acceptOrDeclineFriendRequest({
                    requestId: receivedFriendRequest.id,
                    status: "declined",
                  })
                }
              >
                Decline
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
