import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Launch from './components/Launch/Launch';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LaunchContext } from './custom-contexts/LaunchContext';
import { QuestionnaireProviderContext } from './App';
import { oauth2 } from 'fhirclient';
import { getPatient, getUser } from './functions/LaunchFunctions';
import {
  getInitialQuestionnaireFromResponse,
  getQuestionnaireFromUrl
} from './functions/LoadServerResourceFunctions';
import { isStillAuthenticating } from './functions/LaunchContextFunctions';
import ProgressSpinner from './components/Misc/ProgressSpinner';
import PageSwitcherContextProvider from './custom-contexts/PageSwitcherContext';
import QuestionnairesPage from './components/Dashboard/QuestionnairePage/QuestionnairesPage';
import ResponsesPage from './components/Dashboard/ResponsesPage/ResponsesPage';
import { SourceContextType } from './interfaces/ContextTypes';
import RendererLayout from './components/Renderer/RendererLayout';
import Form from './components/QRenderer/Form';
import FormPreview from './components/Preview/FormPreview';
import ViewerLayout from './components/Viewer/ViewerLayout';
import ResponsePreview from './components/Preview/ResponsePreview';

export const SourceContext = createContext<SourceContextType>({
  source: 'local',
  setSource: () => void 0
});

export default function Router() {
  const { fhirClient, patient, user, setFhirClient, setPatient, setUser } =
    useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const [hasClient, setHasClient] = useState<boolean | null>(null);
  const [questionnaireIsLoading, setQuestionnaireIsLoading] = useState<boolean>(true);

  const [source, setSource] = useState<'local' | 'remote'>(fhirClient ? 'remote' : 'local');

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        setFhirClient(client);
        setSource('remote');
        setHasClient(true);

        getPatient(client)
          .then((patient) => setPatient(patient))
          .catch((error) => console.error(error));

        getUser(client)
          .then((user) => setUser(user))
          .catch((error) => console.error(error));

        const questionnaireUrl = sessionStorage.getItem('questionnaireUrl');
        if (questionnaireUrl) {
          getQuestionnaireFromUrl(client, questionnaireUrl)
            .then((response) => {
              const questionnaire = getInitialQuestionnaireFromResponse(response);
              if (questionnaire) {
                questionnaireProvider.setQuestionnaire(questionnaire, false, client);
              }
              setQuestionnaireIsLoading(false);
            })
            .catch(() => setQuestionnaireIsLoading(false));
        } else {
          setQuestionnaireIsLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setQuestionnaireIsLoading(false);
        setHasClient(false);
      });
  }, []); // only authenticate once, leave dependency array empty

  const routes = useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/questionnaires" />, index: true },
        { path: 'questionnaires', element: <QuestionnairesPage /> },
        { path: 'responses', element: <ResponsesPage /> }
      ]
    },
    {
      path: '/renderer/',
      element: <RendererLayout />,
      children: [
        { path: '', element: <Form /> },
        { path: 'preview', element: <FormPreview /> }
      ]
    },
    {
      path: '/viewer/',
      element: <ViewerLayout />,
      children: [{ path: '', element: <ResponsePreview /> }]
    },
    {
      path: '/launch',
      element: <Launch />
    },
    {
      path: '*',
      element: <Navigate to="/questionnaires" replace />
    }
  ]);

  if (isStillAuthenticating(hasClient, patient, user) || questionnaireIsLoading) {
    return <ProgressSpinner message="Authorising launch" />;
  } else {
    return (
      <SourceContext.Provider value={{ source, setSource }}>
        <PageSwitcherContextProvider
          questionnairePresent={!!questionnaireProvider.questionnaire.item}>
          {routes}
        </PageSwitcherContextProvider>
      </SourceContext.Provider>
    );
  }
}
