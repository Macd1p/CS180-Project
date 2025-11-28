"use client";
import {Dialog, DialogTitle, DialogPanel, Description, Textarea, Label, Input, Field} from "@headlessui/react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { useState } from "react";
import { useRouter } from "next/navigation";
interface UpdateModal {
  open: boolean;
  setOpen: (value: boolean) => void;
  postID: string;
}

interface updateInfo {
  title?: string,
  url_for_images?: string,
  description?: string,
  tags?: string,
}

const Update = ({open, setOpen, postID}:UpdateModal) => {
  // api logic for updating a post
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File|null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const receiveTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
  };

  const receiveImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null; // get the file from the input
      console.log("Selected file:", file); // debug log to check if file is selected
      setImage(file); // set the image state
  };

  const receiveDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
  };

  const receiveTags = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTags(e.target.value)
  }

  const handleSave = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        // updateForm is the form to be sent
        const updateForm:updateInfo = {};
        if (title) {
          updateForm.title = title.trim()
        }

        const token = localStorage.getItem('fms_token'); //get token from local storage
        console.log("Current Token:", token); //log token for debugging

        if (!token) { //check if token exists
            setError("You are not logged in. Please log in first."); //set error if no token
            return;
        }

        let urlImage = ""; // we will store the image's url here to be submitted along with the other post's info
        if (image) { // upload image file to Cloudinary
            try { // getting permission to upload the user image to Cloudinary
                const uploadPermission = await fetch('/api/parking/generate-signature', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}` //use token in header
                    }
                });

                if (!uploadPermission.ok) {
                    setError("You do not have permission to upload");
                }

                const { timestamp, signature, cloud_name, api_key } = await uploadPermission.json();

                // image's info that gets uploaded to Cloudinary
                const uploadImage = new FormData();
                uploadImage.append('file', image);
                uploadImage.append('timestamp', timestamp);
                uploadImage.append('signature', signature);
                uploadImage.append('api_key', api_key);

                // Uploading the image to Cloudinary
                const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                    method: 'POST',
                    body: uploadImage
                });

                if (!uploadResponse.ok) {
                    setError("There is an error the uploading your image");
                }

                const imageData = await uploadResponse.json();
                urlImage = imageData.secure_url;
                updateForm.url_for_images = urlImage;
                console.log(urlImage);

            } catch (error) {
                if (error instanceof Error) {
                    setError("Error: " + error.message);
                    setSuccess(false);
                    return;
                }
                else {
                    setError("An error has occurred.");
                    setSuccess(false);
                    return;
                }
            }
        }

        if (description) {
          updateForm.description = description
        }

        if (tags) {
          updateForm.tags = tags
        }
        
        // Updating the post using PUT to the backend
        try {
            const response = await fetch(`/api/parking/update-post/${postID}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateForm)
            });

            if (!response.ok) {
                setError("An error regarding fetching has occurred");
                return;
            }

            // Successful submission
            const data = await response.json();
            console.log(data);
            setSuccess(true);

            // Clear the useStates
            setTitle("");
            setImage(null);
            setDescription("");
            setTags("");
            setTimeout(() => {router.push('/post');}, 2000);

        } catch (error) { // fail to submit the form
            if (error instanceof Error) {
                setError("Error: " + error.message);
                setSuccess(false);
            }
            else {
                setError("An error has occurred.");
                setSuccess(false);
            }
        }
        
    };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
            <DialogPanel className="border bg-white p-5 space-y-2 w-100">
              <DialogTitle className="font-semibold text-xl">
                Edit Post
            </DialogTitle>
            <Description className="text-sm">
              Enter the changes you want to make to your post below
            </Description>
            <form onSubmit={handleSave}>
              <Field className="flex flex-col mb-2">
                  <Label className="font-medium">
                      New Title
                  </Label>
                  <Input type="text" value = {title} onChange={receiveTitle} className="border pl-1 hover:shadow-md border-gray-500 rounded-md cursor-pointer"/>
              </Field>

              <Field className="relative flex flex-col mb-2">
                  <Label className="font-medium">
                      New Image:
                  </Label>
                  <Input type="file" accept = "image/*" onChange={receiveImage} className="absolute inset-0 opacity-0"/>
                  <div className="border pl-1 hover:shadow-md border-gray-500 rounded-md cursor-pointer">
                    <div className="text-gray-400 cursor-pointer">
                        {image ? image.name : "Upload an image"}
                    </div>
                </div>
              </Field>

              <Field className="flex flex-col mb-2">
                  <Label className="font-medium">
                      New Description:
                  </Label>
                  <Textarea onChange={receiveDescription} value = {description} className="border pl-1 hover:shadow-md border-gray-500 rounded-md cursor-pointer"/>
              </Field>

              <Field className="flex flex-col mb-2">
                  <Label className="font-medium">
                      New Tags:
                  </Label>
                  <Input type="text" onChange={receiveTags} value = {tags} className="border pl-1 mb-2 hover:shadow-md border-gray-500 rounded-md cursor-pointer" placeholder="ex: #free #street"/>
              </Field>

                <div className="flex gap-4 cursor-pointer">
                  <button type = "button" onClick={() => setOpen(false)} className="cursor-pointer hover:text-gray-500">
                      Cancel
                  </button>
                  <button type = "submit" className="bg-blue-600 text-white cursor-pointer hover:bg-blue-500 pl-2 pr-2 rounded-lg">
                      Save
                  </button>
                  {/*Message for the user to know if the post was updated*/}
                  {success ? (<div className="flex items-center text-green-600 font-medium"> <IoMdCheckmarkCircleOutline/> Successful Update!</div>) : (error && <div className="flex items-center text-red-600"> <MdErrorOutline/> Error: {error}</div>)}
                </div>
              </form>
            </DialogPanel>
          </div>
    </Dialog>
  );
}

export default Update;
