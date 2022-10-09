import React from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';

type Props = {
  hideQResponse: boolean;
  toggleHideQResponse: (checked: boolean) => unknown;
  enableWhenStatus: boolean;
  toggleEnableWhenStatus: (checked: boolean) => unknown;
};

function DebugBar(props: Props) {
  const { hideQResponse, toggleHideQResponse, enableWhenStatus, toggleEnableWhenStatus } = props;
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          px: 2,
          py: 0.5
        }}>
        <FormControlLabel
          control={
            <Switch
              onChange={(event) => toggleHideQResponse(event.target.checked)}
              checked={hideQResponse}
            />
          }
          label={<Typography variant="subtitle2">Hide Debug QResponse</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              onChange={(event) => toggleEnableWhenStatus(event.target.checked)}
              checked={enableWhenStatus}
            />
          }
          label={<Typography variant="subtitle2">EnableWhen checks</Typography>}
        />
      </Box>
    </>
  );
}

export default DebugBar;
