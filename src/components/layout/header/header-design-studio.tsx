import React, { useRef } from "react";
import { siteSettings } from "@settings/site-settings";
import Logo from "@components/ui/logo";
import { useUI } from "@contexts/ui.context";
import { ROUTES } from "@utils/routes";
import { addActiveScroll } from "@utils/add-active-scroll";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";
import Link from "@components/ui/link";
import HomeIcon from "@components/icons/home-icon";
import UserIcon from "@components/icons/user-icon";

const AuthMenu = dynamic(() => import("./auth-menu"), { ssr: false });
const CartButton = dynamic(() => import("@components/cart/cart-button"), {
  ssr: false,
});

type DivElementRef = React.MutableRefObject<HTMLDivElement>;

const Header = ({
  onClickProduct,
  onClickNext,
}: {
  onClickProduct: () => void;
  onClickNext: () => void;
}) => {
  const { openModal, setModalView, isAuthorized } = useUI();
  const { t } = useTranslation("common");
  const siteHeaderRef = useRef() as DivElementRef;
  addActiveScroll(siteHeaderRef);

  function handleLogin() {
    setModalView("LOGIN_VIEW");
    return openModal();
  }

  return (
    <header
      id="siteHeader"
      ref={siteHeaderRef}
      className="w-full h-12 relative z-20"
    >
      <div className="innerSticky text-gray-700 body-font bg-white w-full h-12 z-20 ps-4 lg:ps-6 pe-4 lg:pe-6 transition duration-200 ease-in-out">
        <div className="flex items-center justify-center mx-auto max-w-[1920px] h-full w-full">
          <Logo className="hidden md:inline-flex" />

          <Link href="/" className="md:hidden flex-shrink-0">
            <HomeIcon />
          </Link>

          <div className="flex justify-end items-center space-s-6 lg:space-s-5 xl:space-s-8 2xl:space-s-10 ms-auto flex-shrink-0">
            <div className="flex-shrink-0">
              <button
                className="mr-1 text-sm xl:text-base text-heading font-semibold focus:outline-none"
                onClick={onClickProduct}
              >
                Product
              </button>
            </div>
            <div className="flex-shrink-0">
              <button
                className="mr-1 text-sm xl:text-base text-heading font-semibold focus:outline-none"
                onClick={onClickNext}
              >
                <span>Next</span>
              </button>
            </div>
            <div className="flex-shrink-0">
              <AuthMenu
                isAuthorized={isAuthorized}
                href={ROUTES.ACCOUNT}
                className="flex-shrink-0"
                btnProps={{
                  className: "flex-shrink-0 focus:outline-none",
                  children: <UserIcon />,
                  onClick: handleLogin,
                }}
              >
                <UserIcon />
              </AuthMenu>
            </div>
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
