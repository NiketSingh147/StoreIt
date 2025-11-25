"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { signOutUser } from "@/lib/actions/user.actions";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={userId} accountId={accountId} />

        {/* Logout Button (opens dialog) */}
        <Button
          type="button"
          className="sign-out-button"
          onClick={() => setOpen(true)}
        >
          <Image
            src="/assets/icons/logout.svg"
            alt="logo"
            width={24}
            height={24}
            className="w-6"
          />
        </Button>

        {/* Confirmation Dialog */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to logout?
              </AlertDialogTitle>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Yes, Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
};

export default Header;



// import React from "react";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import Search from "@/components/Search";
// import FileUploader from "@/components/FileUploader";
// import { signOutUser } from "@/lib/actions/user.actions";

// const Header = ({
//   userId,
//   accountId,
// }: {
//   userId: string;
//   accountId: string;
// }) => {
//   return (
//     <header className="header">
//       <Search />
//       <div className="header-wrapper">
//         <FileUploader ownerId={userId} accountId={accountId} />
//         <form
//           action={async () => {
//             "use server";

//             await signOutUser();
//           }}
//         >
//           <Button type="submit" className="sign-out-button">
//             <Image
//               src="/assets/icons/logout.svg"
//               alt="logo"
//               width={24}
//               height={24}
//               className="w-6"
//             />
//           </Button>
//         </form>
//       </div>
//     </header>
//   );
// };
// export default Header;
