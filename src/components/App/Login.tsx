import { Box, Button, FlexContainer, H4, Spacing } from "@instabase.com/pollen";
import React, { useState } from "react";
import { INSTACONCURIFY_LOCAL_STORAGE_PREFIX } from "../constants";
import { RoundedFlex, SInput } from "./CreateReport";

type Props = {
  onNextStep: () => void;
};

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
    localStorage.setItem(
      `${INSTACONCURIFY_LOCAL_STORAGE_PREFIX}-user_id`,
      body.user_id
    );
  } catch (e) {
    console.error(e);
  }
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
          type="password"
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
