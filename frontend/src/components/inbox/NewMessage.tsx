"use client";
import { useState } from "react";
import { BiMessageAdd } from "react-icons/bi";
import SendNM from "./SendMessage";

const NewMessage = () => {
  const [clickNM, setNM] = useState(false);
  
  return (
    <div>
      <button onClick = {() => setNM(true)} className="flex flex-row gap-1 border rounded-lg pr-1 pl-1 cursor-pointer">
        <BiMessageAdd className="mt-1 text-xl" />
        New Message
      </button>
      {/*Modal to allow the user to send a new message*/}
      {clickNM && <SendNM open={clickNM} setOpen={setNM} />}
    </div>
  );
};

export default NewMessage;