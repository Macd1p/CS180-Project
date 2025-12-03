"use client";
import { Textarea, Field, Label, Input } from "@headlessui/react"
import { useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";

{/*Create is the Post Submission Form*/ }
{/*Maybe add a preview for the user?*/}
const Create = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const receiveTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const receiveImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null; // get the file from the input
    console.log("Selected file:", file); // debug log to check if file is selected
    setImage(file); // set the image state
  };

  const receiveAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const receiveDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const receiveTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value)
  }


  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

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
      console.log(urlImage);

    } catch (error) {
      if (error instanceof Error) {
        setError("Error: " + error.message);
        setSuccess(false);
      }
      else {
        setError("An error has occurred.");
        setSuccess(false);
      }
    }
  }

  //geocoding: Convert address to coordinates
  let lat = null;
  let lng = null;

  try {
    const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: {
        'User-Agent': 'ParkingApp/1.0' //required by nominatim usage policy
      }
    });

    if (geocodeResponse.ok) {
      const geocodeData = await geocodeResponse.json();
      if (geocodeData && geocodeData.length > 0) {
        lat = parseFloat(geocodeData[0].lat);
        lng = parseFloat(geocodeData[0].lon);
      } else {
        setError("Address not found. Please try a more specific address.");
        return;
      }
    } else {
      console.error("Geocoding failed");
      setError("Could not validate address. Please check your internet connection.");
      return;
    }

  } catch (error) {
      console.error("Geocoding error:", error);
      setError("Error validating address.");
      return;
  }


  // postSubmission is the post's info to be sent
  const postSubmission = {title: title.trim(), url_for_images: urlImage, address, description, tags, lat, lng};

  // Posting the post submission to the backend
  try {
    const response = await fetch('/api/parking/spots', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` //use token in header
      },
      body: JSON.stringify(postSubmission)
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "An error regarding fetching has occurred");
      return;
    }

    // Successful submission
    const data = await response.json();
    console.log(data);
    setSuccess(true);

    // Clear the useStates
    setTitle("");
    setImage(null);
    setAddress("");
    setDescription("");
    setTags("");

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
        <form onSubmit={handleSubmit} className="ml-10">
          {/*Create a Post Title*/}
          <div className="font-semibold text-3xl pb-1 underline">
            Create a Post
          </div>

          {/*Title Field*/}
          <Field className="flex flex-col ml-1 pb-2">
            <Label className="font-medium text-lg">
              Title:
            </Label>
            <Input type="text" value={title} onChange={receiveTitle} required className="border w-1/3 pl-1 rounded-lg hover:shadow-md" placeholder="Enter a title" />
          </Field>

          {/*Upload Image File Field*/}
          <Field className="relative flex flex-col ml-1 pb-2">
            <Label className="font-medium text-lg">
              Image File:
            </Label>
            <Input type="file" accept="image/*" onChange={receiveImage} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="border w-1/3 pl-1 rounded-lg cursor-pointer">
              <div className="text-gray-400">
                {/* display the image name if it exists, otherwise show default text */}
                {image ? image.name : "Upload an image"}
              </div>
            </div>
          </Field>

          {/*Address Field*/}
          <Field className="flex flex-col ml-1 pb-2">
            <Label className="font-medium text-lg">
              Address:
            </Label>
            <Input type="text" value={address} onChange={receiveAddress} required className="border w-1/3 pl-1 rounded-lg hover:shadow-md" placeholder="Enter a valid address" />
          </Field>


          {/*Description Field*/}
          <Field className="flex flex-col ml-1 pb-2">
            <Label className="font-medium text-lg">
              Description:
            </Label>
            <Textarea value={description} onChange={receiveDescription} className="border w-1/3 pl-1 rounded-lg hover:shadow-md" placeholder="Type a description" />
          </Field>

          {/*Tags Field*/}
          <Field className="flex flex-col ml-1 pb-2">
            <Label className="font-medium text-lg">
              Tags:
            </Label>
            <Input type="text" value={tags} onChange={receiveTags} className="border w-1/3 pl-1 rounded-lg hover:shadow-md" placeholder="ex: #free #street #paidparking" />
          </Field>

          {/*Submission Button*/}
          <button type="submit" className="bg-blue-500 text-white rounded-lg w-25 mt-2 ml-1 mb-2 cursor-pointer hover:shadow hover:bg-blue-400">
            Create Post
          </button>
          {/*Message for the user to know if the post was submitted*/}
          {success ? (<div className="flex items-center text-green-600 font-medium"> <IoMdCheckmarkCircleOutline /> Successful Posting!</div>) : (error && <div className="flex items-center text-red-600"> <MdErrorOutline /> {error}</div>)}
        </form>
    );
}

export default Create;
