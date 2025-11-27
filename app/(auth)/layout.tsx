import React from "react";
import Image from "next/image";
import AnimatedLogo from "@/components/AnimatedLogo";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE (Desktop) */}
      <section className="hidden w-1/2 items-center justify-center bg-brand p-10 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">

          {/* 🔥 Animated Logo - SAME AS SIDEBAR BUT VISUALLY BIGGER */}
          <div className="flex justify-center mb-10">
            <div className="scale-150">     {/* only scales visually, same animation */}
              <AnimatedLogo color="white" /> 
              
              {/* <AnimatedLogo size={52} textSize="text-5xl" /> */}

            </div>
          </div>

          <div className="space-y-5 text-white">
            <h1 className="h1">Manage your files in the best way</h1>
            <p className="body-1">
              This is a place where you can store all your documents.
            </p>
          </div>

          <Image
            src="/assets/images/files.png"
            alt="Files"
            width={342}
            height={342}
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      {/* RIGHT SIDE (Form) */}
      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">

        {/* 🔥 Mobile Same Animation */}
        <div className="mb-16 lg:hidden">
          <AnimatedLogo size="medium" />
        </div>

        {children}
      </section>
    </div>
  );
};

export default Layout;
