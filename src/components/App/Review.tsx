import { InstabaseAPI } from "@instabase.com/api";
import { DocWidget } from "@instabase.com/doc-widget";
import { Box, FlexContainer, H3, H4, Input, List } from "@instabase.com/pollen";
import { camelCase, isObject, transform } from "lodash";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { RoundedFlex } from "./CreateReport";

type Props = {
  workingDir: string;
  jobId: string;
};

type PageLayout = {
  height: number;
  width: number;
  processedImagePath: string;
  thumbnailImagePath: string;
  pageNumber: number;
  image?: any;
};

type ImageProv = {
  boundingPoly: {
    bottomX: number;
    bottomY: number;
    topX: number;
    topY: number;
  };
  index: number;
};

type TextProv = {
  height: number;
  width: number;
  originalStartX: number;
  originalStartY: number;
  outputX: number;
  outputY: number;
};

type Result = {
  key: string;
  value: string;
  provenance: {
    extractedRegions: ImageProv[];
    extractedTextRegions: TextProv[];
  }[];
};

type Record = {
  layout: {
    pageLayouts: PageLayout[];
  };
  outputFilePath: string;
  recordIndex: number;
  results: Result[];
};

const api = new InstabaseAPI({
  base: process.env.REACT_APP_IB_ROOT,
  accessToken: process.env.REACT_APP_IB_ACCESS_TOKEN,
});

export const SInput = styled(Input)`
  width: 100%;
`;
// async function loadFileList(
//   workingDir: string,
//   setFiles: Dispatch<SetStateAction<File[]>>
// ) {
//   const { nodes } = await api.fs.listDir({ full_path: `${workingDir}/output` });
//   const lastStepFolder = nodes
//     .filter((node) => node.type === "folder")
//     .reduce((lastStepName, node) => {
//       const stepNum = parseInt(node.name.split("_")[0].slice(1));
//       const lastStepNum = parseInt(lastStepName.split("_")[0].slice(1));
//       return stepNum > lastStepNum ? node.name : lastStepName;
//     }, "s0");
//   const { nodes: files } = await api.fs.listDir({
//     full_path: `${workingDir}/output/${lastStepFolder}`,
//   });
//   setFiles(
//     files.map((f) => ({
//       path: f.path,
//       name: f.name,
//       displayName: f.name.split(".").slice(0, 2).join("."),
//     }))
//   );
// }

const recursiveTransform = (obj, transformFn) => {
  if (!obj) return false;

  return transform(obj, (result, value, _key) => {
    const key = transformFn(_key);
    result[key] = isObject(value)
      ? recursiveTransform(value, transformFn)
      : value;
    return result;
  });
};
const keysToCamelCase = (obj: any): any => recursiveTransform(obj, camelCase);

const getDisplayName = (filePath: string): string => {
  const pieces = filePath.split("/");
  return pieces[pieces.length - 1].split(".").slice(0, 2).join(".");
};

async function loadResults(
  workingDir: string,
  jobId: string
): Promise<Record[]> {
  const { data: results } = await api.axiosInstance.post<{ records: Record[] }>(
    "flow_binary/results",
    {
      ibresults_path: `${workingDir}/output/batch.ibflowresults`,
      job_id: jobId,
      options: {
        refined_phrases_features: ["provenance_info", "internal_keys"],
        include_page_layouts: true,
        include_checkpoint_results: true,
      },
    }
  );
  return keysToCamelCase(results.records);
}

const Review: React.FC<Props> = ({ workingDir, jobId }) => {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record>();
  useEffect(() => {
    //loadFileList(workingDir, setFiles);
    loadResults(workingDir, jobId).then((results) => {
      results.map((result) => {
        const imageDataPromise = result.layout.pageLayouts.map((layout) => {
          return api.fs.readFile({
            full_path: `/${layout.processedImagePath}`,
          });
        });

        Promise.all(imageDataPromise).then((response) => {
          response.forEach((image, idx) => {
            const buffer = new ArrayBuffer(image.length);
            const int8 = new Uint8Array(buffer);
            for (let i = 0; i < image.length; i++) {
              int8[i] = image.charCodeAt(i);
            }
            const blob = new Blob([buffer], { type: "image/jpeg" });

            const img = URL.createObjectURL(blob);
            console.log(img, blob);
            result.layout.pageLayouts[idx].image = img;
          });

          setRecords(results);
        });
      });
    });
  }, []);

  const docRef = useRef(null);
  const pageImages = selectedRecord?.layout.pageLayouts.map((page) => {
    return {
      image: page.image,
      imageWidth: page.width,
      imageHeight: page.height,
    };
  });

  return (
    <FlexContainer style={{ height: "100%" }}>
      <RoundedFlex ml={4} style={{ flex: 1 }}>
        <List
          style={{ flex: 1 }}
          items={records}
          itemRenderer={(item: Record) => (
            <List.Item
              onClick={() => {
                setSelectedRecord(item);
              }}
            >
              {getDisplayName(item.outputFilePath)}
            </List.Item>
          )}
        ></List>
      </RoundedFlex>

      <RoundedFlex ml={4} style={{ flex: 4 }}>
        {selectedRecord && (
          <DocWidget
            pageImages={pageImages}
            // imageAnnotations={imageAnnotations}
            ref={docRef}
          />
        )}
      </RoundedFlex>
      <RoundedFlex
        ml={4}
        style={{ flex: 2 }}
        alignItems="center"
        justify="center"
        direction="column"
      >
        {selectedRecord ? (
          <>
            {selectedRecord.results
              .filter((r) => !r.key.startsWith("__"))
              .map((r) => {
                return (
                  <Box m={2} width="90%">
                    <H4>{r.key}</H4>
                    <SInput
                      value={r.value}
                      onChange={(e) => {
                        const selectedIndex = records.findIndex(
                          (rec) =>
                            rec.outputFilePath === selectedRecord.outputFilePath
                        );
                        const newRec = { ...records[selectedIndex] };
                        newRec.results.find(
                          (result) => result.key === r.key
                        ).value = e.currentTarget.value;
                        setRecords((oldRecords) => {
                          return [
                            ...oldRecords.slice(0, selectedIndex),
                            newRec,
                            ...oldRecords.slice(selectedIndex + 1),
                          ];
                        });
                      }}
                    />
                  </Box>
                );
              })}
          </>
        ) : (
          <H3>Select a record to begin</H3>
        )}
      </RoundedFlex>
    </FlexContainer>
  );
};

export default Review;
