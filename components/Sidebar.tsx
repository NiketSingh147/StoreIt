"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}

const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      
      {/* Logo */}
      <Link
        href="/"
        className="storeit-animated-logo hidden lg:flex items-center gap-2"
      >
        <Image
          src="/assets/icons/logo-brand.svg"
          alt="logo icon"
          width={52}
          height={52}
          className="logo-icon"
        />

        <div className="storeit-text">
          <span className="letter">S</span>
          <span className="letter">t</span>
          <span className="letter">o</span>
          <span className="letter">r</span>
          <span className="letter">e</span>
          <span className="letter">I</span>
          <span className="letter">t</span>
        </div>
      </Link>

      {/* Mobile version stays as is */}
      <Link href="/" className="lg:hidden">
        <Image
          src="/assets/icons/logo-brand.svg"
          alt="logo"
          width={52}
          height={52}
        />
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {navItems.map(({ url, name, icon }) => (
            <Link key={name} href={url} className="lg:w-full">
              <li
                className={cn(
                  "sidebar-nav-item",
                  pathname === url && "shad-active"
                )}
              >
                <Image
                  src={icon}
                  alt={name}
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon",
                    pathname === url && "nav-icon-active"
                  )}
                />
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* 🎉 Animated Image */}
      <Image
        src="/assets/images/files-2.png"
        alt="illustration"
        width={506}
        height={418}
        className="w-full sidebar-tilt cursor-pointer"
      />

      {/* User Info */}
      <div className="sidebar-user-info cursor-pointer">
        <Image
          src={avatar}
          alt="Avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize">{fullName}</p>
          <p className="caption">{email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
