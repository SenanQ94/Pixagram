import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { convertFileToUrl } from "@/lib/utils";

type ProfileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  register?: boolean;
};

const ProfileUploader = ({
  fieldChange,
  mediaUrl,
  register = false,
}: ProfileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [file]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  return (
    <div {...getRootProps()} className="flex items-center justify-center">
      <input {...getInputProps()} className="cursor-pointer" />

      <div className="cursor-pointer gap-4 relative inline-block">
        <div className="absolute rounded-full w-9 bg-gray-900 border-4 border-black p-1 m-2 -bottom-4 -right-4">
          <img
            src="/assets/icons/edit.svg"
            width={24}
            height={24}
            alt="edit"
            className="hover:invert-white"
          />
        </div>
        <img
          src={fileUrl || "/assets/icons/profile-placeholder.svg"}
          alt="image"
          className="h-24 w-24 rounded-full object-cover object-top"
        />
      </div>
    </div>
  );
};

export default ProfileUploader;
