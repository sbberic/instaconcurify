import { InstabaseAPI } from "@instabase.com/api";
import { AppChrome } from "@instabase.com/app-os-kit";
import { Spacing } from "@instabase.com/pollen";
import toast, { ToastContainer } from "@instabase.com/toast";
import { useState } from "react";
import {
  IBFLOWBIN_NAME,
  INSTACONCURIFY_LOCAL_STORAGE_PREFIX,
  PROJECT_PATH,
  REPO_PATH,
} from "../constants";
import CreateReport from "./CreateReport";
import Login from "./Login";
import Review from "./Review";
import SelectFilePage from "./SelectFilePage";
import { SAppContainer } from "./styles";

const Page = {
  Login: 0,
  SelectFiles: 1,
  CreateReport: 2,
  Review: 3,
  Finish: 4,
};

export const FlowState = {
  NotRunning: 0,
  Running: 1,
  Completed: 2,
};

const api = new InstabaseAPI({
  base: process.env.REACT_APP_IB_ROOT,
  accessToken: process.env.REACT_APP_IB_ACCESS_TOKEN,
});
function wait(interval: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
      resolve();
    }, interval);
  });
}

async function runFlow(
  workingDir: string,
  setFlowState: (state: number) => void
) {
  const toastId = toast.loading(`Running flow...`);
  setFlowState(FlowState.Running);
  const runResp = await api.axiosInstance.post("/flow/run_binary_async", {
    binary_path: `${REPO_PATH}/fs/${PROJECT_PATH}/${IBFLOWBIN_NAME}`,
    input_dir: `${workingDir}/input`,
    output_dir: `${workingDir}/output`,
    settings: {
      output_has_run_id: false,
      enable_ibdoc: true,
    },
  });
  const {
    data: {
      data: { job_id },
    },
  } = runResp;
  let done = false;
  while (!done) {
    await wait(2000);
    const {
      data: { cur_status, results },
    } = await api.axiosInstance.get(`/jobs/status?job_id=${job_id}`);
    const { status, curProgress } = JSON.parse(cur_status);
    toast.loading(`Running flow...`, {
      id: toastId,
      progressBar: { percentage: curProgress },
    });
    if (status === "COMPLETE") {
      setFlowState(FlowState.Completed);
      toast.success(`Flow finished successfully!`, { id: toastId });
      return results[0];
    }
  }
}

function App() {
  const [page, setPage] = useState(Page.Login);
  const [flowState, setFlowState] = useState(FlowState.NotRunning);
  const [workingDir, setWorkingDir] = useState<string>();
  const [reportId, setReportId] = useState<string>();
  const [jobId, setJobId] = useState<string>();
  let content = null;
  switch (page) {
    case Page.Login:
      content = (
        <Login
          onNextStep={() => {
            setPage(Page.SelectFiles);
          }}
        />
      );
      break;
    case Page.SelectFiles:
      content = (
        <SelectFilePage
          onNextStep={(mWorkingDir) => {
            setWorkingDir(mWorkingDir);

            setPage(Page.CreateReport);
            runFlow(mWorkingDir, setFlowState).then((result) => {
              setJobId(result.job_id);
            });
          }}
        />
      );
      break;
    case Page.CreateReport:
      content = (
        <CreateReport
          flowState={flowState}
          onNextStep={(reportId: string) => {
            setReportId(reportId);
            setPage(Page.Review);
          }}
        />
      );
      break;
    case Page.Review:
      content = (
        <Review flowState={flowState} jobId={jobId} workingDir={workingDir} />
      );
      break;
  }
  return (
    <AppChrome appName="Instaconcurify" appIcon="./icon.png">
      <SAppContainer
        style={{
          height: "100%",
          margin: "auto",
          padding: Spacing[6],
          boxSizing: "border-box",
        }}
      >
        {content}
      </SAppContainer>
      <ToastContainer />
    </AppChrome>
  );
}

export default App;
