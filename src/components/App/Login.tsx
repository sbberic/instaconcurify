import {
  Box,
  Button,
  FlexContainer,
  H2,
  H4,
  Spacing,
} from "@instabase.com/pollen";
import { env } from "process";
import React, { useState } from "react";
import { RoundedFlex, SInput } from "./CreateReport";

type Props = {
  onNextStep: () => void;
};

async function login(username: string, password: string) {
  const form = new FormData();
  form.append("client_id", process.env.CONCUR_CLIENT_ID);
  form.append("client_secret", process.env.CONCUR_CLIENT_SECRET);
  form.append("grant_type", "password");
  form.append("username", username);
  form.append("password", password);
  const resp = await fetch(
    "https://us.api.concursolutions.com/oauth2/v0/token",
    {
      method: "POST",
      body: form,
    }
  );
  console.log(resp);
}

const Login: React.FC<Props> = ({ onNextStep }) => {
  const [username, setUsername] = useState<string>(null);
  const [password, setPassword] = useState<string>(null);
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
        alignItems="center"
      >
        <Box>
          <img style={{ maxHeight: "200px" }} src="./icon.png" />
        </Box>
        <H4 mt={3} mb={1} style={{ width: "100%" }}>
          Username
        </H4>
        <SInput
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />
        <H4 mt={3} mb={1} style={{ width: "100%" }}>
          Password
        </H4>
        <SInput
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <Button
          mt={3}
          label="Login"
          onClick={() => {
            login(username, password).then(() => {
              onNextStep();
            });
          }}
        ></Button>
      </RoundedFlex>
    </FlexContainer>
  );
};

export default Login;
