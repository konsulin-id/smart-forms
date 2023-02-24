// @mui
import { FormControlLabel, Switch, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { SourceContext } from '../../layouts/dashboard/DashboardLayout';
import { SelectedQuestionnaireContext } from '../../custom-contexts/SelectedQuestionnaireContext';

interface Props {
  setPage: (page: number) => void;
}
function SourceToggle(props: Props) {
  const { setPage } = props;
  const { source, setSource } = useContext(SourceContext);
  const { clearSelectedQuestionnaire } = useContext(SelectedQuestionnaireContext);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={source === 'remote'}
          onChange={() => {
            setSource(source === 'local' ? 'remote' : 'local');
            clearSelectedQuestionnaire();
            setPage(0);
          }}
        />
      }
      label={
        <Typography variant="subtitle2" textTransform="capitalize">
          {source}
        </Typography>
      }
    />
  );
}

export default SourceToggle;
