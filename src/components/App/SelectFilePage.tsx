import { InstabaseAPI } from "@instabase.com/api";
import toast from "@instabase.com/toast";
import {
  Box,
  Button,
  Colors,
  FlexContainer,
  H3,
  Icon,
  List,
  Spacing,
} from "@instabase.com/pollen";
import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useDropzone } from "react-dropzone";
import SelectedFilePreview from "./SelectedFilePreview";
import { INPUT_FILE_ROOT_DIR } from "../constants";

type Props = {
  onNextStep: (mWorkingDir: string) => void;
};

const api = new InstabaseAPI({
  base: process.env.REACT_APP_IB_ROOT,
  accessToken: process.env.REACT_APP_IB_ACCESS_TOKEN,
});

async function submit(allFiles: File[]) {
  const uniqWorkingDir = `${nanoid()}`;
  const inputDir = `${INPUT_FILE_ROOT_DIR}/${uniqWorkingDir}/input`;
  await api.fs.mkdir({ full_path: inputDir });
  const posts = allFiles.map(async (f) =>
    api.fs.writeFile({
      username: "travis",
      workspace_name: "my-repo",
      path: `insta-concur-ify/app_results/${uniqWorkingDir}/input/${f.name}`,
      content: await f.arrayBuffer(),
      mime_type: f.type,
      if_exists: "overwrite",
    })
  );

  const workingDirPromise = new Promise<string>((resolve, _) => {
    let count = 0;
    const toastId = toast.loading(`Uploading ${count}/${allFiles.length}`);
    for (let i = 0; i < posts.length; i++) {
      posts[i].then(() => {
        count++;
        if (count === allFiles.length) {
          toast.success("Uploaded all files", { id: toastId });
          resolve(`${INPUT_FILE_ROOT_DIR}/${uniqWorkingDir}`);
        } else {
          toast.loading(`Uploading ${count}/${allFiles.length}`, {
            id: toastId,
          });
        }
      });
    }
  });
  return workingDirPromise;
}

const SelectFilePage: React.FC<Props> = ({ onNextStep }) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [allFiles, setAllFiles] = useState<File[]>([]);

  useEffect(() => {
    setAllFiles((files) => {
      return [...files, ...acceptedFiles];
    });
  }, [acceptedFiles]);

  return (
    <FlexContainer style={{ height: "100%" }}>
      {selectedFile ? (
        <SelectedFilePreview
          file={selectedFile}
          onBackClick={() => {
            setSelectedFile(null);
          }}
        />
      ) : (
        <div
          {...getRootProps({ className: "dropzone" })}
          style={{
            flex: 1,
            border: "8px dashed lightgrey",
            padding: Spacing[2],
            height: "100%",
            textAlign: "center",
          }}
        >
          <input {...getInputProps()} />
          <p>
            {allFiles.length > 0
              ? "Add more files"
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
        </div>
      )}
      <Box
        style={{
          flex: 1,
          marginLeft: Spacing[2],
          border: "1px solid black",
          overflow: "scroll",
          position: "relative",
        }}
      >
        {allFiles.length > 0 && (
          <FlexContainer
            p={2}
            style={{
              position: "sticky",
              top: "0",
              minHeight: 60,
              alignItems: "center",
              justifyContent: "center",
              background: Colors.WHITE,
              width: "100%",
            }}
          >
            <Button
              onClick={() => {
                submit(allFiles).then((mWorkingDir) => {
                  onNextStep(mWorkingDir);
                });
              }}
              label="Submit"
              style={{ position: "absolute", right: Spacing[2] }}
            />
            <H3 style={{ textAlign: "center" }}>{allFiles.length} Files</H3>
          </FlexContainer>
        )}
        <List
          items={allFiles}
          itemRenderer={(file, i) => {
            return (
              <List.Item
                key={file.name}
                onClick={() => {
                  setSelectedFile(file);
                }}
              >
                <List.Item.Details
                  title={file.name}
                  description={`${file.size} bytes`}
                  rightIcon={
                    <Icon
                      icon="trash"
                      color={Colors.GRAY[40]}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAllFiles([
                          ...allFiles.slice(0, i),
                          ...allFiles.slice(i + 1),
                        ]);
                      }}
                    />
                  }
                />
              </List.Item>
            );
          }}
        ></List>
      </Box>
    </FlexContainer>
  );
};

export default SelectFilePage;
