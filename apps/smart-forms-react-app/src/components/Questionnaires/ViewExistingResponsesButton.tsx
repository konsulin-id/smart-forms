// @mui
import { Button } from '@mui/material';
import React, { useContext, useMemo, useState } from 'react';
import Iconify from '../Iconify';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { getBundlePromise, getResponsesFromBundle } from '../../functions/DashboardFunctions';
import { WhiteCircularProgress } from '../StyledComponents/Progress.styles';
import { useQuery } from '@tanstack/react-query';
import { Bundle, QuestionnaireResponse } from 'fhir/r5';
import { SelectedQuestionnaireContext } from '../../custom-contexts/SelectedQuestionnaireContext';
import { useNavigate } from 'react-router-dom';

function ViewExistingResponsesButton() {
  const { patient } = useContext(LaunchContext);
  const { selectedQuestionnaire, setExistingResponses } = useContext(SelectedQuestionnaireContext);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // search responses from selected questionnaire
  const endpointUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  const questionnaireIdParam = selectedQuestionnaire?.resource?.id
    ? `questionnaire=${selectedQuestionnaire?.resource?.id}&`
    : '';
  const patientIdParam = patient?.id ? `patient=${patient?.id}&` : '';
  const queryUrl = '/QuestionnaireResponse?' + questionnaireIdParam + patientIdParam;
  const { data, error } = useQuery<Bundle>(
    ['existingResponses', queryUrl],
    () => getBundlePromise(endpointUrl, queryUrl),
    {
      enabled: !!selectedQuestionnaire && questionnaireIdParam !== '' && patientIdParam !== ''
    }
  );

  if (error) {
    console.error(error);
  }

  const existingResponses: QuestionnaireResponse[] = useMemo(
    () => getResponsesFromBundle(data),
    [data]
  );

  function handleClick() {
    setIsLoading(true);
    setExistingResponses(existingResponses);
    navigate('/responses');
    setIsLoading(false);
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedQuestionnaire || existingResponses.length === 0}
      endIcon={
        isLoading ? (
          <WhiteCircularProgress size={20} />
        ) : (
          <Iconify icon="material-symbols:arrow-forward" />
        )
      }
      onClick={handleClick}>
      View Responses
    </Button>
  );
}

export default ViewExistingResponsesButton;
