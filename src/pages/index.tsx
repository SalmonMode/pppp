import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import type { NextPage } from "next";
import Head from "next/head";

import Landing from "../service/features/Landing";

const IndexPage: NextPage = (): EmotionJSX.Element => {
  return (
    <div>
      <Head>
        <title>PPPP</title>
      </Head>
      <Landing />
    </div>
  );
};

export default IndexPage;
