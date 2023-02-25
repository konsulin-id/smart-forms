import TaskAltIcon from '@mui/icons-material/TaskAlt';
import React, { useContext, useState } from 'react';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../functions/SaveQrFunctions';
import { LaunchContext } from '../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../App';
import { RendererContext } from '../layouts/renderer/RendererLayout';
import { EnableWhenContext } from '../custom-contexts/EnableWhenContext';
import { OperationItem } from '../components/Nav/ViewerNav/OperationSection';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

function SaveAsFinalOperation() {
  const { fhirClient } = useContext(LaunchContext);
  const { renderer } = useContext(RendererContext);

  const [dialogOpen, setDialogOpen] = useState(false);

  const { response } = renderer;

  const responseWasSaved: boolean = !!response.authored && !!response.author;

  return (
    <>
      <OperationItem
        title="Save as Final"
        icon={<TaskAltIcon />}
        disabled={!responseWasSaved}
        onClick={() => {
          if (!fhirClient) return;
          setDialogOpen(true);
        }}
      />
      <ConfirmSaveAsFinalDialog open={dialogOpen} closeDialog={() => setDialogOpen(false)} />
    </>
  );
}

export interface Props {
  open: boolean;
  closeDialog: () => unknown;
}

function ConfirmSaveAsFinalDialog(props: Props) {
  const { open, closeDialog } = props;
  const { fhirClient, patient, user } = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const responseProvider = useContext(QuestionnaireResponseProviderContext);
  const { renderer, setRenderer } = useContext(RendererContext);
  const enableWhenContext = useContext(EnableWhenContext);

  const [isSaving, setIsSaving] = useState(false);

  const { response } = renderer;

  function handleClose() {
    closeDialog();
  }

  function handleSave() {
    if (!(fhirClient && patient && user)) return;

    setIsSaving(true);
    let responseToSave = JSON.parse(JSON.stringify(response));
    responseToSave = removeHiddenAnswers(
      questionnaireProvider.questionnaire,
      responseToSave,
      enableWhenContext
    );

    responseToSave.status = 'completed';
    saveQuestionnaireResponse(
      fhirClient,
      patient,
      user,
      questionnaireProvider.questionnaire,
      responseToSave
    )
      .then((savedResponse) => {
        responseProvider.setQuestionnaireResponse(savedResponse);
        setRenderer({ response: savedResponse, hasChanges: false });
        setIsSaving(false);
        handleClose();
      })
      .catch((error) => {
        console.error(error);
        handleClose();
      });
  }

  return (
    <Dialog open={open} onClose={handleClose} data-test="dialog-confirm-save">
      <DialogTitle>Confirm save</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Are you sure you want to save this form as final? You won't be able to edit it after."}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isSaving}
          endIcon={isSaving ? <CircularProgress size={20} /> : null}
          onClick={handleSave}>
          Save as final
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveAsFinalOperation;
