/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useReducer } from 'react';
import { oauth2 } from 'fhirclient';
import {
  getEncounter,
  getPatient,
  getQuestionnaireContext,
  getQuestionnaireReferences,
  getUser,
  responseToQuestionnaireResource
} from '../utils/launch.ts';
import { postQuestionnaireToSMARTHealthIT } from '../../save/api/saveQr.ts';
import GoToTestLauncher from '../../../components/Snackbar/GoToTestLauncher.tsx';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { StyledRoot } from './Authorisation.styles.tsx';
import type { AuthActions, AuthState } from '../types/authorisation.interface.ts';
import RenderAuthStatus from './RenderAuthStatus.tsx';
import { assembleIfRequired } from '../../assemble/utils/assemble.ts';
import useConfigStore from '../../../stores/useConfigStore.ts';
import { setSourceQuestionnaire } from '@aehrc/smart-forms-renderer';
import useAuthRedirectHook from '../hooks/useAuthRedirectHook.ts';

function authReducer(state: AuthState, action: AuthActions): AuthState {
  switch (action.type) {
    case 'UPDATE_HAS_CLIENT':
      return { ...state, hasClient: action.payload };
    case 'UPDATE_HAS_USER':
      return { ...state, hasUser: action.payload };
    case 'UPDATE_HAS_PATIENT':
      return { ...state, hasPatient: action.payload };
    case 'UPDATE_HAS_QUESTIONNAIRE':
      return { ...state, hasQuestionnaire: action.payload };
    case 'FAIL_AUTH':
      return {
        hasClient: false,
        hasQuestionnaire: false,
        hasPatient: false,
        hasUser: false,
        errorMessage: action.payload
      };
    default:
      return state;
  }
}

const initialAuthState: AuthState = {
  hasClient: null,
  hasUser: null,
  hasPatient: null,
  hasQuestionnaire: null,
  errorMessage: null
};

function Authorisation() {
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  const setSmartClient = useConfigStore((state) => state.setSmartClient);
  const setPatient = useConfigStore((state) => state.setPatient);
  const setUser = useConfigStore((state) => state.setUser);
  const setEncounter = useConfigStore((state) => state.setEncounter);
  const setLaunchQuestionnaire = useConfigStore((state) => state.setLaunchQuestionnaire);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(
    () => {
      oauth2
        .ready()
        .then((client) => {
          // Set SMART client
          setSmartClient(client);
          sessionStorage.setItem('authorised', 'true');
          dispatch({ type: 'UPDATE_HAS_CLIENT', payload: true });

          // Set patient launch context
          getPatient(client)
            .then((patient) => {
              setPatient(patient);
              dispatch({ type: 'UPDATE_HAS_PATIENT', payload: true });
            })
            .catch((error) => {
              console.error(error);
              dispatch({ type: 'UPDATE_HAS_PATIENT', payload: false });
              enqueueSnackbar('Fail to fetch patient. Try launching the app again', {
                variant: 'error'
              });
            });

          // Set user launch context
          getUser(client)
            .then((user) => {
              setUser(user);
              dispatch({ type: 'UPDATE_HAS_USER', payload: true });
            })
            .catch((error) => {
              console.error(error);
              dispatch({ type: 'UPDATE_HAS_USER', payload: false });
              enqueueSnackbar('Fail to fetch user. Try launching the app again', {
                variant: 'error'
              });
            });

          // Set encounter launch context
          getEncounter(client)
            .then((encounter) => {
              setEncounter(encounter);
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {});

          // Set questionnaire launch context if available
          const questionnaireReferences = getQuestionnaireReferences(client);
          if (questionnaireReferences.length > 0) {
            getQuestionnaireContext(client, questionnaireReferences)
              .then((response) => {
                const questionnaire = responseToQuestionnaireResource(response);

                // return early if no matching questionnaire
                if (!questionnaire) {
                  dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
                  return;
                }

                // set questionnaire in provider context
                // perform assembly if required
                assembleIfRequired(questionnaire).then(async (questionnaire) => {
                  if (questionnaire) {
                    // Post questionnaire to client if it is SMART Health IT
                    if (
                      client.state.serverUrl.includes('https://launch.smarthealthit.org/v/r4/fhir')
                    ) {
                      questionnaire.id = questionnaire.id + '-SMARTcopy';
                      postQuestionnaireToSMARTHealthIT(client, questionnaire);
                    }

                    await setSourceQuestionnaire(questionnaire);
                    setLaunchQuestionnaire(questionnaire);
                    dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: true });
                  } else {
                    enqueueSnackbar(
                      'An error occurred while fetching initially specified questionnaire',
                      { variant: 'error' }
                    );
                    dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
                  }
                });
              })
              .catch(() => {
                enqueueSnackbar('An error occurred while fetching Questionnaire launch context', {
                  variant: 'error'
                });
                dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
              });
          } else {
            dispatch({ type: 'UPDATE_HAS_QUESTIONNAIRE', payload: false });
          }
        })
        .catch((error: Error) => {
          // Prompt user to launch app if app is unlaunched
          // Otherwise app is launched but failed, display error message
          if (
            error.message.includes("No 'state' parameter found") ||
            error.message.includes('No state found')
          ) {
            if (!window.location.pathname.startsWith('/launch')) {
              enqueueSnackbar('Intending to launch from a CMS? Try it out here!', {
                action: <GoToTestLauncher />,
                autoHideDuration: 7500,
                preventDuplicate: true
              });

              const timeout = setTimeout(() => {
                navigate('/dashboard/questionnaires');
              }, 300);

              return () => clearTimeout(timeout);
            }
          } else {
            console.error(error);
            dispatch({ type: 'FAIL_AUTH', payload: error.message });
            enqueueSnackbar('An error occurred while launching the app', { variant: 'error' });
          }
        });
    },
    // only authenticate once, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Perform redirect if launch authorisation is successful
  useAuthRedirectHook(authState);

  return (
    <StyledRoot>
      <RenderAuthStatus authState={authState} />
    </StyledRoot>
  );
}

export default Authorisation;
