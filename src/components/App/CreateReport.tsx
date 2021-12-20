import {
  Body,
  Button,
  Card,
  Colors,
  FlexContainer,
  H2,
  H3,
  H4,
  Input,
  Label,
  Select,
  Spacing,
} from "@instabase.com/pollen";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  DEPARTMENTS,
  INSTACONCURIFY_LOCAL_STORAGE_PREFIX,
  LOCATIONS,
} from "../constants";

type Props = {
  onNextStep: (reportId: string) => void;
  flowState: number;
};

type ReportForm = {
  reportName: string;
  reportDate: string;
  businessPurpose: string;
  comment: string;
  department: string;
  location: string;
};

export const RoundedFlex = styled(FlexContainer)`
  border-radius: ${Spacing[2]};
  background-color: ${Colors.WHITE};
  border: 1px solid ${Colors.GRAY[10]};
`;

export const SInput = styled(Input)`
  width: 100%;
`;

async function login(username: string, password: string) {
  try {
    const resp = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const body = await resp.json();
    localStorage.setItem(
      `${INSTACONCURIFY_LOCAL_STORAGE_PREFIX}-auth_token`,
      body.token
    );
  } catch (e) {
    console.error(e);
  }
}

async function createReport(form: ReportForm): Promise<string> {
  try {
    const authToken = localStorage.getItem(
      `${INSTACONCURIFY_LOCAL_STORAGE_PREFIX}-auth_token`
    );
    const userId = localStorage.getItem(
      `${INSTACONCURIFY_LOCAL_STORAGE_PREFIX}-user_id`
    );
    const resp = await fetch("http://localhost:3001/create_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ ...form, userId }),
    });
    const body = await resp.json();
    return body;
  } catch (e) {
    console.error(e);
  }
}

const CreateReport: React.FC<Props> = ({ onNextStep, flowState }) => {
  const [form, setForm] = useState<ReportForm>({
    reportName: "",
    reportDate: "",
    businessPurpose: "",
    comment: "",
    department: "",
    location: "",
  });

  const setValue = (key, value) => {
    setForm((form) => ({ ...form, [key]: value }));
  };

  return (
    <FlexContainer
      alignItems="center"
      justify="center"
      style={{ height: "100%" }}
    >
      <RoundedFlex
        style={{
          height: "700px",
          width: "600px",
          padding: Spacing[5],
          flexDirection: "column",
        }}
      >
        <H2>Create a Report</H2>
        <H4 mt={3} mb={1}>
          Report Name
        </H4>
        <SInput
          value={form.reportName}
          onChange={(e) => setValue("reportName", e.currentTarget.value)}
        />
        <H4 mt={3} mb={1}>
          Report Date
        </H4>
        <SInput
          value={form.reportDate}
          onChange={(e) => setValue("reportDate", e.currentTarget.value)}
        />
        {/* <H4 mt={3} mb={1}>
          Business Purpose
        </H4>
        <SInput
          value={form.businessPurpose}
          onChange={(e) => setValue("businessPurpose", e.currentTarget.value)}
        />
        <H4 mt={3} mb={1}>
          Comment
        </H4>
        <SInput
          value={form.comment}
          onChange={(e) => setValue("comment", e.currentTarget.value)}
        /> */}
        {/* <H4 mt={3} mb={1}>
          Department
        </H4>
        <Select<string>
          items={DEPARTMENTS}
          onItemSelect={(item) => setValue("department", item)}
          selectedItem={form.department}
          filterable={true}
          getDisplayPropsFromItem={(item) => ({
            label: item || "Select an option",
          })}
          itemListPredicate={(query, items) => {
            const lowercaseQuery = query.toLowerCase();
            return items.filter((item) =>
              item.toLowerCase().includes(lowercaseQuery)
            );
          }}
        />
        <H4 mt={3} mb={1}>
          Location
        </H4>
        <Select<string>
          items={LOCATIONS}
          onItemSelect={(item) => setValue("location", item)}
          selectedItem={form.location}
          filterable={true}
          getDisplayPropsFromItem={(item) => ({
            label: item || "Select an option",
          })}
          itemListPredicate={(query, items) => {
            const lowercaseQuery = query.toLowerCase();
            return items.filter((item) =>
              item.toLowerCase().includes(lowercaseQuery)
            );
          }}
        /> */}
        <Button
          mt={3}
          label="Submit"
          onClick={() => {
            createReport(form).then((reportId) => {
              onNextStep(reportId);
            });
          }}
        ></Button>
      </RoundedFlex>
    </FlexContainer>
  );
};

export default CreateReport;
