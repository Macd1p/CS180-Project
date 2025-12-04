import Header from "@/components/inbox/header";
import IndividualMessage from "@/components/inbox/IndividualMessage";
const Inbox = () => {

  return (
    <div className="w-full pt-20 px-4 mb-2 space-y-4">
      <Header header = "Inbox"/>
      <IndividualMessage/>
    </div>
  );
};

export default Inbox;