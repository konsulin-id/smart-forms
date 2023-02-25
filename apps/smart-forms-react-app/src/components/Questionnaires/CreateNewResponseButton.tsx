// @mui
import { Button } from '@mui/material';
import React, { useContext, useState } from 'react';
import { SelectedQuestionnaire } from '../../interfaces/Interfaces';
import Iconify from '../Misc/Iconify';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import { WhiteCircularProgress } from '../StyledComponents/Progress.styles';
import { useNavigate } from 'react-router-dom';

interface Props {
  selectedQuestionnaire: SelectedQuestionnaire | null;
  source: 'local' | 'remote';
}

function CreateNewResponseButton(props: Props) {
  const { selectedQuestionnaire, source } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient } = useContext(LaunchContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (!selectedQuestionnaire) return;

    setIsLoading(true);

    // Assign questionnaire to questionnaire provider
    const questionnaireResource = selectedQuestionnaire.resource;
    await questionnaireProvider.setQuestionnaire(
      questionnaireResource,
      source === 'local',
      fhirClient
    );

    // Assign questionnaireResponse to questionnaireResponse provider
    if (questionnaireResource.item && questionnaireResource.item.length > 0) {
      questionnaireResponseProvider.setQuestionnaireResponse(
        createQuestionnaireResponse(questionnaireResource.id, questionnaireResource.item[0])
      );
    }
    navigate('/renderer');

    setIsLoading(false);
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedQuestionnaire?.listItem}
      endIcon={
        isLoading ? (
          <WhiteCircularProgress size={20} />
        ) : (
          <Iconify icon="ant-design:form-outlined" />
        )
      }
      sx={{
        px: 2.5,
        backgroundColor: 'secondary.main',
        '&:hover': {
          backgroundColor: 'secondary.dark'
        }
      }}
      onClick={handleClick}>
      Create response
    </Button>
  );
}

export default CreateNewResponseButton;
