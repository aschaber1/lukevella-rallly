"use client";
import type { Participant, VoteType } from "@rallly/database";
import { cn } from "@rallly/ui";
import { Button } from "@rallly/ui/button";
import { Icon } from "@rallly/ui/icon";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";
import { useToggle } from "react-use";

import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";
import { useParticipants } from "@/components/participants-provider";
import { usePoll } from "@/contexts/poll";
import { useRole } from "@/contexts/role";
import { useTranslation } from "@/i18n/client";

import { ConnectedScoreSummary } from "../score-summary";
import VoteIcon from "../vote-icon";
import { VoteSelector } from "../vote-selector";

export interface PollOptionProps {
  children?: React.ReactNode;
  yesScore: number;
  ifNeedBeScore: number;
  editable?: boolean;
  vote?: VoteType;
  onChange: (vote: VoteType) => void;
  participants: Participant[];
  selectedParticipantId?: string;
  optionId: string;
}

const PollOptionVoteSummary: React.FunctionComponent<{ optionId: string }> = ({
  optionId,
}) => {
  const { t } = useTranslation();
  const { getParticipants } = useParticipants();
  const participantsWhoVotedYes = getParticipants(optionId, "yes");
  const participantsWhoVotedIfNeedBe = getParticipants(optionId, "ifNeedBe");
  const participantsWhoVotedNo = getParticipants(optionId, "no");
  const noVotes =
    participantsWhoVotedYes.length + participantsWhoVotedIfNeedBe.length === 0;
  return (
    <div>
      {noVotes ? (
        <p className="rounded-lg bg-gray-50 p-2 text-center text-gray-500 text-sm">
          {t("noVotes")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-1 space-y-2.5">
            {participantsWhoVotedYes.map(({ name }, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Fix this later
              <div key={i} className="flex">
                <div className="relative mr-2.5 flex size-5 items-center justify-center">
                  <OptimizedAvatarImage size="sm" name={name} />
                  <VoteIcon
                    type="yes"
                    size="sm"
                    className="-translate-x-1.5 absolute bottom-full left-full translate-y-2.5 rounded-full bg-white"
                  />
                </div>
                <div className="truncate text-sm">{name}</div>
              </div>
            ))}
            {participantsWhoVotedIfNeedBe.map(({ name }, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Fix this later
              <div key={i} className="flex">
                <div className="relative mr-2.5 flex size-5 items-center justify-center">
                  <OptimizedAvatarImage size="sm" name={name} />
                  <VoteIcon
                    type="ifNeedBe"
                    size="sm"
                    className="-translate-x-1.5 absolute bottom-full left-full translate-y-2.5 rounded-full bg-white"
                  />
                </div>
                <div className="truncate text-sm"> {name}</div>
              </div>
            ))}
          </div>
          <div className="col-span-1 space-y-2.5">
            {participantsWhoVotedNo.map(({ name }, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Fix this later
              <div key={i} className="flex">
                <div className="relative mr-2.5 flex size-5 items-center justify-center">
                  <OptimizedAvatarImage size="sm" name={name} />
                  <VoteIcon
                    type="no"
                    size="sm"
                    className="-translate-x-1.5 absolute bottom-full left-full translate-y-2.5 rounded-full bg-white"
                  />
                </div>
                <div className="truncate text-sm">{name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PollOption: React.FunctionComponent<PollOptionProps> = ({
  children,
  selectedParticipantId,
  vote,
  onChange,
  editable = false,
  optionId,
}) => {
  const poll = usePoll();
  const showVotes = !!(selectedParticipantId || editable);
  const role = useRole();
  const selectorRef = React.useRef<HTMLButtonElement>(null);
  const [active, setActive] = React.useState(false);
  const [isExpanded, toggle] = useToggle(false);
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Fix this later
    <div
      className={cn("space-y-4 bg-white p-4", {
        "bg-gray-500/5": editable && active,
      })}
      onPointerDown={() => setActive(editable)}
      onPointerUp={() => setActive(false)}
      onPointerOut={() => setActive(false)}
      data-testid="poll-option"
      onClick={() => {
        selectorRef.current?.click();
      }}
    >
      <div className="flex h-7 items-center justify-between gap-x-4">
        <div className="shrink-0">{children}</div>
        <div className="flex items-center gap-x-4">
          {role === "participant" && poll.hideParticipants ? (
            <ConnectedScoreSummary optionId={optionId} />
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
            >
              <ConnectedScoreSummary optionId={optionId} />
              <Icon>
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </Icon>
            </Button>
          )}

          {showVotes ? (
            <div className="relative flex size-7 items-center justify-center">
              {editable ? (
                <VoteSelector
                  ref={selectorRef}
                  value={vote}
                  onChange={onChange}
                />
              ) : (
                <div
                  key={vote}
                  className="flex h-full items-center justify-center"
                >
                  <VoteIcon type={vote} />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      {isExpanded ? <PollOptionVoteSummary optionId={optionId} /> : null}
    </div>
  );
};

export default PollOption;
