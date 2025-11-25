import { Textarea, Field, Label } from "@headlessui/react";
{/*Function need to be added: onSubmit for the user to submit their comment to the backend*/}

const Comment = () => {
    return (
    <form className="w-1/4 mb-2">
        <Field className="flex flex-col">
            <Label className="font-medium">
                Comment
            </Label>
            <Textarea className="border-1 mb-2 rounded-sm p-1" placeholder="Type your comment here"></Textarea>
        </Field>
        <button type="submit" className="bg-blue-500 rounded-lg p-1 text-white hover:bg-blue-400">
            Comment
        </button>
    </form>
);
}

export default Comment
