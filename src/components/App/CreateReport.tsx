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
import React, { useState } from "react";
import styled from "styled-components";
import { DEPARTMENTS, LOCATIONS } from "../constants";

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

async function createReport(form: ReportForm): Promise<string> {
  return nanoid();
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
          onChange={(value) => setValue("reportName", value)}
        />
        <H4 mt={3} mb={1}>
          Report Date
        </H4>
        <SInput
          value={form.reportDate}
          onChange={(value) => setValue("reportDate", value)}
        />
        <H4 mt={3} mb={1}>
          Business Purpose
        </H4>
        <SInput
          value={form.businessPurpose}
          onChange={(value) => setValue("businessPurpose", value)}
        />
        <H4 mt={3} mb={1}>
          Comment
        </H4>
        <SInput
          value={form.comment}
          onChange={(value) => setValue("comment", value)}
        />
        <H4 mt={3} mb={1}>
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
        />
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
