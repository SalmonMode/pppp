import type { NextPage } from "next";
import Head from "next/head";

import Landing from "../features/Landing";

const IndexPage: NextPage = () => {
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
