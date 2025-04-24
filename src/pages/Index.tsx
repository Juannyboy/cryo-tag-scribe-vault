
import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TabsContainer } from "@/components/decant/TabsContainer";

const Index = () => {
  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <PageHeader />
      <TabsContainer />
    </div>
  );
};

export default Index;
