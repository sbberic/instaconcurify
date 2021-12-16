import { Button, FlexContainer, H3, Spacing } from "@instabase.com/pollen";
import React from "react";

type Props = {
  file: File;
  onBackClick: () => void;
};

const SelectedFilePreview: React.FC<Props> = ({ file, onBackClick }) => {
  const objectUrl = URL.createObjectURL(file);

  return (
    <FlexContainer
      style={{ flex: 1, border: "1px solid black" }}
      direction="column"
    >
      <FlexContainer
        p={2}
        style={{
          position: "relative",
          minHeight: 60,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onBackClick}
          label="Back"
          style={{ position: "absolute", left: Spacing[2] }}
        />
        <H3 style={{ textAlign: "center" }}>{file.name}</H3>
      </FlexContainer>
      <iframe src={objectUrl} style={{ flex: 1, border: "none" }} />
    </FlexContainer>
  );
};

export default SelectedFilePreview;
