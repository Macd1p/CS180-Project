{/*Functions: CRUD*/}
{/*PostInfo will get replaced by the information from create.tsx*/}
import Image from "next/image";
import {Menu, MenuButton, MenuItems, MenuItem} from "@headlessui/react"
import { BsThreeDots } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
interface PostInfo {
  id?: string,
  title?: string,
  author?: string,
  imageURL?: string,
  address?: string,
  description?: string,
  tags?: string[],
  time_created?: Date,
}

const Post = ({id, title, author, imageURL, address, description, tags, time_created}:PostInfo) => {
  return (
    <div className = "bg-gray-300 w-1/3 rounded-2xl p-4 mb-2">
      <div className="flex justify-between items-center">
        <div className="text-4xl font-semibold">
          Post Title {title}
        </div>

        {/*Dropdown menu for the user to edit their post and delete their post*/}
        {/*Need to add the following functions: onClick to delete and edit*/}
        <Menu>
          <MenuButton className="px-2 py-1 rounded">
            <BsThreeDots className="text-xl"/>
          </MenuButton>
          <MenuItems anchor="bottom end" className="flex flex-col border-1 rounded-sm text-sm ml-3">
            <MenuItem>
              <button className="flex items-center border-b-1 p-1">
                <MdEdit/>
                Edit
              </button>
            </MenuItem>
            <MenuItem>
              <button className="flex items-center text-red-600 p-1">
                <MdDelete/>
                Delete
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      <div className="text-sm mb-3">
        Posted by: {author} at {/*time_created.toLocaleDateString()} at {" "} {time_created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })*/}
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-3/4 bg-white aspect-square rounded-lg overflow-hidden">
          <Image src={imageURL} alt = {title || "Image goes here"} fill className="object-cover"/>
        </div>
      </div>
      <div className="mt-3 mb-2 font-medium">
          Address: {address}
      </div>
      <div className="mb-2 break-words font-medium">
          Description: {description}
      </div>
      <div className="mb-2 text-sm font-medium">
          Tags: {/*{tags.map(tag => <span key={tag} className="mr-2">{tag}</span>)}*/} {/*Works when we can get the info from the user*/}
      </div>
    </div>
  );
};
export default Post;
