{/*Functions: CRUD*/}
{/*PostInfo will get replaced by the information from create.tsx*/}
import Image from "next/image";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import PostInfo from "../post/data";
import { useState } from "react";
import Update from "../post/update";
import Delete from "../post/delete";
interface PostData {
  data:PostInfo|null,
  postID: string
}

const Post = ({data, postID}:PostData) => {
  const [clickDelete, setCD] = useState(false);
  const [clickEdit, setCE] = useState(false);
  
  if (!data) {
    return (
        <div className="text-2xl">
            This post does not exist
        </div>
    );
  }

  return (
    <div className = "bg-gray-300 w-1/3 rounded-2xl p-4 mb-2">
      <div className="flex justify-between items-center">
        <div className="text-4xl font-semibold">
          Post Title {data.title}
        </div>

        {/*Dropdown menu for the user to edit their post and delete their post*/}
        {/*Need to add the following functions: onClick to delete and edit*/}
        <Menu>
          <MenuButton className="px-2 py-1 rounded cursor-pointer">
            <BsThreeDots className="text-xl"/>
          </MenuButton>
          <MenuItems anchor="bottom end" className="flex flex-col border-1 rounded-sm text-sm ml-3">
            <MenuItem>
              <button onClick = {() => setCE(true)} className="flex items-center border-b-1 p-1 cursor-pointer">
                <MdEdit/>
                Edit
              </button>
            </MenuItem>
            
            <MenuItem>
              <button onClick = {() => setCD(true)} className="flex items-center text-red-600 p-1 cursor-pointer">
                <MdDelete/>
                Delete
              </button>
            </MenuItem>
          
          </MenuItems>
        </Menu>
      </div>

      {/*Modal for Edit Option using postID={postID}*/}
      {clickEdit && (
        <Update open = {clickEdit} setOpen={setCE} postID={postID}/>
      )}

      {/*Modal for Delete Option*/}
      {clickDelete && (
        <Delete open = {clickDelete} setOpen={setCD} postID={postID}/>
      )}

      <div className="text-sm mb-3">
        Posted by: {data.owner} at {data.time_created}
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-3/4 bg-white aspect-square rounded-lg overflow-hidden">
          <Image src={data.url_for_images || "/images/default-avatar.png"} alt = {"Image goes here"} fill className="object-cover"/>
        </div>
      </div>
      <div className="mt-3 mb-2 font-medium">
          Address: {data.address}
      </div>
      <div className="mb-2 break-words font-medium">
          Description: {data.description}
      </div>
      <div className="mb-2 text-sm font-medium">
          Tags: {data.tags.map(tag => <span key={tag} className="mr-2 bg-blue-400 rounded-xl">{tag}</span>)}
      </div>
    </div>
  );
};
export default Post;
