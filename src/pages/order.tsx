import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import PageHeader from "@components/ui/page-header";
import OrderInformation from "@components/order/order-information";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";

export default function Order() {
  const router = useRouter();

  const session_id = router.query.session_id;
  if (!session_id) {
    return <></>;
  }

  return (
    <>
      <PageHeader pageHeader="text-page-order" />
      <Container>
        <OrderInformation />
        {/* <Subscription /> */}
      </Container>
    </>
  );
}

Order.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, [
        "common",
        "forms",
        "menu",
        "footer",
      ])),
    },
  };
};
