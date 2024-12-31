"use client";
import { Button } from "./ui/button";
import { DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import Actions from "@/lib/server/actions";

export default function SideBarDropdownContent() {
  return (
    <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
      <DropdownMenuItem>
        <Button className="w-full p-2 my-1" asChild>
          <a href={"/account"}>
            <span>Account</span>
          </a>
        </Button>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Button
          variant={"destructive"}
          className="w-full p-2 my-1"
          onClick={() => {
            void Actions.signOut();
          }}
        >
          <span>Sign out</span>
        </Button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
